import Konva from 'konva';
import { RenderTargetManager } from './RenderTargetManager.js';
// 导入核心管理器
import { EventManager } from './core/EventManager.js';
import { ElementManager } from './core/ElementManager.js';
import { SelectionManager } from './core/SelectionManager.js';
import { ElementEventManager } from './core/ElementEventManager.js';
import { ViewManager } from './core/ViewManager.js';
import { AlignmentManager } from './core/AlignmentManager.js';
import { EventSystem } from './core/EventSystem.js';
import { CoordinateUtils } from './core/CoordinateUtils.js';
// 导入插件管理器
import { PluginManager } from './plugins/PluginManager.js';

/**
 * KonvaCanvas 类
 * 基于Konva.js的画布实现
 */
export class KonvaCanvas {
  /**
   * 构造函数
   * @param {HTMLElement} container - 容器元素
   * @param {object} options - 配置选项
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: 480,
      height: 480,
      isDark: false,
      ...options
    };
    
    // Konva相关
    this.stage = null;
    this.layer = null;
    this.screenGroup = null;
    this.Konva = Konva; // 保存Konva引用供其他类使用
    
    // 缩放相关
    this.scale = 1;
    this.viewportX = 0;
    this.viewportY = 0;
    
    // 拖动相关
    this.isDragging = false;
    this.isPanning = false; // 用于区分画布拖动和选择拖动
    
    // 选择相关
    this.selectedElements = new Set(); // 多选支持
    this.selectionRect = null; // 选择框
    this.isSelecting = false; // 是否正在绘制选择框
    this.transformer = null; // 变换器
    
    // 元素管理
    this.elements = new Map();
    
    // 核心管理器
    this.selectionManager = null;
    this.eventSystem = new EventSystem(this);
    this.eventManager = new EventManager(this);
    this.elementManager = new ElementManager(this);
    this.elementEventManager = new ElementEventManager(this);
    this.viewManager = new ViewManager(this);
    this.alignmentManager = new AlignmentManager(this);
    this.coordinateUtils = new CoordinateUtils(this); // 添加坐标转换工具
    
    // 插件管理器（仅用于可选插件）
    this.pluginManager = new PluginManager(this);
    
    // 渲染目标管理器
    this.renderTargetManager = null;
    
    // 初始化画布
    this.init();
    
    // // 初始化插件系统
    // this.pluginManager.init();
    
    // 设置固定图层的初始变换补偿
    if (this.fixedLayer) {
      this.fixedLayer.position({ x: -this.viewportX, y: -this.viewportY });
    }
  }
  
  /**
   * 初始化画布
   */
  init() {
    // 创建Konva舞台
    this.stage = new this.Konva.Stage({
      container: this.container,
      width: this.options.width,
      height: this.options.height
    });
    
    // 创建固定元素图层（用于标尺、网格等固定显示的元素）
    this.fixedLayer = new this.Konva.Layer({
      name: 'fixedLayer',
      listening: false // 固定图层不响应事件
    });
    
    // 创建内容图层（用于显示可缩放的内容）
    this.layer = new this.Konva.Layer({
      name: 'layer'
    });
    
    // 将图层添加到舞台
    this.stage.add(this.layer);
    this.stage.add(this.fixedLayer);
    
    // 初始化选择管理器
    this.selectionManager = new SelectionManager(this);
    
    // 初始化内容组
    this.initContentGroups();
    
    // 初始化渲染目标管理器
    this.renderTargetManager = new RenderTargetManager(this);
    
    // 初始化事件管理器
    this.eventManager.init();
    
    
    // 绘制初始内容
    this.drawContent();
  }
  
  updateCanvasSize(width, height) {
    // 更新画布尺寸
    this.stage.width(width);
    this.stage.height(height);
    this.options.width = width;
    this.options.height = height;
    this.layer.batchDraw();

    // 通知插件画布尺寸已更新
    this.eventSystem.emit('canvasResize', { width, height });
  }

