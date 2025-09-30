/**
 * 插件管理器
 * 负责管理KonvaCanvas的可选插件（核心功能已移至core目录）
 */
export class PluginManager {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.plugins = new Map(); // 插件映射
  }

  /**
   * 注册插件
   * @param {string} name - 插件名称
   * @param {object} plugin - 插件实例
   */
  registerPlugin(name, plugin) {
    // 如果同名插件已存在，先销毁它
    if (this.plugins.has(name)) {
      this.destroyPlugin(name);
    }
    
    this.plugins.set(name, plugin);
    
    // 如果插件有初始化方法，则调用它
    if (typeof plugin.init === 'function') {
      try {
        plugin.init();
      } catch (error) {
        console.error(`Error initializing plugin ${name}:`, error);
      }
    }
  }

  /**
   * 获取插件
   * @param {string} name - 插件名称
   * @returns {object} 插件实例
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }

  /**
   * 销毁指定插件
   * @param {string} name - 插件名称
   */
  destroyPlugin(name) {
    const plugin = this.plugins.get(name);
    if (plugin) {
      if (typeof plugin.destroy === 'function') {
        try {
          plugin.destroy();
        } catch (error) {
          console.error(`Error destroying plugin ${name}:`, error);
        }
      }
      this.plugins.delete(name);
    }
  }

  /**
   * 销毁所有插件
   */
  destroy() {
    for (const [name, plugin] of this.plugins) {
      if (typeof plugin.destroy === 'function') {
        try {
          plugin.destroy();
        } catch (error) {
          console.error(`Error destroying plugin ${name}:`, error);
        }
      }
    }
    this.plugins.clear();
  }
  
  /**
   * 获取所有插件名称
   * @returns {string[]} 插件名称数组
   */
  getPluginNames() {
    return Array.from(this.plugins.keys());
  }
  
  /**
   * 检查是否存在指定插件
   * @param {string} name - 插件名称
   * @returns {boolean} 是否存在
   */
  hasPlugin(name) {
    return this.plugins.has(name);
  }
}