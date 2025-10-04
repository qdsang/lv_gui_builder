import Konva from 'konva';
import { PluginInterface } from './PluginInterface.js';

/**
 * 标尺插件
 * 在画布边缘显示标尺
 */
export class RulerPlugin extends PluginInterface {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   * @param {object} options - 插件选项
   */
  constructor(canvas, options = {}) {
    super(canvas, options);
    
    this.rulerGroup = null; // 标尺组
    this.topRuler = null;
    this.leftRuler = null;
    this.topMarksGroup = null;
    this.leftMarksGroup = null;
    this.rulerSize = options.rulerSize || 20;
    this.rulerColor = options.rulerColor || '#333';
    this.textColor = options.textColor || '#333';
    this.highlightColor = options.highlightColor || 'rgba(0,123,255,0.4)';
    
    // 深色模式颜色
    this.darkMode = {
      backgroundColor: '#2d2d2d',
      rulerColor: '#444',
      textColor: '#ccc'
    };
    
    // 浅色模式颜色
    this.lightMode = {
      backgroundColor: '#f8f8f8',
      rulerColor: '#333',
      textColor: '#333'
    };
    
    // 当前模式
    this.currentMode = this.isDarkMode() ? this.darkMode : this.lightMode;
    
    // 标尺标记
    this.topMarks = [];
    this.leftMarks = [];
    
    // 高亮区域
    this.topHighlight = null;
    this.leftHighlight = null;
  }

  /**
   * 检查是否为深色模式
   * @returns {boolean} 是否为深色模式
   */
  isDarkMode() {
    // 使用useDark方式检查深色模式
    const isDark = localStorage.getItem('vueuse-color-scheme') === 'dark' ||
                  (localStorage.getItem('vueuse-color-scheme') !== 'light' && 
                   window.matchMedia('(prefers-color-scheme: dark)').matches);
    return isDark;
  }

  /**
   * 更新颜色主题
   */
  updateTheme() {
    this.currentMode = this.isDarkMode() ? this.darkMode : this.lightMode;
    
    if (this.topRuler) {
      this.topRuler.fill(this.currentMode.backgroundColor);
    }
    
    if (this.leftRuler) {
      this.leftRuler.fill(this.currentMode.backgroundColor);
    }
    
    // 更新边框线颜色
    if (this.topRulerBorder) {
      this.topRulerBorder.stroke(this.currentMode.rulerColor);
    }
    
    if (this.leftRulerBorder) {
      this.leftRulerBorder.stroke(this.currentMode.rulerColor);
    }
    
    // 更新数字标签颜色
    if (this.topStartLabel) {
      this.topStartLabel.fill(this.currentMode.textColor);
    }
    
    if (this.topEndLabel) {
      this.topEndLabel.fill(this.currentMode.textColor);
    }
    
    if (this.leftStartLabel) {
      this.leftStartLabel.fill(this.currentMode.textColor);
    }
    
    if (this.leftEndLabel) {
      this.leftEndLabel.fill(this.currentMode.textColor);
    }
    
    // 更新标记颜色
    const topChildren = this.topMarksGroup.getChildren();
    for (let i = 0; i < topChildren.length; i++) {
      const child = topChildren[i];
      if (child instanceof Konva.Text) {
        child.fill(this.currentMode.textColor);
      } else if (child instanceof Konva.Line) {
        child.stroke(this.currentMode.rulerColor);
      }
    }
    
    const leftChildren = this.leftMarksGroup.getChildren();
    for (let i = 0; i < leftChildren.length; i++) {
      const child = leftChildren[i];
      if (child instanceof Konva.Text) {
        child.fill(this.currentMode.textColor);
      } else if (child instanceof Konva.Line) {
        child.stroke(this.currentMode.rulerColor);
      }
    }
    
    // 更新高亮颜色
    this.topHighlight.fill(this.highlightColor);
    this.leftHighlight.fill(this.highlightColor);
    
    // 更新角落覆盖层颜色
    this.cornerCover.fill(this.currentMode.backgroundColor);
  }

