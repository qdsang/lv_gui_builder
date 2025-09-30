import { PluginInterface } from './PluginInterface.js';

/**
 * 右键菜单插件
 * 在画布上提供右键菜单功能
 */
export class ContextMenuPlugin extends PluginInterface {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   * @param {object} options - 插件选项
   */
  constructor(canvas, options = {}) {
    super(canvas, options);
    
    this.menu = null;
    this.isVisible = false;
    this.currentElement = null;
    this.observer = null;
    this.handleThemeChange = null;
    
    // 默认菜单项
    this.defaultMenuItems = [
      {
        text: '复制',
        action: 'copy',
        shortcut: 'Ctrl+C',
        condition: (element) => element !== null
      },
      {
        text: '粘贴',
        action: 'paste',
        shortcut: 'Ctrl+V',
        condition: () => this.hasClipboardData()
      },
      {
        text: '删除',
        action: 'delete',
        shortcut: 'Del',
        condition: (element) => element !== null
      },
      {
        separator: true,
        condition: (element) => element !== null
      },
      {
        text: '左对齐',
        action: 'alignLeft',
        condition: (element) => this.hasMultipleElementsSelected()
      },
      {
        text: '居中对齐',
        action: 'alignCenter',
        condition: (element) => this.hasMultipleElementsSelected()
      },
      {
        text: '右对齐',
        action: 'alignRight',
        condition: (element) => this.hasMultipleElementsSelected()
      },
      {
        text: '顶部对齐',
        action: 'alignTop',
        condition: (element) => this.hasMultipleElementsSelected()
      },
      {
        text: '垂直居中',
        action: 'alignMiddle',
        condition: (element) => this.hasMultipleElementsSelected()
      },
      {
        text: '底部对齐',
        action: 'alignBottom',
        condition: (element) => this.hasMultipleElementsSelected()
      },
      {
        separator: true,
        condition: (element) => element !== null && this.hasMultipleElementsSelected()
      },
      {
        text: '居中视图',
        action: 'centerView',
        condition: () => true
      },
      {
        text: '重置视图',
        action: 'resetView',
        condition: () => true
      }
    ];
    
    // 合并用户提供的菜单项
    this.menuItems = options.menuItems ? 
      [...this.defaultMenuItems, ...options.menuItems] : 
      this.defaultMenuItems;
  }
  
  /**
   * 检查是否为深色模式
   * @returns {boolean} 是否为深色模式
   */
  isDarkMode() {
    // 使用与项目其他部分一致的深色模式检测逻辑
    const isDark = localStorage.getItem('vueuse-color-scheme') === 'dark' ||
                  (localStorage.getItem('vueuse-color-scheme') !== 'light' && 
                   window.matchMedia('(prefers-color-scheme: dark)').matches);
    return isDark;
  }
  
  /**
   * 更新主题样式
   */
  updateTheme() {
    if (!this.menu) return;
    
    if (this.isDarkMode()) {
      // 深色模式样式
      this.menu.style.backgroundColor = '#2d2d2d';
      this.menu.style.borderColor = '#444';
      this.menu.style.color = '#ccc';
      
      // 更新所有菜单项的样式
      const menuItems = this.menu.querySelectorAll('.context-menu-item');
      menuItems.forEach(item => {
        item.style.color = '#ccc';
        const shortcut = item.querySelector('span:last-child');
        if (shortcut) {
          shortcut.style.color = '#999';
        }
      });
      
      // 更新分隔线样式
      const separators = this.menu.querySelectorAll('hr');
      separators.forEach(separator => {
        separator.style.borderColor = '#444';
      });
    } else {
      // 浅色模式样式
      this.menu.style.backgroundColor = 'white';
      this.menu.style.borderColor = '#ccc';
      this.menu.style.color = '#333';
      
      // 更新所有菜单项的样式
      const menuItems = this.menu.querySelectorAll('.context-menu-item');
      menuItems.forEach(item => {
        item.style.color = '#333';
        const shortcut = item.querySelector('span:last-child');
        if (shortcut) {
          shortcut.style.color = '#999';
        }
      });
      
      // 更新分隔线样式
      const separators = this.menu.querySelectorAll('hr');
      separators.forEach(separator => {
        separator.style.borderColor = '#eee';
      });
    }
  }

  /**
   * 检查剪贴板是否有数据
   * @returns {boolean} 是否有剪贴板数据
   */
  hasClipboardData() {
    // 这里应该检查实际的剪贴板数据
    // 简化实现，总是返回false
    return false;
  }

  /**
   * 初始化插件
   */
  init() {
    this.createMenu();
    this.bindEvents();
    this.updateTheme();
  }

