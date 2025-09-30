/**
 * 对齐管理器
 * 负责处理KonvaCanvas中元素的对齐和分布功能
 */
export class AlignmentManager {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   */
  constructor(canvas) {
    this.canvas = canvas;
  }

  /**
   * 对齐选中元素
   * @param {string} alignment - 对齐方式: 'left', 'center', 'right', 'top', 'middle', 'bottom'
   */
  alignElements(alignment) {
    if (this.canvas.selectedElements.size < 2) return;

    // 获取所有选中的元素
    const selectedElements = Array.from(this.canvas.selectedElements).map(id => this.canvas.elements.get(id)).filter(Boolean);
    if (selectedElements.length < 2) return;

    // 计算边界框
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedElements.forEach(element => {
      let node = element.group;

      if (node) {
        const x = typeof node.x === 'function' ? node.x() : (node.attrs?.x || 0);
        const y = typeof node.y === 'function' ? node.y() : (node.attrs?.y || 0);
        const width = typeof node.width === 'function' ? node.width() : (node.attrs?.width || 0);
        const height = typeof node.height === 'function' ? node.height() : (node.attrs?.height || 0);

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      }
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // 对齐元素
    selectedElements.forEach(element => {
      let node = element.group;

      if (node) {
        const width = typeof node.width === 'function' ? node.width() : (node.attrs?.width || 0);
        const height = typeof node.height === 'function' ? node.height() : (node.attrs?.height || 0);
        let newX = typeof node.x === 'function' ? node.x() : (node.attrs?.x || 0);
        let newY = typeof node.y === 'function' ? node.y() : (node.attrs?.y || 0);

        switch (alignment) {
          case 'left':
            newX = minX;
            break;
          case 'center':
            newX = centerX - width / 2;
            break;
          case 'right':
            newX = maxX - width;
            break;
          case 'top':
            newY = minY;
            break;
          case 'middle':
            newY = centerY - height / 2;
            break;
          case 'bottom':
            newY = maxY - height;
            break;
        }

        // 更新元素位置
        node.setAttrs({ x: newX, y: newY });

        // 使用新的事件系统触发修改事件
        this.canvas.eventSystem.emit('transform', { elementId: item.element.id, transform: true });
      }
    });

    this.canvas.layer.batchDraw();
    
    // 使用新的事件系统触发视图变更事件
    this.canvas.eventSystem.emit('viewChange', { action: 'alignElements', alignment });
  }

  /**
   * 分布选中元素
   * @param {string} distribution - 分布方式: 'horizontal', 'vertical'
   */
  distributeElements(distribution) {
    if (this.canvas.selectedElements.size < 3) return;

    // 获取所有选中的元素
    const selectedElements = Array.from(this.canvas.selectedElements).map(id => {
      const element = this.canvas.elements.get(id);
      if (!element) return null;

      let node = element.group;

      if (!node) return null;

      const x = typeof node.x === 'function' ? node.x() : (node.attrs?.x || 0);
      const y = typeof node.y === 'function' ? node.y() : (node.attrs?.y || 0);
      const width = typeof node.width === 'function' ? node.width() : (node.attrs?.width || 0);
      const height = typeof node.height === 'function' ? node.height() : (node.attrs?.height || 0);

      return {
        element,
        node,
        x,
        y,
        width,
        height,
        centerX: x + width / 2,
        centerY: y + height / 2
      };
    }).filter(Boolean);

    if (selectedElements.length < 3) return;

    // 按位置排序
    if (distribution === 'horizontal') {
      selectedElements.sort((a, b) => a.x - b.x);
    } else {
      selectedElements.sort((a, b) => a.y - b.y);
    }

    // 计算总尺寸和间隔
    const first = selectedElements[0];
    const last = selectedElements[selectedElements.length - 1];

    let totalSize = 0;
    selectedElements.forEach(item => {
      totalSize += distribution === 'horizontal' ? item.width : item.height;
    });

    const start = distribution === 'horizontal' ? first.x : first.y;
    const end = distribution === 'horizontal' ? (last.x + last.width) : (last.y + last.height);
    const availableSpace = end - start - totalSize;
    const gap = availableSpace / (selectedElements.length - 1);

    // 分布元素
    let currentPosition = distribution === 'horizontal' ? first.x : first.y;
    selectedElements.forEach((item, index) => {
      if (index === 0) {
        // 第一个元素保持原位
        currentPosition += distribution === 'horizontal' ? item.width + gap : item.height + gap;
        return;
      }

      if (index === selectedElements.length - 1) {
        // 最后一个元素保持原位
        return;
      }

      // 更新中间元素位置
      if (distribution === 'horizontal') {
        item.node.setAttrs({ x: currentPosition });
      } else {
        item.node.setAttrs({ y: currentPosition });
      }

      // 使用新的事件系统触发修改事件
      this.canvas.eventSystem.emit('transform', { elementId: item.element.id, transform: true });

      currentPosition += distribution === 'horizontal' ? item.width + gap : item.height + gap;
    });

    this.canvas.layer.batchDraw();
    
    // 使用新的事件系统触发视图变更事件
    this.canvas.eventSystem.emit('viewChange', { action: 'distributeElements', distribution });
  }
}