  /**
   * 初始化插件
   */
  init() {
    this.createRulers();
    this.bindEvents();
  }

  /**
   * 创建标尺
   */
  createRulers() {
    // 创建标尺组
    this.rulerGroup = new Konva.Group({
      name: 'rulerGroup',
      x: 0,
      y: 0,
      listening: false // 标尺不响应事件
    });

    // 创建顶部标尺背景
    this.topRuler = new Konva.Rect({
      x: 0, // 改为0，占满整个宽度
      y: 0,
      width: this.canvas.stage.width(), // 改为完整宽度
      height: this.rulerSize,
      fill: this.currentMode.backgroundColor,
      stroke: null, // 移除整体边框
    });

    // 创建左侧标尺背景
    this.leftRuler = new Konva.Rect({
      x: 0,
      y: 0, // 改为0，占满整个高度
      width: this.rulerSize,
      height: this.canvas.stage.height(), // 改为完整高度
      fill: this.currentMode.backgroundColor,
      stroke: null, // 移除整体边框
    });
    
    // 为顶部标尺添加底部边框线
    this.topRulerBorder = new Konva.Line({
      points: [0, this.rulerSize, this.canvas.stage.width(), this.rulerSize],
      stroke: this.currentMode.rulerColor,
      strokeWidth: 1
    });
    
    // 为左侧标尺添加右边框线
    this.leftRulerBorder = new Konva.Line({
      points: [this.rulerSize, 0, this.rulerSize, this.canvas.stage.height()],
      stroke: this.currentMode.rulerColor,
      strokeWidth: 1
    });
    
    // 将标尺元素添加到组中
    this.rulerGroup.add(this.topRuler);
    this.rulerGroup.add(this.leftRuler);
    this.rulerGroup.add(this.topRulerBorder); // 添加顶部标尺底部边框
    this.rulerGroup.add(this.leftRulerBorder); // 添加左侧标尺右边框

    // 创建标尺标记组
    this.topMarksGroup = new Konva.Group({
      x: 0, // 改为0
      y: 0
    });
    
    this.leftMarksGroup = new Konva.Group({
      x: 0,
      y: 0 // 改为0
    });

    this.rulerGroup.add(this.topMarksGroup);
    this.rulerGroup.add(this.leftMarksGroup);

    // 创建高亮区域
    this.topHighlight = new Konva.Rect({
      x: 0, // 改为0
      y: 0,
      width: 0,
      height: this.rulerSize,
      fill: this.highlightColor,
      visible: false
    });

    this.leftHighlight = new Konva.Rect({
      x: 0,
      y: 0, // 改为0
      width: this.rulerSize,
      height: 0,
      fill: this.highlightColor,
      visible: false
    });

    this.rulerGroup.add(this.topHighlight);
    this.rulerGroup.add(this.leftHighlight);

    // 创建左上角覆盖层（半透明正方形）
    this.cornerCover = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.rulerSize,
      height: this.rulerSize,
      fill: this.currentMode.backgroundColor,
      opacity: 0.8
    });
    
    this.rulerGroup.add(this.cornerCover);

    // 将标尺组添加到固定图层
    this.canvas.fixedLayer.add(this.rulerGroup);
    this.rulerGroup.moveToBottom();

    // 绘制标尺
    this.drawRulerMarks();
  }

  /**
   * 绘制标尺标记
   */
  drawRulerMarks() {
    // 清除现有标记
    this.clearMarks();
    
    if (!this.canvas.stage) return;
    
    const scale = this.canvas.scale;
    const stageWidth = this.canvas.stage.width();
    const stageHeight = this.canvas.stage.height();
    
    // 使用坐标转换工具获取屏幕参考点
    const screenReference = this.canvas.coordinateUtils.getScreenReference();
    
    // 计算屏幕左上角在画布中的位置
    let screenCanvasX = this.canvas.contentGroup.x(); // 默认为0
    let screenCanvasY = this.canvas.contentGroup.y(); // 默认为0
    
    if (screenReference) {
      // 使用坐标转换工具将元素坐标转换为画布坐标
      const screenPos = this.canvas.coordinateUtils.elementToCanvas(
        screenReference.x, 
        screenReference.y
      );
      screenCanvasX = screenPos.x;
      screenCanvasY = screenPos.y;
    }
    
    // 使用坐标转换工具获取合适的标尺间隔
    const interval = this.canvas.coordinateUtils.getRulerInterval(scale);
    
    // 绘制顶部标尺标记
    // 计算需要绘制的范围（基于完整的舞台宽度）
    const leftExtent = Math.ceil(screenCanvasX / (interval * scale));
    const rightExtent = Math.ceil((stageWidth - screenCanvasX) / (interval * scale));
    
    // 绘制左侧的刻度（负值方向）
    for (let i = -leftExtent; i <= 0; i++) {
      const value = i * interval;
      const x = screenCanvasX + value * scale;
      
      // 确保标记在可视范围内
      if (x >= 0 && x <= stageWidth) {
        const mark = new Konva.Line({
          points: [x, this.rulerSize - 5, x, this.rulerSize],
          stroke: this.currentMode.rulerColor,
          strokeWidth: 1
        });
        
        const text = new Konva.Text({
          x: x - 8,
          y: 2,
          text: value,
          fontSize: 10,
          fill: this.currentMode.textColor,
          align: 'center',
          verticalAlign: 'middle'
        });
        
        this.topMarksGroup.add(mark);
        this.topMarksGroup.add(text);
      }
    }
    
    // 绘制右侧的刻度（正值方向）
    for (let i = 1; i <= rightExtent; i++) {
      const value = i * interval;
      const x = screenCanvasX + value * scale;
      
      // 确保标记在可视范围内
      if (x >= 0 && x <= stageWidth) {
        const mark = new Konva.Line({
          points: [x, this.rulerSize - 5, x, this.rulerSize],
          stroke: this.currentMode.rulerColor,
          strokeWidth: 1
        });
        
        const text = new Konva.Text({
          x: x - 8,
          y: 2,
          text: value,
          fontSize: 10,
          fill: this.currentMode.textColor,
          align: 'center',
          verticalAlign: 'middle'
        });
        
        this.topMarksGroup.add(mark);
        this.topMarksGroup.add(text);
      }
    }
    
    // 绘制左侧标尺标记
    // 计算需要绘制的范围（基于完整的舞台高度）
    const topExtent = Math.ceil(screenCanvasY / (interval * scale));
    const bottomExtent = Math.ceil((stageHeight - screenCanvasY) / (interval * scale));
    
    // 绘制上方的刻度（负值方向）
    for (let i = -topExtent; i <= 0; i++) {
      const value = i * interval;
      const y = screenCanvasY + value * scale;
      
      // 确保标记在可视范围内
      if (y >= 0 && y <= stageHeight) {
        const mark = new Konva.Line({
          points: [this.rulerSize - 5, y, this.rulerSize, y],
          stroke: this.currentMode.rulerColor,
          strokeWidth: 1
        });
        
        const text = new Konva.Text({
          x: 2,
          y: y + 2,
          text: value,
          fontSize: 10,
          fill: this.currentMode.textColor,
          align: 'center',
          verticalAlign: 'middle'
        });
        
        this.leftMarksGroup.add(mark);
        this.leftMarksGroup.add(text);
      }
    }
    
    // 绘制下方的刻度（正值方向）
    for (let i = 1; i <= bottomExtent; i++) {
      const value = i * interval;
      const y = screenCanvasY + value * scale;
      
      // 确保标记在可视范围内
      if (y >= 0 && y <= stageHeight) {
        const mark = new Konva.Line({
          points: [this.rulerSize - 5, y, this.rulerSize, y],
          stroke: this.currentMode.rulerColor,
          strokeWidth: 1
        });
        
        const text = new Konva.Text({
          x: 2,
          y: y + 2,
          text: value,
          fontSize: 10,
          fill: this.currentMode.textColor,
          align: 'center',
          verticalAlign: 'middle'
        });
        
        this.leftMarksGroup.add(mark);
        this.leftMarksGroup.add(text);
      }
    }
  }


  /**
   * 清除标尺标记
   */
  clearMarks() {
    // 清除顶部标记
    const topChildren = this.topMarksGroup.getChildren();
    for (let i = topChildren.length - 1; i >= 0; i--) {
      topChildren[i].destroy();
    }
    
    // 清除左侧标记
    const leftChildren = this.leftMarksGroup.getChildren();
    for (let i = leftChildren.length - 1; i >= 0; i--) {
      leftChildren[i].destroy();
    }
  }

  /**
   * 更新标尺高亮区域
   */
  updateHighlight() {
    if (!this.canvas.stage) return;
    
    if (this.canvas.selectedElements.size === 0) {
      // 无选中元素时，根据画布位置显示比例尺
      this.hideHighlight();
    } else if (this.canvas.selectedElements.size === 1) {
      // 选中单个元素时
      const elementId = Array.from(this.canvas.selectedElements)[0];
      const element = this.canvas.elements.get(elementId);
      
      if (element) {
        // 选中屏幕内元素时，根据元素位置在尺子内高亮区域
        this.showElementHighlight(element);
      }
    } else {
      // 选中多个元素时，隐藏高亮
      this.hideHighlight();
    }
  }

  /**
   * 显示元素高亮
   */
  showElementHighlight(element) {
    if (!element.object) return;

    const scale = this.canvas.scale;
    const viewportX = this.canvas.viewportX;
    const viewportY = this.canvas.viewportY;
    
    let x = element.object.x(), y = element.object.y();

    const elementRect = element.group.getClientRect({
      relativeTo: this.canvas.layer
    });
    x = elementRect.x;
    y = elementRect.y;

    // 使用坐标转换工具将元素坐标转换为画布坐标
    const elementPos = elementRect; //this.canvas.coordinateUtils.elementToCanvas(x, y);
    
    const width = elementRect.width; //element.object.width() * element.object.scaleX() * scale;
    const height = elementRect.height; //element.object.height() * element.object.scaleY() * scale;
    
    // 计算元素在标尺上的起始和结束位置
    let startX = element.object.x();
    let startY = element.object.y();
    if (element.type == 'screen') {
      startX = 0;
      startY = 0;
    }
    let endX = startX + element.object.width() * element.object.scaleX();
    let endY = startY + element.object.height() * element.object.scaleY();
    
    // 更新顶部高亮
    this.topHighlight.setAttrs({
      x: elementPos.x,
      y: this.rulerSize/2,
      width: width,
      height: this.rulerSize/2,
      visible: true
    });
    
    // 更新左侧高亮
    this.leftHighlight.setAttrs({
      x: this.rulerSize/2,
      y: elementPos.y,
      width: this.rulerSize/2,
      height: height,
      visible: true
    });
    
    // 显示顶部标尺的开始和结束数字
    if (!this.topStartLabel) {
      this.topStartLabel = new Konva.Text({
        x: elementPos.x,
        y: this.rulerSize/2,
        text: parseInt(startX),
        fontSize: 10,
        fill: this.currentMode.textColor,
        fontStyle: 'normal',
        fontFamily: 'Arial',
        align: 'center',
        width: 20,
        height: 12,
        verticalAlign: 'middle'
      });
      this.rulerGroup.add(this.topStartLabel);
    } else {
      this.topStartLabel.setAttrs({
        x: elementPos.x,
        text: parseInt(startX),
        fill: this.currentMode.textColor,
        visible: true
      });
    }
    
    if (!this.topEndLabel) {
      this.topEndLabel = new Konva.Text({
        x: elementPos.x + width,
        y: this.rulerSize/2,
        text: parseInt(endX),
        fontSize: 10,
        fill: this.currentMode.textColor,
        fontStyle: 'normal',
        fontFamily: 'Arial',
        align: 'center',
        width: 20,
        height: 12,
        verticalAlign: 'middle'
      });
      this.rulerGroup.add(this.topEndLabel);
    } else {
      this.topEndLabel.setAttrs({
        x: elementPos.x + width,
        text: parseInt(endX),
        fill: this.currentMode.textColor,
        visible: true
      });
    }
    
    if (!this.leftStartLabel) {
      this.leftStartLabel = new Konva.Text({
        x: this.rulerSize/2,
        y: elementPos.y,
        text: parseInt(startY),
        fontSize: 10,
        fill: this.currentMode.textColor,
        fontStyle: 'normal',
        fontFamily: 'Arial',
        align: 'left',
        width: 30,
        height: 12,
        verticalAlign: 'middle'
      });
      this.rulerGroup.add(this.leftStartLabel);
    } else {
      this.leftStartLabel.setAttrs({
        y: elementPos.y,
        text: parseInt(startY),
        fill: this.currentMode.textColor,
        visible: true
      });
    }
    
    if (!this.leftEndLabel) {
      this.leftEndLabel = new Konva.Text({
        x: this.rulerSize/2,
        y: elementPos.y + height,
        text: parseInt(endY),
        fontSize: 10,
        fill: this.currentMode.textColor,
        fontStyle: 'normal',
        fontFamily: 'Arial',
        align: 'left',
        width: 30,
        height: 12,
        verticalAlign: 'middle'
      });
      this.rulerGroup.add(this.leftEndLabel);
    } else {
      this.leftEndLabel.setAttrs({
        y: elementPos.y + height,
        text: parseInt(endY),
        fill: this.currentMode.textColor,
        visible: true
      });
    }
  }

  /**
   * 隐藏高亮
   */
  hideHighlight() {
    this.topHighlight.hide();
    this.leftHighlight.hide();
    
    // 隐藏数字标签和背景
    if (this.topStartLabel) this.topStartLabel.hide();
    if (this.topEndLabel) this.topEndLabel.hide();
    if (this.leftStartLabel) this.leftStartLabel.hide();
    if (this.leftEndLabel) this.leftEndLabel.hide();
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 监听画布缩放事件
    this.canvas.eventSystem.on('canvasScale', (e) => {
      // 延迟更新标尺，确保scale已经更新
      setTimeout(() => {
        this.drawRulerMarks();
        this.updateHighlight();
        this.canvas.fixedLayer.batchDraw();
      }, 10);
    });
    
    // 监听画布拖动事件
    this.canvas.eventSystem.on('canvasDragMove', (e) => {
      // 延迟更新高亮，确保位置已经更新
      setTimeout(() => {
        this.drawRulerMarks();
        this.updateHighlight();
        this.canvas.fixedLayer.batchDraw();
      }, 10);
    });
    
    // 监听选择变化事件
    this.canvas.eventSystem.on('select', (e) => {
      // 延迟更新高亮
      setTimeout(() => {
        this.drawRulerMarks();
        this.updateHighlight();
        this.canvas.fixedLayer.batchDraw();
      }, 10);
    });
    
    // 监听选择变化事件（新增）
    this.canvas.eventSystem.on('selectionChange', (e) => {
      // 延迟更新标尺
      setTimeout(() => {
        this.drawRulerMarks();
        this.updateHighlight();
        this.canvas.fixedLayer.batchDraw();
      }, 10);
    });
    
    // 监听选择变化事件（新增）
    this.canvas.eventSystem.on('transform', (e) => {
      // 延迟更新标尺
      setTimeout(() => {
        this.drawRulerMarks();
        this.updateHighlight();
        this.canvas.fixedLayer.batchDraw();
      }, 10);
    });
    
    // 监听元素变换事件，用于实时更新屏幕位置
    this.canvas.eventSystem.on('elementTransform', (e) => {
      setTimeout(() => {
        this.drawRulerMarks();
        this.updateHighlight();
        this.canvas.fixedLayer.batchDraw();
      }, 10);
    });
    
    // 监听画布尺寸变化事件
    this.canvas.eventSystem.on('canvasResize', (e) => {
      this.updateRulerSize();
    });

    this.canvas.eventSystem.on('viewChange', (e) => {
      this.updateRulerSize();
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
   * 更新标尺尺寸
   */
  updateRulerSize() {
    if (!this.canvas.stage) return;
    
    const stageWidth = this.canvas.stage.width();
    const stageHeight = this.canvas.stage.height();
    
    // 更新顶部标尺尺寸
    this.topRuler.setAttrs({
      width: stageWidth, // 改为完整宽度
      height: this.rulerSize
    });
    
    // 更新顶部标尺底部边框线
    this.topRulerBorder.setAttrs({
      points: [0, this.rulerSize, stageWidth, this.rulerSize]
    });
    
    // 更新左侧标尺尺寸
    this.leftRuler.setAttrs({
      width: this.rulerSize,
      height: stageHeight // 改为完整高度
    });
    
    // 更新左侧标尺右边框线
    this.leftRulerBorder.setAttrs({
      points: [this.rulerSize, 0, this.rulerSize, stageHeight]
    });
    
    // 更新左上角覆盖层尺寸
    this.cornerCover.setAttrs({
      width: this.rulerSize,
      height: this.rulerSize
    });
    
    // 重新绘制标记
    this.drawRulerMarks();
    this.updateHighlight();
    this.canvas.fixedLayer.batchDraw();
  }

  /**
   * 销毁插件
   */
  destroy() {
    if (this.rulerGroup) {
      this.rulerGroup.destroy();
      this.rulerGroup = null;
    }
    
    // 清理新增的边框线
    if (this.topRulerBorder) {
      this.topRulerBorder.destroy();
      this.topRulerBorder = null;
    }
    
    if (this.leftRulerBorder) {
      this.leftRulerBorder.destroy();
      this.leftRulerBorder = null;
    }
    
    // 清理新增的数字标签
    if (this.topStartLabel) {
      this.topStartLabel.destroy();
      this.topStartLabel = null;
    }
    
    if (this.topEndLabel) {
      this.topEndLabel.destroy();
      this.topEndLabel = null;
    }
    
    if (this.leftStartLabel) {
      this.leftStartLabel.destroy();
      this.leftStartLabel = null;
    }
    
    if (this.leftEndLabel) {
      this.leftEndLabel.destroy();
      this.leftEndLabel = null;
    }
    
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.handleThemeChange) {
      window.removeEventListener('theme-change', this.handleThemeChange);
    }
  }

  /**
   * 获取屏幕参考点
   * @returns {object|null} 屏幕参考点坐标
   */
  getScreenReference() {
    // 如果没有选中元素，返回null
    if (this.canvas.selectedElements.size === 0) {
      return null;
    }
    
    // 如果选中了屏幕元素，返回屏幕坐标
    if (this.canvas.selectedElements.size === 1) {
      const elementId = Array.from(this.canvas.selectedElements)[0];
      const element = this.canvas.elements.get(elementId);
      if (element && element.type === 'screen' && element.group) {
        return {
          x: element.group.x(),
          y: element.group.y(),
          element: element
        };
      }
    }
    
    // 如果选中了屏幕内元素，查找其所属的屏幕
    const elementId = Array.from(this.canvas.selectedElements)[0];
    const element = this.canvas.elements.get(elementId);
    if (element && element.screenId) {
      const screenElement = this.canvas.elements.get(element.screenId);
      if (screenElement && screenElement.group) {
        return {
          x: screenElement.group.x(),
          y: screenElement.group.y(),
          element: screenElement
        };
      }
    }
    
    return null;
  }
}