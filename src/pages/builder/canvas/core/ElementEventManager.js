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
    
    let node = element.group;
    
    if (!node) return;
    
    const elementRect = element.object.getClientRect({
      relativeTo: this.canvas.contentGroup  // 相对于图层坐标
    });
    // const width = parseInt(elementRect.width);
    // const height = parseInt(elementRect.height);
    // const x = parseInt(elementRect.x);
    // const y = parseInt(elementRect.y);
    const width = parseInt(node.width() * node.scaleX());
    const height = parseInt(node.height() * node.scaleY());
    let x = parseInt(node.x());
    let y = parseInt(node.y());

    // TODO: temp
    if (element.type === 'screen') {
      x = 0;
      y = 0;
    }

    // console.log('onElementModified', id, options, elementRect, width, height, x, y);

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
