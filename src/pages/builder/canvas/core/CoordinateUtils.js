/**
 * 坐标转换工具类
 * 统一处理画布坐标转换逻辑
 */
export class CoordinateUtils {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   */
  constructor(canvas) {
    this.canvas = canvas;
  }

  /**
   * 将元素坐标转换为画布坐标
   * @param {number} x - 元素x坐标
   * @param {number} y - 元素y坐标
   * @returns {object} 画布坐标 {x, y}
   */
  elementToCanvas(x, y) {
    const scale = this.canvas.scale;
    const contentX = this.canvas.contentGroup ? this.canvas.contentGroup.x() : 0;
    const contentY = this.canvas.contentGroup ? this.canvas.contentGroup.y() : 0;
    
    return {
      x: x * scale + contentX,
      y: y * scale + contentY
    };
  }

  /**
   * 将画布坐标转换为元素坐标
   * @param {number} x - 画布x坐标
   * @param {number} y - 画布y坐标
   * @returns {object} 元素坐标 {x, y}
   */
  canvasToElement(x, y) {
    const scale = this.canvas.scale;
    const contentX = this.canvas.contentGroup ? this.canvas.contentGroup.x() : 0;
    const contentY = this.canvas.contentGroup ? this.canvas.contentGroup.y() : 0;
    
    return {
      x: (x - contentX) / scale,
      y: (y - contentY) / scale
    };
  }

  /**
   * 获取屏幕参考点坐标
   * @param {string} elementId - 元素ID
   * @returns {object|null} 屏幕参考点坐标 {x, y}
   */
  getScreenReference(elementId) {
    // 如果没有提供元素ID，尝试获取选中的元素
    if (!elementId && this.canvas.selectedElements.size > 0) {
      elementId = Array.from(this.canvas.selectedElements)[0];
    }
    
    if (!elementId) return null;
    
    const element = this.canvas.elements.get(elementId);
    if (!element) return null;
    
    // 如果选中的是屏幕元素，返回屏幕坐标
    if (element.type === 'screen' && element.group) {
      return {
        x: element.group.x(),
        y: element.group.y()
      };
    }
    
    // 如果选中的是屏幕内元素，查找其所属的屏幕
    if (element.screenId) {
      const screenElement = this.canvas.elements.get(element.screenId);
      if (screenElement && screenElement.group) {
        return {
          x: screenElement.group.x(),
          y: screenElement.group.y()
        };
      }
    }
    
    return null;
  }

  /**
   * 将元素坐标转换为相对于屏幕的坐标
   * @param {number} x - 元素x坐标
   * @param {number} y - 元素y坐标
   * @param {string} elementId - 元素ID（用于获取屏幕参考点）
   * @returns {object} 相对于屏幕的坐标 {x, y}
   */
  elementToScreenRelative(x, y, elementId) {
    const screenReference = this.getScreenReference(elementId);
    
    if (!screenReference) {
      return { x, y }; // 没有屏幕参考点，返回原始坐标
    }
    
    return {
      x: x - screenReference.x,
      y: y - screenReference.y
    };
  }

  /**
   * 将相对于屏幕的坐标转换为元素坐标
   * @param {number} x - 相对于屏幕的x坐标
   * @param {number} y - 相对于屏幕的y坐标
   * @param {string} elementId - 元素ID（用于获取屏幕参考点）
   * @returns {object} 元素坐标 {x, y}
   */
  screenRelativeToElement(x, y, elementId) {
    const screenReference = this.getScreenReference(elementId);
    
    if (!screenReference) {
      return { x, y }; // 没有屏幕参考点，返回原始坐标
    }
    
    return {
      x: x + screenReference.x,
      y: y + screenReference.y
    };
  }

  /**
   * 获取适合的标尺间隔
   * @param {number} scale - 当前缩放级别
   * @returns {number} 标尺间隔
   */
  getRulerInterval(scale) {
    // 定义标准间隔序列
    const standardIntervals = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    
    // 根据缩放级别计算合适的像素间隔
    // 目标是让标记之间的距离在30-60像素之间
    const targetPixelSpacing = 50; // 目标像素间隔
    let bestInterval = 1;
    
    // 遍历标准间隔，找到最合适的
    for (let i = 0; i < standardIntervals.length; i++) {
      const interval = standardIntervals[i];
      const pixelSpacing = interval * scale;
      
      // 如果像素间隔接近目标值，则选择该间隔
      if (pixelSpacing >= targetPixelSpacing * 0.8) {
        bestInterval = interval;
        break;
      }
    }
    
    return bestInterval;
  }
}