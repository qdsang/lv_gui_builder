/**
 * 事件系统
 * 负责处理KonvaCanvas中的事件分发和管理
 */
export class EventSystem {
  /**
   * 构造函数
   * @param {KonvaCanvas} canvas - KonvaCanvas实例
   */
  constructor(canvas) {
    // 实现单例模式
    if (EventSystem.instance) {
      return EventSystem.instance;
    }
    
    this.canvas = canvas;
    this.eventListeners = new Map();
    
    // 如果是第一次创建实例，保存实例引用
    EventSystem.instance = this;
  }

  /**
   * 添加事件监听器
   * @param {string} eventType - 事件类型
   * @param {function} callback - 回调函数
   */
  on(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType).add(callback);
  }

  /**
   * 移除事件监听器
   * @param {string} eventType - 事件类型
   * @param {function} callback - 回调函数
   */
  off(eventType, callback) {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType).delete(callback);
    }
  }

  /**
   * 触发事件
   * @param {string} eventType - 事件类型
   * @param {object} data - 事件数据
   */
  emit(eventType, data) {
    if (this.eventListeners.has(eventType)) {
      const listeners = this.eventListeners.get(eventType);
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * 销毁事件系统
   */
  destroy() {
    this.eventListeners.clear();
    // 清除单例实例
    EventSystem.instance = null;
  }
}