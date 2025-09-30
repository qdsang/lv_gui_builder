/**
 * 选择管理插件
 * 负责管理KonvaCanvas中的元素选择功能
 */
export class SelectionPlugin {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   */
  constructor(canvas) {
    this.canvas = canvas;
  }

  /**
   * 处理元素点击事件
   * @param {string} id - 元素ID
   * @param {object} event - 点击事件
   */
  handleElementClick(id, event) {
    const evt = event.evt || event;
    
    // 检查是否按住shift键进行多选
    if (evt.shiftKey) {
      // 切换元素选择状态
      if (this.canvas.selectedElements.has(id)) {
        this.canvas.deselectElement(id);
      } else {
        this.canvas.selectElement(id, true); // 添加到现有选择
      }
    } else if (evt.metaKey || evt.ctrlKey) {
      // 检查是否按住ctrl/cmd键进行多选
      if (this.canvas.selectedElements.has(id)) {
        this.canvas.deselectElement(id);
      } else {
        this.canvas.selectElement(id, true); // 添加到现有选择
      }
    } else {
      // 单选：先取消所有选择，然后选择当前元素
      this.canvas.deselectAllElements();
      this.canvas.selectElement(id);
    }
  }

  /**
   * 选择矩形区域内的元素
   * @param {object} rect - 选择矩形
   */
  selectElementsInRect(rect) {
    const x1 = rect.x();
    const y1 = rect.y();
    const x2 = rect.x() + rect.width();
    const y2 = rect.y() + rect.height();
    
    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);
    
    // 获取当前按键状态
    const isShiftPressed = false; // 需要从EventPlugin获取状态
    
    // 如果没有按住shift键或ctrl/cmd键，则先取消所有选择
    const shouldClearSelection = !(window.event && (window.event.shiftKey || window.event.ctrlKey || window.event.metaKey));
    if (shouldClearSelection) {
      this.canvas.deselectAllElements();
    }
    
