import Konva from 'konva';

class CanvasComponentGroup extends Konva.Group {
  getClientRect(config) {
    // 回退机制：查找特定名称的矩形
    const namedRect = this.findOne('.placeholder');
    return namedRect 
      ? namedRect.getClientRect(config) 
      : super.getClientRect(config);
  }

  updateSize() {
    let node = this;
    let width = node.width() * node.scaleX();
    let height = node.height() * node.scaleY();
    width = parseInt(width);
    height = parseInt(height);
    // console.log('update size', this.id(), width, height, node.scaleX(), node.scaleY())

    this.setAttrs({ width, height, scaleX: 1, scaleY: 1 });
    const namedRect = this.findOne('.placeholder');
    namedRect.setAttrs({ width, height });
  }
}

/**
 * 元素管理器
 * 负责管理KonvaCanvas中的元素创建、删除和操作
 */
export class ElementManager {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   */
  constructor(canvas) {
    this.canvas = canvas;
  }

  /**
   * 创建元素
   * @param {string} id - 元素ID
   * @param {object} options - 元素配置选项
   * @param {string} parentId - 父元素ID（可选）
   * @returns {object} 元素对象
   */
  createElement(id, options = {}, parentId = null) {
    if (this.canvas.elements.has(id)) {
      throw new Error(`Element ${id} already exists`);
    }

    let element;
    
    // 根据元素类型创建不同类型的元素
    // switch (options.type) {
    //   case 'screen':
    //     element = this.createScreenElement(id, options);
    //     break;
    //   default:
    //     element = this.createScreenComponent(id, options, parentId);
    //     break;
    // }
    element = this.createComponent(id, options, parentId);

    // 保存元素引用
    this.canvas.elements.set(id, element);

    return element;
  }

  /**
   * 创建屏幕组件
   * @param {string} id - 元素ID
   * @param {object} options - 元素配置选项
   * @param {string} parentId - 父屏幕元素ID
   * @returns {object} 屏幕组件对象
   */
  createComponent(id, options, parentId) {
    // console.log('createComponent', id, options, parentId);
    // 创建屏幕组
    const componentGroup = new CanvasComponentGroup({
      x: options.x || 0,
      y: options.y || 0,
      width: options.width || 0,
      height: options.height || 0,
      draggable: true,
      id: id
    });

    // 创建透明的组件占位符
    const placeholder = new Konva.Rect({
      x: 0,
      y: 0,
      width: options.width || 0,
      height: options.height || 0,
      fill: 'rgba(0,0,0,0)', // 透明填充
      stroke: 'rgba(0,123,255,0)', // 默认不显示边框
      strokeWidth: 1,
      draggable: false,
      name: 'placeholder',
    });

    const title = options.type === 'screen' ? id : '';
    // 创建ID文本（放在屏幕框外的左上角上方）
    const titleText = new Konva.Text({
      x: 0,
      y: -20, // 放在屏幕框上方
      text: title,
      fontSize: 14,
      fill: 'white',
      fontStyle: 'bold'
    });

    // 创建组件组（用于放置屏幕内的组件）
    const componentChild = new Konva.Group({
      x: 0,
      y: 0,
      draggable: false,
      name: 'child'
    });
    // 将背景、ID文本、尺寸标签和组件组添加到屏幕组
    componentGroup.add(placeholder);
    componentGroup.add(titleText);
    componentGroup.add(componentChild);

    let screenId = null;
    if (options.type == 'screen') {
      screenId = id;
      this.canvas.screenGroup.add(componentGroup);
    } else {
      const pElement = this.canvas.elements.get(parentId);
      // 添加到屏幕的组件组
      pElement.componentGroup.add(componentGroup);
      pElement.componentGroup.getLayer().batchDraw();
      
      screenId = pElement.screenId;
      // 保存组件引用
      // pElement.components.set(id, componentChild);
      // if (pElement.type !== 'screen') {
      //   const psElement = this.canvas.elements.get(screenId);
      //   psElement.components.set(id, componentChild);
      // }
    }

    // 创建组件对象
    const component = {
      id: id,
      type: options.type || 'component',
      group: componentGroup,
      object: placeholder,
      componentGroup: componentChild,
      componentChild: componentChild,
      titleText: titleText,
      sizeLabel: null, // 保存尺寸标签引用
      components: new Map(), // 子组件
      renderTarget: null, // 渲染目标
      options: options,
      parentId: parentId,
      screenId: screenId,
    };

    this.createScreenComponentEvent(componentGroup, placeholder, id);

    return component;
  }

