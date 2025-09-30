/**
 * 元素事件管理器
 * 负责处理KonvaCanvas中元素的修改事件
 */
export class ElementEventManager {
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
    
    if (!node) return;
    
    const width = parseInt(node.width() * node.scaleX());
    const height = parseInt(node.height() * node.scaleY());
    const x = parseInt(node.x());
    const y = parseInt(node.y());
    // 使用新的事件系统触发事件
    this.canvas.eventSystem.emit('transform', {
      elementId: id,
      element: element,
      transform: options,
      data: {
        x: x,
        y: y,
        width: width,
        height: height
      },
      type: 'transform'
    });
  }

}