    // 遍历所有元素，检查是否在选择框内
    for (const [id, element] of this.canvas.elements) {
      let elementX, elementY, elementWidth, elementHeight;
      
      if (element.type === 'screen' && element.group) {
        const absPos = element.group.getAbsolutePosition();
        elementX = absPos.x;
        elementY = absPos.y;
        elementWidth = element.group.width();
        elementHeight = element.group.height();
      } else if (element.object) {
        const absPos = element.object.getAbsolutePosition();
        elementX = absPos.x;
        elementY = absPos.y;
        // 使用Konva的方法获取宽高
        elementWidth = typeof element.object.width === 'function' ? element.object.width() : element.object.attrs.width || 0;
        elementHeight = typeof element.object.height === 'function' ? element.object.height() : element.object.attrs.height || 0;
      } else {
        continue;
      }
      
      // 简单的碰撞检测
      if (elementX < maxX && elementX + elementWidth > minX && 
          elementY < maxY && elementY + elementHeight > minY) {
        this.canvas.selectElement(id, true); // 添加到选择中而不是替换
      }
    }
  }

  /**
   * 选中元素
   * @param {string} id - 元素ID
   * @param {boolean} addToSelection - 是否添加到现有选择中（用于多选）
   */
  selectElement(id, addToSelection = false) {
    const element = this.canvas.elements.get(id);
    if (!element) return;

    // 已经选中且不是添加到选择集中的情况
    if (this.canvas.selectedElements.has(id) && !addToSelection) {
      return;
    }

    // 如果不是添加到现有选择，则先取消所有选择
    if (!addToSelection) {
      this.canvas.deselectAllElements();
    }

    // 添加到选中集合
    this.canvas.selectedElements.add(id);
    this.canvas.container.dispatchEvent(new CustomEvent('event', { detail: { action: 'active', elementId: id } }));

    // 附加变换器到选中的元素
    let node = null;
    switch (element.type) {
      case 'screen':
        if (element.background) {
          node = element.background;
        }
        break;
      default:
        if (element.object) {
          node = element.object;
        }
        break;
    }
    
    // 如果有节点被选中，则附加变换器
    if (node) {
      // 高亮选中元素
      node.setAttrs({
        stroke: 'rgba(0,123,255,0.8)',
        strokeWidth: 2
      });
      node.getLayer().batchDraw();
      
      // 如果是单选，则附加变换器
      if (this.canvas.selectedElements.size === 1) {
        this.canvas.transformer.nodes([node]);
      } else {
        // 多选时不附加变换器
        this.canvas.transformer.nodes([]);
      }
    }
    
    // 创建或更新尺寸标签
    if (node) {
      const width = node.width();
      const height = node.height();
      const x = node.x();
      const y = node.y();
      
      // 更新尺寸标签（如果元素被选中）
      this.updateSizeLabel(element, width, height, x, y);
    }
  }

  /**
   * 取消选中元素
   * @param {string} id - 元素ID
   */
  deselectElement(id) {
    const element = this.canvas.elements.get(id);
    if (!element) return;

    // 从选中集合中移除
    this.canvas.selectedElements.delete(id);

    switch (element.type) {
      case 'screen':
        if (element.background) {
          // 移除高亮
          element.background.setAttrs({
            stroke: 'rgba(0,123,255,0)',
            strokeWidth: 1
          });
          element.background.getLayer().batchDraw();
        }
        break;
      default:
        if (element.object) {
          // 移除高亮
          element.object.setAttrs({
            stroke: 'rgba(0,123,255,0)',
            strokeWidth: 1
          });
          element.object.getLayer().batchDraw();
        }
        break;
    }
    
    // 移除尺寸标签
    if (element.sizeLabel) {
      element.sizeLabel.destroy();
      element.sizeLabel = null;
    }
    
    // 如果这是当前选中的元素，清除变换器
    if (this.canvas.selectedElements.size === 0) {
      this.canvas.transformer.nodes([]);
    } else if (this.canvas.selectedElements.size === 1) {
      // 如果只剩一个元素被选中，重新附加变换器
      const remainingId = Array.from(this.canvas.selectedElements)[0];
      const remainingElement = this.canvas.elements.get(remainingId);
      if (remainingElement) {
        let node = null;
        if (remainingElement.type === 'screen' && remainingElement.background) {
          node = remainingElement.background;
        } else if (remainingElement.object) {
          node = remainingElement.object;
        }
        
        if (node) {
          this.canvas.transformer.nodes([node]);
        }
      }
    }
  }

  /**
   * 取消所有元素的选中状态
   */
  deselectAllElements() {
    // 创建一个副本以避免在迭代时修改集合
    const selectedElementsCopy = new Set(this.canvas.selectedElements);
    
    // 取消所有选中元素
    for (const id of selectedElementsCopy) {
      this.deselectElement(id);
    }
    
    // 清空选中集合
    this.canvas.selectedElements.clear();
    
    // 清除变换器的附加节点
    this.canvas.transformer.nodes([]);
  }
  
  /**
   * 更新尺寸标签
   * @param {object} element - 元素对象
   * @param {number} width - 元素宽度
   * @param {number} height - 元素高度
   * @param {number} x - 元素x坐标
   * @param {number} y - 元素y坐标
   */
  updateSizeLabel(element, width, height, x, y) {
    // 如果没有尺寸标签，则创建一个
    if (!element.sizeLabel) {
      this.createSizeLabel(element, width, height, x, y);
      return;
    }
    
    // 更新标签文本
    const labelGroup = element.sizeLabel;
    const background = labelGroup.findOne('Rect');
    const text = labelGroup.findOne('Text');
    
    if (text) {
      text.text(`${Math.round(width)}x${Math.round(height)}`);
      
      // 重新计算背景大小
      const textWidth = text.width();
      const textHeight = text.height();
      
      if (background) {
        background.width(textWidth + 10);
        background.height(textHeight + 4);
        
        // 重新居中对齐文本
        text.x((background.width() - textWidth) / 2);
        text.y((background.height() - textHeight) / 2);
      }
      
      // 更新标签位置（在元素底部居中）
      labelGroup.x(x + (width / 2) - (background.width() / 2));
      labelGroup.y(y + height + 5);
      
      labelGroup.getLayer().batchDraw();
    }
  }
  
  /**
   * 创建尺寸标签
   * @param {object} element - 元素对象
   * @param {number} width - 元素宽度
   * @param {number} height - 元素高度
   * @param {number} x - 元素x坐标
   * @param {number} y - 元素y坐标
   */
  createSizeLabel(element, width, height, x, y) {
    // 移除现有的尺寸标签
    if (element.sizeLabel) {
      element.sizeLabel.destroy();
    }
    
    // 创建尺寸标签背景（半透明黑色）
    const labelBackground = new this.canvas.Konva.Rect({
      x: 0,
      y: 0,
      width: 60,
      height: 20,
      fill: 'rgba(0, 0, 0, 0.7)',
      cornerRadius: 4
    });
    
    // 创建尺寸标签文本（白色）
    const labelText = new this.canvas.Konva.Text({
      x: 0,
      y: 0,
      text: `${Math.round(width)}x${Math.round(height)}`,
      fontSize: 12,
      fill: 'white',
      align: 'center',
      verticalAlign: 'middle'
    });
    
    // 计算文本尺寸并调整背景大小
    const textWidth = labelText.width();
    const textHeight = labelText.height();
    labelBackground.width(textWidth + 10);
    labelBackground.height(textHeight + 4);
    
    // 居中对齐文本
    labelText.x((labelBackground.width() - textWidth) / 2);
    labelText.y((labelBackground.height() - textHeight) / 2);
    
    // 创建尺寸标签组
    const sizeLabelGroup = new this.canvas.Konva.Group({
      x: x + (width / 2) - (labelBackground.width() / 2), // 底部居中
      y: y + height + 5 // 在元素底部5像素处
    });
    
    // 添加背景和文本到组
    sizeLabelGroup.add(labelBackground);
    sizeLabelGroup.add(labelText);
    
    // 将尺寸标签添加到图层
    this.canvas.layer.add(sizeLabelGroup);
    sizeLabelGroup.getLayer().batchDraw();
    
    // 保存尺寸标签引用
    element.sizeLabel = sizeLabelGroup;
  }
}