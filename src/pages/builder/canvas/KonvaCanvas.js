import Konva from 'konva';
import { RenderTargetManager } from './RenderTargetManager.js';
import { PluginManager } from './plugins/PluginManager.js';
import { EventPlugin } from './plugins/EventPlugin.js';
import { ElementPlugin } from './plugins/ElementPlugin.js';
import { SelectionPlugin } from './plugins/SelectionPlugin.js';
import { ElementEventPlugin } from './plugins/ElementEventPlugin.js';

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
    this.viewportX = 50;
    this.viewportY = 50;
    
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
    
    // 插件管理器
    this.pluginManager = new PluginManager(this);
    
    // 初始化插件
    this.initPlugins();
    
    // 渲染目标管理器
    this.renderTargetManager = null;
    
    // 初始化画布
    this.init();
  }
  
  /**
   * 初始化插件
   */
  initPlugins() {
    // 注册事件插件
    this.pluginManager.registerPlugin('event', new EventPlugin(this));
    
    // 注册元素管理插件
    this.pluginManager.registerPlugin('element', new ElementPlugin(this));
    
    // 注册选择管理插件
    this.pluginManager.registerPlugin('selection', new SelectionPlugin(this));
    
    // 注册元素事件插件
    this.pluginManager.registerPlugin('elementEvent', new ElementEventPlugin(this));
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
    
    // 创建图层
    this.layer = new this.Konva.Layer();
    this.stage.add(this.layer);
    
    // 初始化内容组
    this.initContentGroups();
    
    // 初始化渲染目标管理器
    this.renderTargetManager = new RenderTargetManager(this);
    
    // 绑定事件（通过插件）
    // this.bindEvents(); // 现在由EventPlugin处理
    
    // 绘制初始内容
    this.drawContent();
  }
  
  /**
   * 初始化内容组
   */
  initContentGroups() {
    // 创建屏幕组
    this.screenGroup = new this.Konva.Group({
      x: 0,
      y: 0,
      draggable: false
    });
    
    // 添加到图层
    this.layer.add(this.screenGroup);
    
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
    
    // 监听变换器的变换事件
    this.transformer.on('transform dragmove', (e) => {
      // 获取当前变换的节点
      const nodes = this.transformer.nodes();
      if (nodes.length > 0) {
        const node = nodes[0];
        // 从节点ID找到对应的元素ID并触发修改事件
        const elementId = node.id();
        if (elementId) {
          this.onElementModified(elementId, e);
        }
      }
    });
    
    // 监听变换器的变换结束事件
    this.transformer.on('transformend dragend', (e) => {
      // 获取当前变换的节点
      const nodes = this.transformer.nodes();
      if (nodes.length > 0) {
        const node = nodes[0];
        // 从节点ID找到对应的元素ID并触发修改事件
        const elementId = node.id();
        if (elementId) {
          this.onElementModified(elementId, e);
        }
      }
    });
    
    // 将变换器添加到图层
    this.layer.add(this.transformer);
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 这个方法现在由EventPlugin处理
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
  }
  
  /**
   * 重置视图
   */
  resetView() {
    this.scale = 1;
    this.viewportX = 50;
    this.viewportY = 50;
    
    this.stage.scale({ x: 1, y: 1 });
    this.stage.position({ x: this.viewportX, y: this.viewportY });
    this.layer.batchDraw();
  }
  
  /**
   * 将屏幕坐标转换为画布坐标
   * @param {number} screenX - 屏幕X坐标
   * @param {number} screenY - 屏幕Y坐标
   * @returns {object} 画布坐标
   */
  screenToCanvas(screenX, screenY) {
    const rect = this.stage.container().getBoundingClientRect();
    const canvasX = (screenX - rect.left - this.viewportX) / this.scale;
    const canvasY = (screenY - rect.top - this.viewportY) / this.scale;
    
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
    const elementPlugin = this.pluginManager.getPlugin('element');
    if (elementPlugin) {
      return elementPlugin.createElement(id, options, parentId);
    }
    return null;
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
    const elementPlugin = this.pluginManager.getPlugin('element');
    if (elementPlugin) {
      elementPlugin.removeElement(id);
    }
  }
  
  /**
   * 更新元素属性
   * @param {string} id - 元素ID
   * @param {object} properties - 元素属性
   */
  updateElement(id, properties) {
    const elementPlugin = this.pluginManager.getPlugin('element');
    if (elementPlugin) {
      elementPlugin.updateElement(id, properties);
    }
  }
  
  /**
   * 清空屏幕元素的组件
   * @param {string} screenId - 屏幕元素ID
   */
  clearScreenComponents(screenId) {
    const elementPlugin = this.pluginManager.getPlugin('element');
    if (elementPlugin) {
      elementPlugin.clearScreenComponents(screenId);
    }
  }
  
  /**
   * 处理元素点击事件
   * @param {string} id - 元素ID
   * @param {object} event - 点击事件
   */
  handleElementClick(id, event) {
    const selectionPlugin = this.pluginManager.getPlugin('selection');
    if (selectionPlugin) {
      selectionPlugin.handleElementClick(id, event);
    }
  }
  
  /**
   * 选择矩形区域内的元素
   * @param {object} rect - 选择矩形
   */
  selectElementsInRect(rect) {
    const selectionPlugin = this.pluginManager.getPlugin('selection');
    if (selectionPlugin) {
      selectionPlugin.selectElementsInRect(rect);
    }
  }
  
  /**
   * 选中元素
   * @param {string} id - 元素ID
   * @param {boolean} addToSelection - 是否添加到现有选择中（用于多选）
   */
  selectElement(id, addToSelection = false) {
    const selectionPlugin = this.pluginManager.getPlugin('selection');
    if (selectionPlugin) {
      selectionPlugin.selectElement(id, addToSelection);
    }
  }
  
  /**
   * 取消选中元素
   * @param {string} id - 元素ID
   */
  deselectElement(id) {
    const selectionPlugin = this.pluginManager.getPlugin('selection');
    if (selectionPlugin) {
      selectionPlugin.deselectElement(id);
    }
  }
  
  /**
   * 取消所有元素的选中状态
   */
  deselectAllElements() {
    const selectionPlugin = this.pluginManager.getPlugin('selection');
    if (selectionPlugin) {
      selectionPlugin.deselectAllElements();
    }
  }
  
  /**
   * 元素修改回调
   * @param {string} id - 元素ID
   * @param {object} options - 修改选项
   */
  onElementModified(id, options) {
    const elementEventPlugin = this.pluginManager.getPlugin('elementEvent');
    if (elementEventPlugin) {
      elementEventPlugin.onElementModified(id, options);
    }
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
    
    // 销毁变换器
    if (this.transformer) {
      this.transformer.destroy();
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
  }
  
  /**
   * 将画布内容居中显示
   * @param {object} options - 居中显示选项
   * @param {boolean} options.fit - 是否适应画布大小
   * @param {number} options.padding - 内边距
   */
  centerView(options = {}) {
    if (!this.stage || !this.screenGroup) return;
    
    const { fit = false, padding = 20 } = options;
    
    // 获取舞台尺寸
    const stageWidth = this.stage.width();
    const stageHeight = this.stage.height();
    
    // 获取内容边界
    const boundingBox = this.screenGroup.getClientRect();
    
    // 如果没有内容，重置视图
    if (!boundingBox || boundingBox.width === 0 || boundingBox.height === 0) {
      this.resetView();
      return;
    }
    
    // 计算内容尺寸
    const contentWidth = boundingBox.width;
    const contentHeight = boundingBox.height;
    
    // 计算缩放比例
    let scale = 1;
    if (fit) {
      // 计算适应画布的缩放比例
      const scaleX = (stageWidth - padding * 2) / contentWidth;
      const scaleY = (stageHeight - padding * 2) / contentHeight;
      scale = Math.min(scaleX, scaleY);
      
      // 限制缩放范围
      scale = Math.min(Math.max(scale, 0.1), 5);
    }
    
    // 计算居中位置
    const centerX = (stageWidth - contentWidth * scale) / 2 - boundingBox.x * scale;
    const centerY = (stageHeight - contentHeight * scale) / 2 - boundingBox.y * scale;
    
    // 应用缩放和位置
    this.scale = scale;
    this.viewportX = centerX;
    this.viewportY = centerY;
    
    this.stage.scale({ x: scale, y: scale });
    this.stage.position({ x: centerX, y: centerY });
    
    // 更新视图
    this.layer.batchDraw();
  }
  
  /**
   * 聚焦到指定元素
   * @param {string} elementId - 元素ID
   * @param {number} padding - 内边距
   */
  focusElement(elementId, padding = 50) {
    if (!this.stage) return;
    
    const element = this.elements.get(elementId);
    if (!element) return;
    
    let node = null;
    if (element.type === 'screen' && element.group) {
      node = element.group;
    } else if (element.object) {
      node = element.object;
    }
    
    if (!node) return;
    
    // 获取元素边界
    const boundingBox = node.getClientRect();
    
    // 获取舞台尺寸
    const stageWidth = this.stage.width();
    const stageHeight = this.stage.height();
    
    // 计算适应元素的缩放比例
    const scaleX = (stageWidth - padding * 2) / boundingBox.width;
    const scaleY = (stageHeight - padding * 2) / boundingBox.height;
    let scale = Math.min(scaleX, scaleY);
    
    // 限制缩放范围
    scale = Math.min(Math.max(scale, 0.1), 5);
    
    // 计算居中位置
    const centerX = (stageWidth - boundingBox.width * scale) / 2 - boundingBox.x * scale;
    const centerY = (stageHeight - boundingBox.height * scale) / 2 - boundingBox.y * scale;
    
    // 应用缩放和位置
    this.scale = scale;
    this.viewportX = centerX;
    this.viewportY = centerY;
    
    this.stage.scale({ x: scale, y: scale });
    this.stage.position({ x: centerX, y: centerY });
    
    // 更新视图
    this.layer.batchDraw();
  }
  
  /**
   * 对齐选中元素
   * @param {string} alignment - 对齐方式: 'left', 'center', 'right', 'top', 'middle', 'bottom'
   */
  alignElements(alignment) {
    if (this.selectedElements.size < 2) return;
    
    // 获取所有选中的元素
    const selectedElements = Array.from(this.selectedElements).map(id => this.elements.get(id)).filter(Boolean);
    if (selectedElements.length < 2) return;
    
    // 计算边界框
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    selectedElements.forEach(element => {
      let node = element.object;
      if (element.type === 'screen') {
        node = element.group;
      }
      
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
      let node = element.object;
      if (element.type === 'screen') {
        node = element.group;
      }
      
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
        
        // 触发修改事件
        this.onElementModified(element.id, { transform: true });
      }
    });
    
    this.layer.batchDraw();
  }
  
  /**
   * 分布选中元素
   * @param {string} distribution - 分布方式: 'horizontal', 'vertical'
   */
  distributeElements(distribution) {
    if (this.selectedElements.size < 3) return;
    
    // 获取所有选中的元素
    const selectedElements = Array.from(this.selectedElements).map(id => {
      const element = this.elements.get(id);
      if (!element) return null;
      
      let node = element.object;
      if (element.type === 'screen') {
        node = element.group;
      }
      
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
      
      // 触发修改事件
      this.onElementModified(item.element.id, { transform: true });
      
      currentPosition += distribution === 'horizontal' ? item.width + gap : item.height + gap;
    });
    
    this.layer.batchDraw();
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
}