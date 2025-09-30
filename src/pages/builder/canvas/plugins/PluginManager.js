/**
 * 插件管理器
 * 负责管理KonvaCanvas的插件
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
    this.plugins.set(name, plugin);
    
    // 如果插件有初始化方法，则调用它
    if (typeof plugin.init === 'function') {
      plugin.init();
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
   * 销毁所有插件
   */
  destroy() {
    for (const plugin of this.plugins.values()) {
      if (typeof plugin.destroy === 'function') {
        plugin.destroy();
      }
    }
    this.plugins.clear();
  }
}