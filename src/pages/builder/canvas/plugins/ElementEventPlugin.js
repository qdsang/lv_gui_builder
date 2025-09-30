/**
 * 元素事件处理插件
 * 负责处理KonvaCanvas中元素的修改事件
 */
export class ElementEventPlugin {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   */
  constructor(canvas) {
    this.canvas = canvas;
  }

  /**
   * 元素修改回调
   * @param {string} id - 元素ID
   * @param {object} options - 修改选项
   */
  onElementModified(id, options) {
    const element = this.canvas.elements.get(id);
    if (!element) return;
    // console.log('onElementModified', id, options);
    
    let node = element.object;
    // if (element.type === 'screen') {
    //   node = element.group;
    // }
    
    if (!node) return;
    const width = parseInt(node.width() * node.scaleX());
    const height = parseInt(node.height() * node.scaleY());
    const x = parseInt(node.x());
    const y = parseInt(node.y());

    
    // 获取变换后的尺寸
    // const scaleX = typeof node.scaleX === 'function' ? node.scaleX() : (node.attrs?.scaleX || 1);
    // const scaleY = typeof node.scaleY === 'function' ? node.scaleY() : (node.attrs?.scaleY || 1);
    // const width = parseInt((typeof node.width === 'function' ? node.width() : (node.attrs?.width || 0)) * scaleX);
    // const height = parseInt((typeof node.height === 'function' ? node.height() : (node.attrs?.height || 0)) * scaleY);
    // const x = parseInt(typeof node.x === 'function' ? node.x() : (node.attrs?.x || 0));
    // const y = parseInt(typeof node.y === 'function' ? node.y() : (node.attrs?.y || 0));
    
    
    // 更新尺寸标签（如果元素被选中）
    if (this.canvas.selectedElements.has(id)) {
      // 通过SelectionPlugin更新尺寸标签
      const selectionPlugin = this.canvas.pluginManager.getPlugin('selection');
      if (selectionPlugin) {
        selectionPlugin.updateSizeLabel(element, width, height, x, y);
      }
    }
    
    // 触发事件通知外部元素已修改
    const event = new CustomEvent('event', {
      detail: {
        action: 'transform',
        elementId: id,
        element: element,
        transform: options.transform,
        data: {
          x: x,
          y: y,
          width: width,
          height: height,
        }
      }
    });
    
    this.canvas.container.dispatchEvent(event);
  }
}