  /**
   * 初始化内容组
   */
  initContentGroups() {
    // 创建内容组（用于缩放和移动内容）
    this.contentGroup = new this.Konva.Group({
      name: 'contentGroup',
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1
    });
    
    // 创建屏幕组
    this.screenGroup = new this.Konva.Group({
      name: 'screenGroup',
      x: 0,
      y: 0,
      draggable: false
    });
    
    // 将屏幕组添加到内容组
    this.contentGroup.add(this.screenGroup);
    
    // 将内容组添加到内容图层
    this.layer.add(this.contentGroup);
    
    // 创建变换器
    this.transformer = new this.Konva.Transformer({
      resizeEnabled: true,
      rotateEnabled: false, // 禁用旋转
      keepRatio: false, // 不保持比例
      anchorSize: 6,
      borderEnabled: false,
      enabledAnchors: [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right'
      ]
    });
    
    let transformerUpdateNode = (e) => { 
      const nodes = this.transformer.nodes();
      if (nodes.length > 0) {
        // 遍历所有节点并触发修改事件
        for (const node of nodes) {
          const elementId = node.id();
          if (elementId) {
            this.onElementModified(elementId, e);
          }
        }
      }
    };

    // 监听元素的变换结束事件, 结束后将缩放更新为宽高
    let transformerUpdateSize = (e) => { 
      const nodes = this.transformer.nodes();
      if (nodes.length > 0) {
        // 遍历所有节点并触发修改事件
        for (const node of nodes) {
          node.updateSize();
        }
      }
    };

    // 监听变换器的变换事件
    this.transformer.on('transform dragmove', (e) => {
      transformerUpdateNode(e);
    });

    // 监听变换器的变换结束事件
    this.transformer.on('transformend dragend', (e) => {
      transformerUpdateSize(e);
      transformerUpdateNode(e);
    });
    
    // 将变换器添加到内容图层
    this.layer.add(this.transformer);
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 事件绑定现在由EventManager处理
  }
  
  /**
   * 绘制内容
   */
  drawContent() {
    this.drawScreen();
  }
  
  /**
   * 绘制屏幕
   */
  drawScreen() {
    if (!this.screenGroup) return;
    
    // 更新位置和大小
    this.updateScreenTransform();
  }
  
  /**
   * 更新屏幕变换
   */
  updateScreenTransform() {
    // 屏幕变换已经通过stage处理
  }
  
  /**
   * 更新视图
   */
  updateView() {
    this.updateScreenTransform();
    this.layer.batchDraw();
    if (this.fixedLayer) {
      this.fixedLayer.batchDraw();
    }
  }
  
  /**
   * 重置视图
   */
  resetView() {
    this.scale = 1;
    this.viewportX = 0;
    this.viewportY = 0;
    
    // 重置内容组的缩放和位置而不是舞台
    if (this.contentGroup) {
      this.contentGroup.scale({ x: 1, y: 1 });
      this.contentGroup.position({ x: this.viewportX, y: this.viewportY });
    }
    
    this.layer.batchDraw();
    if (this.fixedLayer) {
      this.fixedLayer.batchDraw();
    }
  }
  
  /**
   * 将屏幕坐标转换为画布坐标
   * @param {number} screenX - 屏幕X坐标
   * @param {number} screenY - 屏幕Y坐标
   * @returns {object} 画布坐标
   */
  screenToCanvas(screenX, screenY) {
    // 获取内容组的绝对位置
    const contentPos = this.contentGroup.absolutePosition();
    
    // 计算相对于内容组的位置，考虑缩放因素
    const canvasX = (screenX - contentPos.x) / this.contentGroup.scaleX();
    const canvasY = (screenY - contentPos.y) / this.contentGroup.scaleY();
    
    return { x: canvasX, y: canvasY };
  }
  
  /**
   * 创建元素
   * @param {string} id - 元素ID
   * @param {object} options - 元素配置选项
   * @param {string} parentId - 父元素ID（可选）
   * @returns {object} 元素对象
   */
  createElement(id, options = {}, parentId = null) {
    return this.elementManager.createElement(id, options, parentId);
  }
  
  /**
   * 获取元素
   * @param {string} id - 元素ID
   * @returns {object} 元素对象
   */
  getElement(id) {
    return this.elements.get(id);
  }
  
  /**
   * 删除元素
   * @param {string} id - 元素ID
   */
  removeElement(id) {
    this.elementManager.removeElement(id);
  }
  
  /**
   * 更新元素属性
   * @param {string} id - 元素ID
   * @param {object} properties - 元素属性
   */
  updateElement(id, properties) {
    this.elementManager.updateElement(id, properties);
  }
  
  /**
   * 清空屏幕元素的组件
   * @param {string} screenId - 屏幕元素ID
   */
  clearScreenComponents(screenId) {
    this.elementManager.clearScreenComponents(screenId);
  }
  
  /**
   * 处理元素点击事件
   * @param {string} id - 元素ID
   * @param {object} event - 点击事件
   */
  handleElementClick(id, event) {
    this.selectionManager.handleElementClick(id, event);
  }
  
