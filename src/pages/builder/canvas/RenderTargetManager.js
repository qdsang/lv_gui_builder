import Konva from 'konva';

/**
 * 渲染目标管理器
 * 负责管理KonvaCanvas中的渲染目标
 */
export class RenderTargetManager {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.renderTargets = new Map(); // 渲染目标映射
  }

  /**
   * 为屏幕元素创建渲染目标
   * @param {string} screenId - 屏幕元素ID
   * @param {object} options - 渲染目标配置选项
   * @returns {HTMLCanvasElement} 渲染Canvas元素
   */
  createRenderTarget(screenId, options = {}) {
    const element = this.canvas.elements.get(screenId);
    if (!element || element.type !== 'screen') {
      throw new Error(`Element ${screenId} is not a screen`);
    }

    const { width = this.canvas.options.width, height = this.canvas.options.height } = options;
    
    // 创建canvas元素用于渲染
    // const renderCanvas = document.createElement('canvas');
    // renderCanvas.id = `canvas-${screenId}`;
    // renderCanvas.width = width;
    // renderCanvas.height = height;
    // renderCanvas.style.position = 'absolute';
    // renderCanvas.style.left = `0px`;
    // renderCanvas.style.top = `0px`;
    // renderCanvas.style.display = 'none'; // 隐藏该canvas
    // this.canvas.container.appendChild(renderCanvas);
    const renderCanvas = options.renderCanvas;
    
    // 创建Konva Image对象
    const konvaImage = new Konva.Image({
      x: 0,
      y: 0,
      image: renderCanvas,
      width: width,
      height: height
    });

    // 将渲染目标添加到屏幕的组件组中
    element.componentChild.add(konvaImage);
    element.componentChild.getLayer().batchDraw();
    
    // 保存渲染目标引用
    const renderTarget = {
      canvas: renderCanvas,
      konvaImage: konvaImage,
      options: options
    };
    
    element.renderTarget = renderTarget;
    this.renderTargets.set(screenId, renderTarget);

    this.autoUpdateRenderTargets();

    return renderCanvas;
  }
  
  /**
   * 获取渲染Canvas
   * @param {string} screenId - 屏幕元素ID
   * @returns {HTMLCanvasElement} 渲染Canvas元素
   */
  getRenderCanvas(screenId) {
    const element = this.canvas.elements.get(screenId);
    if (!element || element.type !== 'screen' || !element.renderTarget) {
      return null;
    }
    return element.renderTarget.canvas;
  }

  /**
   * 隐藏渲染目标
   * @param {string} screenId - 屏幕元素ID
   */
  hideRenderTarget(screenId) {
    const element = this.canvas.elements.get(screenId);
    if (!element || element.type !== 'screen' || !element.renderTarget) {
      return;
    }

    // 隐藏渲染目标
    if (element.renderTarget.konvaImage) {
      element.renderTarget.konvaImage.visible(false);
      element.renderTarget.konvaImage.getLayer().batchDraw();
    }
  }

  /**
   * 强制更新渲染目标显示
   * @param {string} screenId - 屏幕元素ID
   */
  updateRenderDisplay(screenId) {
    const element = this.canvas.elements.get(screenId);
    if (!element || element.type !== 'screen' || !element.renderTarget) return;
    
    // 只有当渲染目标内容实际发生变化时才标记为需要更新
    // 这里我们通过检查canvas是否具有新的内容来判断
    if (element.renderTarget.konvaImage) {
      element.renderTarget.konvaImage.getLayer().batchDraw();
    }
  }

  autoUpdateRenderTargets() {
    clearTimeout(this.autoUpdateRenderTargetsTimeout);
    this.autoUpdateRenderTargetsTimeout = setTimeout(() => {
      for (const screenId of this.renderTargets.keys()) {
        this.updateRenderDisplay(screenId);
      }
      this.autoUpdateRenderTargets();
    }, 100);
  }

  /**
   * 销毁渲染目标
   * @param {string} screenId - 屏幕元素ID
   */
  destroyRenderTarget(screenId) {
    const element = this.canvas.elements.get(screenId);
    if (!element || element.type !== 'screen' || !element.renderTarget) return;
    
    // 从组件组中移除
    if (element.renderTarget.konvaImage && element.componentChild) {
      element.componentChild.remove(element.renderTarget.konvaImage);
    }
    
    // 移除canvas元素
    if (element.renderTarget.canvas && this.canvas.container) {
      this.canvas.container.removeChild(element.renderTarget.canvas);
    }
    
    // 清空渲染目标引用
    element.renderTarget = null;
    this.renderTargets.delete(screenId);
  }

  /**
   * 销毁所有渲染目标
   */
  destroyAll() {
    for (const screenId of this.renderTargets.keys()) {
      this.destroyRenderTarget(screenId);
    }
    this.renderTargets.clear();
  }
}