  /**
   * 创建屏幕元素
   * @param {string} id - 元素ID
   * @param {object} options - 元素配置选项
   * @returns {object} 屏幕元素对象
   */
  createScreenElement(id, options = {}) {
    const {
      width = this.canvas.options.width,
      height = this.canvas.options.height
    } = options;
    
    // 创建屏幕组
    const screenGroup = new Konva.Group({
      x: options.x || 0,
      y: options.y || 0,
      width: width,
      height: height,
      draggable: true
    });

    // 创建半透明黑色
    const placeholder = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: 'rgba(0, 0, 0, 0.3)', // 半透明黑色背景
      stroke: 'rgba(0,123,255,0)', // 默认不显示边框
      strokeWidth: 1,
      id: id
    });

    // 创建ID文本（放在屏幕框外的左上角上方）
    const titleText = new Konva.Text({
      x: 0,
      y: -20, // 放在屏幕框上方
      text: id,
      fontSize: 14,
      fill: 'white',
      fontStyle: 'bold'
    });

    // 创建组件组（用于放置屏幕内的组件）
    const componentChild = new Konva.Group({
      x: 0,
      y: 0,
      draggable: false
    });

    // 将背景、ID文本、尺寸标签和组件组添加到屏幕组
    screenGroup.add(placeholder);
    screenGroup.add(titleText);
    screenGroup.add(componentChild);

    // 将屏幕组添加到屏幕内容组
    this.canvas.screenGroup.add(screenGroup);

    // 创建屏幕元素对象
    const element = {
      id: id,
      type: options.type || 'screen',
      group: screenGroup,
      object: placeholder,
      componentChild: componentChild,
      components: new Map(), // 屏幕内的组件
      titleText: titleText, // 保存标题文本引用
      sizeLabel: null, // 保存尺寸标签引用
      renderTarget: null, // 渲染目标
      options: options,
      parent: null,
    };

    this.createScreenComponentEvent(screenGroup, placeholder, id);

    return element;
  }

  /**
   * 创建屏幕组件
   * @param {string} id - 元素ID
   * @param {object} options - 元素配置选项
   * @param {string} parentId - 父屏幕元素ID
   * @returns {object} 屏幕组件对象
   */
  createScreenComponent(id, options, parentId) {
    const element = this.canvas.elements.get(parentId);
    if (!element || element.type !== 'screen') {
      throw new Error(`Element ${parentId} is not a screen`);
    }
    
    // 创建透明的组件占位符
    const placeholder = new Konva.Rect({
      x: options.x || 0,
      y: options.y || 0,
      width: options.width || 100,
      height: options.height || 100,
      fill: 'rgba(0,0,0,0)', // 透明填充
      stroke: 'rgba(0,123,255,0)', // 默认不显示边框
      strokeWidth: 1,
      draggable: true,
      id: id
    });

    // 添加到屏幕的组件组
    element.componentChild.add(placeholder);
    // element.componentChild.add(sizeLabel);
    element.componentChild.getLayer().batchDraw();
    
    // 保存组件引用
    element.components.set(id, placeholder);

    // 创建组件对象
    const component = {
      id: id,
      type: options.type || 'component',
      group: placeholder,
      object: placeholder,
      componentChild: null,
      components: new Map(), // 屏幕内的组件
      titleText: null,
      sizeLabel: null,
      renderTarget: null, // 渲染目标
      options: options,
      parent: element,
      screenId: parentId,
    };

    this.createScreenComponentEvent(placeholder, placeholder, id);

    return component;
  }

  bindMethods(component) {
    component.rect = function () {
      let rect = {};
      const absPos = this.group.getAbsolutePosition();
      rect.x = absPos.x;
      rect.y = absPos.y;
      rect.width = element.group.width();
      rect.height = element.group.height();
      return rect;
    };
  }

  createScreenComponentEvent(group, placeholder, id) {
    // 绑定鼠标悬停事件显示边框
    group.on('mouseenter', () => {
      if (!this.canvas.selectedElements.has(id)) {
        placeholder.stroke('rgba(0,123,255,0.7)');
        placeholder.strokeWidth(1);
        placeholder.getLayer().batchDraw();
      }
    });

    group.on('mouseleave', () => {
      if (!this.canvas.selectedElements.has(id)) {
        placeholder.stroke('rgba(0,123,255,0)');
        placeholder.strokeWidth(1);
        placeholder.getLayer().batchDraw();
      }
    });

    // 绑定事件
    group.on('click tap', (e) => {
      let contextMenu = this.canvas.pluginManager.getPlugin('contextMenu');
      if (e.evt.button == 2) {

      } else if (contextMenu && contextMenu.isVisible) {
        
      } else {
        e.cancelBubble = true; // 阻止事件冒泡
        this.canvas.handleElementClick(id, e);
      }
    });

    group.on('transformstart dragstart', (e) => {
      e.cancelBubble = true; // 阻止事件冒泡
      // 如果当前元素未被选中，则选中它
      if (!this.canvas.selectedElements.has(id)) {
        this.canvas.deselectAllElements();
        this.canvas.selectElement(id);
      }
    });

    // 在拖动和变换过程中都触发修改事件
    group.on('transform dragmove', (e) => {
      this.canvas.onElementModified(id, e);
    });

    // 拖动和变换结束时也触发修改事件
    group.on('transformend dragend', (e) => {
      this.canvas.onElementModified(id, e);
    });
  }

  /**
   * 删除元素
   * @param {string} id - 元素ID
   */
  removeElement(id) {
    const element = this.canvas.elements.get(id);
    if (!element) return;

    if (element.group) {
      element.group.destroy();
    }

    // 从映射中删除
    this.canvas.elements.delete(id);
    
    // 从选中集合中移除
    this.canvas.selectedElements.delete(id);
  }

  /**
   * 更新元素属性
   * @param {string} id - 元素ID
   * @param {object} properties - 元素属性
   */
  updateElement(id, properties) {
    const element = this.canvas.elements.get(id);
    if (!element) return;

    if (element.group) {
      element.group.setAttrs(properties);
      element.group.getLayer().batchDraw();
    }

    // 触发元素变换事件，通知插件更新
    this.canvas.eventSystem.emit('elementTransform', {
      elementId: id,
      action: 'transform',
      type: 'elementTransform'
    });
  }

  /**
   * 清空屏幕元素的组件
   * @param {string} screenId - 屏幕元素ID
   */
  clearScreenComponents(screenId) {
    const element = this.canvas.elements.get(screenId);
    if (!element || element.type !== 'screen') return;

    // 移除所有组件
    const components = element.componentChild.getChildren();
    for (let i = components.length - 1; i >= 0; i--) {
      const component = components[i];
      component.destroy();
    }
    
    // 清空组件映射
    element.components.clear();
    
    element.componentChild.getLayer().batchDraw();
  }
}