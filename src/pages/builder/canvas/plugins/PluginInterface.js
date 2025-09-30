/**
 * 插件接口
 * 所有可选插件都应实现此接口
 */
export class PluginInterface {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   * @param {object} options - 插件选项
   */
  constructor(canvas, options = {}) {
    if (this.constructor === PluginInterface) {
      throw new Error('PluginInterface is an abstract class and cannot be instantiated directly');
    }
    
    this.canvas = canvas;
    this.options = options;
  }

  /**
   * 初始化插件
   */
  init() {
    throw new Error('init method must be implemented by plugin');
  }

  /**
   * 销毁插件
   */
  destroy() {
    throw new Error('destroy method must be implemented by plugin');
  }

  /**
   * 菜单项条件函数
   * 用于确定是否显示特定的菜单项
   * @param {string} menuItem - 菜单项名称
   * @returns {boolean} - 是否显示该菜单项
   */
  menuItemCondition(menuItem) {
    // 默认情况下允许所有菜单项
    return true;
  }
}