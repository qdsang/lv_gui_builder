/**
 * 视图管理器
 * 负责处理KonvaCanvas中的视图相关功能，如居中显示、聚焦元素等
 */
export class ViewManager {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   */
  constructor(canvas) {
    this.canvas = canvas;
  }

  /**
   * 将画布内容居中显示
   * @param {object} options - 居中显示选项
   * @param {boolean} options.fit - 是否适应画布大小
   * @param {number} options.padding - 内边距
   */
  centerView(options = {}) {
    if (!this.canvas.contentGroup || !this.canvas.screenGroup) return;

    const { fit = true, padding = 80 } = options;
    
    this.canvas.resetView();

    // 获取舞台尺寸
    const stageWidth = this.canvas.stage.width();
    const stageHeight = this.canvas.stage.height();

    // 获取内容边界
    const boundingBox = this.canvas.screenGroup.getClientRect();

    // 如果没有内容，重置视图
    if (!boundingBox || boundingBox.width === 0 || boundingBox.height === 0) {
      this.canvas.resetView();
      return;
    }

    // 计算内容尺寸
    const contentWidth = boundingBox.width;
    const contentHeight = boundingBox.height;

    // 计算缩放比例
    let scale = 1;
    if (fit) {
      // 计算适应画布的缩放比例
      const scaleX = (stageWidth - padding * 2) / contentWidth;
      const scaleY = (stageHeight - padding * 2) / contentHeight;
      scale = Math.min(scaleX, scaleY);

      // 限制缩放范围
      scale = Math.min(Math.max(scale, 0.1), 5);
    }

    // 计算居中位置
    const centerX = (stageWidth - contentWidth * scale) / 2 - boundingBox.x * scale;
    const centerY = (stageHeight - contentHeight * scale) / 2 - boundingBox.y * scale;

    // 应用缩放和位置到内容组
    this.canvas.scale = scale;
    this.canvas.viewportX = centerX;
    this.canvas.viewportY = centerY;

    this.canvas.contentGroup.scale({ x: scale, y: scale });
    this.canvas.contentGroup.position({ x: centerX, y: centerY });

    // 更新视图
    this.canvas.layer.batchDraw();
    
    // 触发画布视图变更事件
    this.canvas.eventSystem.emit('viewChange', {
      action: 'centerView',
      scale: this.canvas.scale,
      viewportX: this.canvas.viewportX,
      viewportY: this.canvas.viewportY
    });
  }

  /**
   * 聚焦到指定元素
   * @param {string} elementId - 元素ID
   * @param {number} padding - 内边距
   */
  focusElement(elementId, padding = 50) {
    if (!this.canvas.contentGroup) return;

    const element = this.canvas.elements.get(elementId);
    if (!element) return;

    let node = element.group;

    if (!node) return;

    // 获取元素边界
    const boundingBox = node.getClientRect();

    // 获取舞台尺寸
    const stageWidth = this.canvas.stage.width();
    const stageHeight = this.canvas.stage.height();

    // 计算适应元素的缩放比例
    const scaleX = (stageWidth - padding * 2) / boundingBox.width;
    const scaleY = (stageHeight - padding * 2) / boundingBox.height;
    let scale = Math.min(scaleX, scaleY);

    // 限制缩放范围
    scale = Math.min(Math.max(scale, 0.1), 5);

    // 计算居中位置
    const centerX = (stageWidth - boundingBox.width * scale) / 2 - boundingBox.x * scale;
    const centerY = (stageHeight - boundingBox.height * scale) / 2 - boundingBox.y * scale;

    // 应用缩放和位置到内容组
    this.canvas.scale = scale;
    this.canvas.viewportX = centerX;
    this.canvas.viewportY = centerY;

    this.canvas.contentGroup.scale({ x: scale, y: scale });
    this.canvas.contentGroup.position({ x: centerX, y: centerY });

    // 更新视图
    this.canvas.layer.batchDraw();
    
    // 触发画布视图变更事件
    this.canvas.eventSystem.emit('viewChange', {
      action: 'focusElement',
      elementId,
      scale: this.canvas.scale,
      viewportX: this.canvas.viewportX,
      viewportY: this.canvas.viewportY
    });
  }

  /**
   * 更新视图
   * @param {number} scale - 缩放级别
   * @param {number} viewportX - 视口X坐标
   * @param {number} viewportY - 视口Y坐标
   */
  updateView(scale, viewportX, viewportY) {
    // 更新画布属性
    if (scale !== undefined) this.canvas.scale = scale;
    if (viewportX !== undefined) this.canvas.viewportX = viewportX;
    if (viewportY !== undefined) this.canvas.viewportY = viewportY;
    
    // 更新内容组的缩放和位置
    if (this.canvas.contentGroup) {
      this.canvas.contentGroup.scale({ x: this.canvas.scale, y: this.canvas.scale });
      this.canvas.contentGroup.position({ x: this.canvas.viewportX, y: this.canvas.viewportY });
    }
    
    // 更新固定图层的坐标补偿（反向移动以保持固定位置）
    if (this.canvas.fixedLayer) {
      this.canvas.fixedLayer.position({ 
        x: -this.canvas.viewportX, 
        y: -this.canvas.viewportY 
      });
      
      // 更新固定图层的缩放补偿（反向缩放以保持固定大小）
      const compensationScale = 1 / this.canvas.scale;
      this.canvas.fixedLayer.scale({ 
        x: compensationScale, 
        y: compensationScale 
      });
    }
    
    // 重新绘制所有图层
    this.canvas.layer.batchDraw();
    if (this.canvas.fixedLayer) {
      this.canvas.fixedLayer.batchDraw();
    }
    
    // 触发画布视图变更事件
    this.canvas.eventSystem.emit('viewChange', {
      scale: this.canvas.scale,
      viewportX: this.canvas.viewportX,
      viewportY: this.canvas.viewportY,
      type: 'viewChange'
    });
  }
}