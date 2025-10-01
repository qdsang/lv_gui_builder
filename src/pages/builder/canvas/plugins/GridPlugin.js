import Konva from 'konva';
import { PluginInterface } from './PluginInterface.js';

/**
 * 网格插件
 * 在画布上显示网格线
 */
export class GridPlugin extends PluginInterface {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   * @param {object} options - 插件选项
   */
  constructor(canvas, options = {}) {
    super(canvas, options);
    
    this.gridGroup = null;
    this.gridLines = [];
    this.gridSize = options.gridSize || 20;
    this.gridColor = options.gridColor || 'rgba(200, 200, 200, 0.5)';
    this.snapToGrid = options.snapToGrid || false;
    
    // 深色模式颜色
    this.darkMode = {
      gridColor: 'rgba(100, 100, 100, 0.5)'
    };
    
    // 浅色模式颜色
    this.lightMode = {
      gridColor: 'rgba(200, 200, 200, 0.5)'
    };
    
    // 当前模式
    this.currentMode = this.isDarkMode() ? this.darkMode : this.lightMode;
  }

  /**
   * 检查是否为深色模式
   * @returns {boolean} 是否为深色模式
   */
  isDarkMode() {
    return document.documentElement.classList.contains('dark') || 
           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  /**
   * 更新颜色主题
   */
  updateTheme() {
    this.currentMode = this.isDarkMode() ? this.darkMode : this.lightMode;
    // 重新绘制网格以应用新颜色
    this.clearGridLines();
    this.drawGridLines();
  }

  /**
   * 初始化插件
   */
  init() {
    this.createGrid();
    this.bindEvents();
  }

  /**
   * 创建网格
   */
  createGrid() {
    // 创建网格组
    this.gridGroup = new Konva.Group({
      name: 'gridGroup',
      x: 0,
      y: 0,
      listening: false // 网格不响应事件
    });

    // 绘制网格线
    this.drawGridLines();

    // 将网格组添加到固定图层
    this.canvas.fixedLayer.add(this.gridGroup);
    
    // 确保网格组在标尺组之上，但在内容组之下
    this.gridGroup.moveUp();
  }

  /**
   * 绘制网格线
   */
  drawGridLines() {
    if (!this.canvas.stage) return;
    
    const stageWidth = this.canvas.stage.width();
    const stageHeight = this.canvas.stage.height();
    const scale = this.canvas.scale;
    
    // 根据缩放调整网格密度
    let gridSize = this.gridSize;
    if (scale < 0.5) gridSize *= 2;
    else if (scale > 2) gridSize /= 2;
    
    // 绘制垂直线
    for (let x = 0; x <= stageWidth; x += gridSize) {
      const line = new Konva.Line({
        points: [x, 0, x, stageHeight],
        stroke: this.currentMode.gridColor,
        strokeWidth: 1
      });
      this.gridGroup.add(line);
      this.gridLines.push(line);
    }
    
    // 绘制水平线
    for (let y = 0; y <= stageHeight; y += gridSize) {
      const line = new Konva.Line({
        points: [0, y, stageWidth, y],
        stroke: this.currentMode.gridColor,
        strokeWidth: 1
      });
      this.gridGroup.add(line);
      this.gridLines.push(line);
    }
  }

  /**
   * 清除网格线
   */
  clearGridLines() {
    for (let i = this.gridLines.length - 1; i >= 0; i--) {
      this.gridLines[i].destroy();
    }
    this.gridLines = [];
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 监听画布缩放事件
    this.canvas.eventSystem.on('canvasScale', (e) => {
      // 延迟更新网格，确保scale已经更新
      setTimeout(() => {
        this.clearGridLines();
        this.drawGridLines();
        this.canvas.fixedLayer.batchDraw();
      }, 10);
    });
    
    // 监听画布拖动事件
    this.canvas.eventSystem.on('canvasDragMove', (e) => {
      this.canvas.fixedLayer.batchDraw();
    });
    
    // 监听画布尺寸变化事件
    this.canvas.eventSystem.on('canvasResize', (e) => {
      this.clearGridLines();
      this.drawGridLines();
      this.canvas.fixedLayer.batchDraw();
    });
    
    // 监听主题变化事件
    this.handleThemeChange = () => {
      this.updateTheme();
      this.canvas.fixedLayer.batchDraw();
    };
    
    window.addEventListener('theme-change', this.handleThemeChange);
    // 也可以监听DOM变化来检测主题变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (document.documentElement.classList.contains('dark') || 
              document.documentElement.classList.contains('light')) {
            this.updateTheme();
            this.canvas.fixedLayer.batchDraw();
          }
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    this.observer = observer;
  }

  /**
   * 吸附到网格
   * @param {number} value - 原始值
   * @returns {number} 吸附后的值
   */
  snap(value) {
    if (!this.snapToGrid) return value;
    return Math.round(value / this.gridSize) * this.gridSize;
  }

  /**
   * 销毁插件
   */
  destroy() {
    if (this.gridGroup) {
      this.gridGroup.destroy();
      this.gridGroup = null;
    }
    
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.handleThemeChange) {
      window.removeEventListener('theme-change', this.handleThemeChange);
    }
  }
}