  /**
   * 选择矩形区域内的元素
   * @param {object} rect - 选择矩形
   */
  selectElementsInRect(rect) {
    this.selectionManager.selectElementsInRect(rect);
  }
  
  /**
   * 选中元素
   * @param {string} id - 元素ID
   * @param {boolean} addToSelection - 是否添加到现有选择中（用于多选）
   */
  selectElement(id, addToSelection = false) {
    this.selectionManager.selectElement(id, addToSelection);
  }
  
  /**
   * 取消选中元素
   * @param {string} id - 元素ID
   */
  deselectElement(id) {
    this.selectionManager.deselectElement(id);
  }
  
  /**
   * 取消所有元素的选中状态
   */
  deselectAllElements() {
    this.selectionManager.deselectAllElements();
  }
  
  /**
   * 元素修改回调
   * @param {string} id - 元素ID
   * @param {object} options - 修改选项
   */
  onElementModified(id, options) {
    this.elementEventManager.onElementModified(id, options);
  }
  
  /**
   * 销毁画布
   */
  destroy() {
    // 销毁所有元素
    for (const id of this.elements.keys()) {
      this.removeElement(id);
    }
    this.elements.clear();
    
    // 销毁渲染目标
    if (this.renderTargetManager) {
      this.renderTargetManager.destroyAll();
    }
    
    // 销毁事件管理器
    if (this.eventManager) {
      this.eventManager.destroy();
    }
    
    // 销毁变换器
    if (this.transformer) {
      this.transformer.destroy();
    }
    
    // 销毁内容图层
    if (this.layer) {
      this.layer.destroy();
    }
    
    // 销毁固定图层
    if (this.fixedLayer) {
      this.fixedLayer.destroy();
    }
    
    // 销毁Konva舞台
    if (this.stage) {
      this.stage.destroy();
    }
    
    // 销毁插件
    if (this.pluginManager) {
      this.pluginManager.destroy();
    }
  }
  
  /**
   * 设置主题模式
   * @param {boolean} isDark - 是否为暗黑模式
   */
  setDarkMode(isDark) {
    this.options.isDark = isDark;
    
    // 更新画布背景色
    if (this.stage) {
      this.stage.container().style.backgroundColor = isDark ? '#1e1e1e' : '#e0e0e0';
    }
    
    this.layer.batchDraw();
    // 触发视图变更事件
    this.eventSystem.emit('viewChange', { theme: isDark ? 'dark' : 'light' });
  }
  
  centerView(options) {
    this.viewManager.centerView(options);
  }
  
  /**
   * 聚焦到指定元素
   * @param {string} elementId - 元素ID
   * @param {number} padding - 内边距
   */
  focusElement(elementId, padding = 50) {
    this.viewManager.focusElement(elementId, padding);
  }
  
  /**
   * 对齐选中元素
   * @param {string} alignment - 对齐方式: 'left', 'center', 'right', 'top', 'middle', 'bottom'
   */
  alignElements(alignment) {
    this.alignmentManager.alignElements(alignment);
  }
  
  /**
   * 分布选中元素
   * @param {string} distribution - 分布方式: 'horizontal', 'vertical'
   */
  distributeElements(distribution) {
    this.alignmentManager.distributeElements(distribution);
  }
  
  // 代理渲染目标管理器的方法
  createRenderTarget(screenId, options) {
    return this.renderTargetManager.createRenderTarget(screenId, options);
  }
  
  getRenderCanvas(screenId) {
    return this.renderTargetManager.getRenderCanvas(screenId);
  }
  
  activateRenderTargetDisplay(screenId) {
    return this.renderTargetManager.activateRenderTargetDisplay(screenId);
  }
  
  updateRenderTargetSize(screenId, options) {
    return this.renderTargetManager.updateRenderTargetSize(screenId, options);
  }
  
  updateRenderDisplay(screenId) {
    return this.renderTargetManager.updateRenderDisplay(screenId);
  }
  
  // 事件系统方法代理
  /**
   * 添加事件监听器
   * @param {string} eventType - 事件类型
   * @param {function} callback - 回调函数
   */
  on(eventType, callback) {
    this.eventSystem.on(eventType, callback);
  }
  
  /**
   * 移除事件监听器
   * @param {string} eventType - 事件类型
   * @param {function} callback - 回调函数
   */
  off(eventType, callback) {
    this.eventSystem.off(eventType, callback);
  }
}