  /**
   * 创建菜单DOM元素
   */
  createMenu() {
    // 创建菜单容器
    this.menu = document.createElement('div');
    this.menu.className = 'konva-context-menu';
    this.menu.style.position = 'absolute';
    this.menu.style.zIndex = '1000';
    this.menu.style.border = '1px solid';
    this.menu.style.borderRadius = '4px';
    this.menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    this.menu.style.padding = '4px 0';
    this.menu.style.minWidth = '150px';
    this.menu.style.display = 'none';
    this.menu.style.fontSize = '14px';
    this.menu.style.fontFamily = 'sans-serif';
    this.menu.style.boxSizing = 'border-box';
    
    // 添加菜单到画布容器
    this.canvas.container.appendChild(this.menu);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 监听右键点击事件
    this.canvas.stage.on('contextmenu', (e) => {
      e.evt.preventDefault();
      this.showMenu(e.evt.clientX, e.evt.clientY, e.target);
    });
    
    // 监听点击其他区域隐藏菜单
    document.addEventListener('click', (e) => {
      if (this.menu && !this.menu.contains(e.target)) {
        this.hideMenu();
      }
    });
    
    // 监听按键事件隐藏菜单
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideMenu();
      }
    });
    
    // 监听窗口大小变化隐藏菜单
    window.addEventListener('resize', () => {
      this.hideMenu();
    });
    
    // 监听主题变化事件
    this.handleThemeChange = () => {
      this.updateTheme();
    };
    
    window.addEventListener('theme-change', this.handleThemeChange);
    
    // 使用MutationObserver监听DOM类名变化来检测主题变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // 延迟执行以确保DOM已经更新
          setTimeout(() => {
            this.updateTheme();
          }, 0);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    this.obserer = observer;
  }

  hasMultipleElementsSelected() {
    return this.canvas.selectedElements.size > 0;
  }

  /**
   * 显示菜单
   * @param {number} x - 鼠标X坐标
   * @param {number} y - 鼠标Y坐标
   * @param {object} target - 点击的目标元素
   */
  showMenu(x, y, target) {
    if (!this.menu) return;
    
    // 隐藏现有菜单
    this.hideMenu();
    
    // 确定当前元素
    this.currentElement = null;
    if (this.canvas.selectedElements.size > 0) {
      this.currentElement = Array.from(this.canvas.selectedElements)[0];
    }
    
    // 清空菜单
    this.menu.innerHTML = '';
    
    // 构建菜单项
    let hasVisibleItems = false;
    this.menuItems.forEach(item => {
      // 检查条件是否满足
      if (item.condition && !item.condition(this.currentElement)) {
        return;
      }
      
      hasVisibleItems = true;
      
      if (item.separator) {
        // 创建分隔线
        const separator = document.createElement('hr');
        separator.style.margin = '4px 0';
        separator.style.border = 'none';
        separator.style.borderTop = '1px solid';
        this.menu.appendChild(separator);
      } else {
        // 创建菜单项
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.style.padding = '6px 12px';
        menuItem.style.cursor = 'pointer';
        menuItem.style.display = 'flex';
        menuItem.style.justifyContent = 'space-between';
        menuItem.style.alignItems = 'center';
        
        // 文本部分
        const textSpan = document.createElement('span');
        textSpan.textContent = item.text;
        menuItem.appendChild(textSpan);
        
        // 快捷键部分
        if (item.shortcut) {
          const shortcutSpan = document.createElement('span');
          shortcutSpan.textContent = item.shortcut;
          shortcutSpan.style.fontSize = '12px';
          menuItem.appendChild(shortcutSpan);
        }
        
        // 添加悬停效果
        menuItem.addEventListener('mouseenter', () => {
          if (this.isDarkMode()) {
            menuItem.style.backgroundColor = '#3d3d3d';
          } else {
            menuItem.style.backgroundColor = '#f5f5f5';
          }
        });
        
        menuItem.addEventListener('mouseleave', () => {
          menuItem.style.backgroundColor = 'transparent';
        });
        
        // 添加点击事件
        menuItem.addEventListener('click', (e) => {
          e.stopPropagation();
          this.hideMenu();
          this.executeAction(item.action, this.currentElement);
        });
        
        this.menu.appendChild(menuItem);
      }
    });
    
    // 如果没有可见项，不显示菜单
    if (!hasVisibleItems) {
      return;
    }
    
    // 更新主题样式
    this.updateTheme();
    
    // 显示菜单
    this.menu.style.display = 'block';
    this.isVisible = true;
    
    // 定位菜单
    const rect = this.canvas.container.getBoundingClientRect();
    let menuX = x - rect.left;
    let menuY = y - rect.top;
    
    // 防止菜单超出画布边界
    const menuRect = this.menu.getBoundingClientRect();
    if (menuX + menuRect.width > rect.width) {
      menuX = rect.width - menuRect.width;
    }
    
    if (menuY + menuRect.height > rect.height) {
      menuY = rect.height - menuRect.height;
    }
    
    // 确保不会出现在负坐标
    menuX = Math.max(0, menuX);
    menuY = Math.max(0, menuY);
    
    this.menu.style.left = menuX + 'px';
    this.menu.style.top = menuY + 'px';
  }

  /**
   * 隐藏菜单
   */
  hideMenu() {
    if (this.menu) {
      this.menu.style.display = 'none';
      this.isVisible = false;
      this.currentElement = null;
    }
  }

  /**
   * 执行菜单项操作
   * @param {string} action - 操作名称
   * @param {object} element - 当前元素
   */
  executeAction(action, element) {
    switch (action) {
      case 'copy':
        if (element) {
          this.canvas.eventSystem.emit('copy', { elementId: element.id });
        }
        break;
        
      case 'paste':
        this.canvas.eventSystem.emit('paste', {});
        break;
        
      case 'delete':
        if (element) {
          this.canvas.eventSystem.emit('delete', [element.id]);
        }
        break;
        
      case 'centerView':
        this.canvas.centerView();
        break;
        
      case 'resetView':
        this.canvas.resetView();
        break;
        
      case 'alignLeft':
        this.canvas.alignElements('left');
        break;
        
      case 'alignCenter':
        this.canvas.alignElements('center');
        break;
        
      case 'alignRight':
        this.canvas.alignElements('right');
        break;
        
      case 'alignTop':
        this.canvas.alignElements('top');
        break;
        
      case 'alignMiddle':
        this.canvas.alignElements('middle');
        break;
        
      case 'alignBottom':
        this.canvas.alignElements('bottom');
        break;
        
      default:
        // 触发自定义操作事件
        this.canvas.eventSystem.emit('contextMenuAction', { action, element });
        break;
    }
  }

  /**
   * 销毁插件
   */
  destroy() {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }
    
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.handleThemeChange) {
      window.removeEventListener('theme-change', this.handleThemeChange);
    }
  }
}