<template>
  <div class="canvas-wrapper" ref="canvasContainer">
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
// 导入KonvaCanvas类
import { KonvaCanvas } from './KonvaCanvas.js';
import { useDark } from '@vueuse/core';
// 导入插件
import { RulerPlugin } from './plugins/RulerPlugin.js';
import { GridPlugin } from './plugins/GridPlugin.js';
import { ContextMenuPlugin } from './plugins/ContextMenuPlugin.js';

// 导入主题观察器相关模块
import { createApp, h } from 'vue';

// 定义props
const props = defineProps({
  plugins: {
    type: Array,
    default: () => ['ruler', 'grid', 'contextMenu'] // 默认加载标尺、网格和右键菜单插件
  }
});

// 定义emits
const emit = defineEmits(['event']);

// 响应式数据
const canvasContainer = ref(null);
const konvaCanvas = ref(null);
const isDark = useDark();
let resizeObserver = null;
let lastWidth = 0;
let lastHeight = 0;

// 更新画布尺寸
const updateCanvasSize = () => {
  const container = canvasContainer.value;
  if (!container || !konvaCanvas.value) return;
  
  const { width, height } = container.getBoundingClientRect();
  
  // 避免尺寸变化死循环：只有当尺寸变化超过阈值时才更新
  if (Math.abs(width - lastWidth) > 1 || Math.abs(height - lastHeight) > 1) {
    lastWidth = width;
    lastHeight = height;
    
    // 更新画布尺寸
    konvaCanvas.value.stage.width(width);
    konvaCanvas.value.stage.height(height);
    konvaCanvas.value.options.width = width;
    konvaCanvas.value.options.height = height;
    konvaCanvas.value.layer.batchDraw();
    
    // 通知插件画布尺寸已更新
    konvaCanvas.value.eventSystem.emit('canvasResize', { width, height });
  }
};

// 生命周期钩子
onMounted(() => {
  // 初始化KonvaCanvas，使用容器的尺寸
  const container = canvasContainer.value;
  if (!container) return;
  
  const width = container.clientWidth || 500;
  const height = container.clientHeight || 500;
  
  lastWidth = width;
  lastHeight = height;
  
  konvaCanvas.value = new KonvaCanvas(container, {
    width: width,
    height: height,
    isDark: isDark.value
  });
  
  // 加载默认插件
  if (konvaCanvas.value.pluginManager) {
    if (props.plugins.includes('ruler')) {
      konvaCanvas.value.pluginManager.registerPlugin('ruler', new RulerPlugin(konvaCanvas.value, {
        rulerSize: 20
      }));
    }
    
    if (props.plugins.includes('contextMenu')) {
      konvaCanvas.value.pluginManager.registerPlugin('contextMenu', new ContextMenuPlugin(konvaCanvas.value, {
        // 可以在这里自定义菜单项
      }));
    }
    
    // if (props.plugins.includes('grid')) {
    //   konvaCanvas.value.pluginManager.registerPlugin('grid', new GridPlugin(konvaCanvas.value, {
    //     gridSize: 20,
    //     gridColor: 'rgba(200, 200, 200, 0.5)'
    //   }));
    // }
  }
  
  // 监听元素变换事件并转发给父组件
  konvaCanvas.value.eventSystem.on('transform', (data) => {
    // 使用Vue的emit机制传递元素变换事件
    data.action = 'transform';
    emit('event', {detail: data });
    // emit('transform', data);
  });
  
  // 监听元素变换事件并转发给父组件
  konvaCanvas.value.eventSystem.on('select', (data) => {
    data.action = 'active';
    emit('event', {detail: data });
  });
  
  // 监听主题变化
  observeThemeChanges();
  
  // 监听容器尺寸变化
  resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
  });
  resizeObserver.observe(container);
});

onBeforeUnmount(() => {
  // 销毁KonvaCanvas
  if (konvaCanvas.value) {
    // 清理主题观察器
    if (konvaCanvas.value.themeObserver) {
      konvaCanvas.value.themeObserver.disconnect();
      konvaCanvas.value.themeObserver = null;
    }
    
    konvaCanvas.value.destroy();
    konvaCanvas.value = null;
  }
  
  // 停止监听尺寸变化
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

// 监听器
watch(() => isDark.value, (newVal) => {
  if (konvaCanvas.value) {
    konvaCanvas.value.setDarkMode(newVal);
  }
}, { immediate: true });

  /**
   * 监听主题变化
   */
  const observeThemeChanges = () => {
    // 创建一个事件来通知插件主题已更改
    const dispatchThemeChangeEvent = () => {
      const event = new CustomEvent('theme-change');
      window.dispatchEvent(event);
    };
    
    // 监听DOM变化来检测主题变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // 延迟执行以确保DOM已经更新
          setTimeout(() => {
            dispatchThemeChangeEvent();
          }, 0);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // 保存observer以便在卸载时清理
    konvaCanvas.value.themeObserver = observer;
    
    // 初始化时触发一次主题变化事件
    dispatchThemeChangeEvent();
  };
  
  // 暴露方法给父组件
  defineExpose({
    // 重置视图
    resetView() {
    if (konvaCanvas.value) {
      konvaCanvas.value.resetView();
    }
  },
  
  // 将屏幕坐标转换为画布坐标
  screenToCanvas(screenX, screenY) {
    if (konvaCanvas.value) {
      return konvaCanvas.value.screenToCanvas(screenX, screenY);
    }
    return { x: 0, y: 0 };
  },
  
  // 设置缩放级别
  setScale(scale, zoomPoint) {
    // Konva的缩放通过鼠标滚轮事件处理
  },
  
  // 获取Canvas元素
  getCanvasObject() {
    // 为了兼容现有代码，返回konvaCanvas
    if (konvaCanvas.value) {
      return konvaCanvas.value;
    }
    return null;
  },
  
  // 获取插件实例
  getPlugin(name) {
    if (konvaCanvas.value && konvaCanvas.value.pluginManager) {
      return konvaCanvas.value.pluginManager.getPlugin(name);
    }
    return null;
  },
  
  // 创建元素
  createElement(id, options) {
    if (konvaCanvas.value) {
      return konvaCanvas.value.createElement(id, options);
    }
    return null;
  },
  
  // 获取元素
  getElement(id) {
    if (konvaCanvas.value) {
      return konvaCanvas.value.getElement(id);
    }
    return null;
  },
  
  // 删除元素
  removeElement(id) {
    if (konvaCanvas.value) {
      konvaCanvas.value.removeElement(id);
    }
  },
  
  // 为屏幕元素创建渲染目标
  createRenderTarget(screenId, options) {
    if (konvaCanvas.value) {
      return konvaCanvas.value.createRenderTarget(screenId, options);
    }
    return null;
  },
  
  // 获取渲染Canvas
  getRenderCanvas(screenId) {
    if (konvaCanvas.value) {
      return konvaCanvas.value.getRenderCanvas(screenId);
    }
    return null;
  },
  
  // 激活渲染目标显示
  activateRenderTargetDisplay(screenId) {
    if (konvaCanvas.value) {
      return konvaCanvas.value.activateRenderTargetDisplay(screenId);
    }
  },
  
  // 更新渲染目标尺寸
  updateRenderTargetSize(screenId, options) {
    if (konvaCanvas.value) {
      konvaCanvas.value.updateRenderTargetSize(screenId, options);
    }
  },
  
  // 更新渲染目标显示
  updateRenderDisplay(screenId) {
    if (konvaCanvas.value) {
      konvaCanvas.value.updateRenderDisplay(screenId);
    }
  },
  
  // 为屏幕元素添加组件
  addComponent(screenId, component) {
    if (konvaCanvas.value) {
      // 这个方法现在通过createElement处理
      return konvaCanvas.value.createElement(component.id, component, screenId);
    }
  },
  
  // 更新元素属性
  updateElement(id, properties) {
    if (konvaCanvas.value) {
      konvaCanvas.value.updateElement(id, properties);
    }
  },
  
  // 清空屏幕元素的组件
  clearScreenComponents(screenId) {
    if (konvaCanvas.value) {
      konvaCanvas.value.clearScreenComponents(screenId);
    }
  },
  
  // 更新画布尺寸
  updateView() {
    updateCanvasSize();
  },
  
  // 对齐选中元素
  alignElements(alignment) {
    if (konvaCanvas.value) {
      konvaCanvas.value.alignElements(alignment);
    }
  },
  
  // 分布选中元素
  distributeElements(distribution) {
    if (konvaCanvas.value) {
      konvaCanvas.value.distributeElements(distribution);
    }
  }
});
</script>

<style lang="less" scoped>
.canvas-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

// 添加右键菜单样式
.konva-context-menu {
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 4px 0;
  min-width: 150px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  
  .context-menu-item {
    padding: 6px 12px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &:hover {
      background-color: #f5f5f5;
    }
    
    span:last-child {
      color: #999;
      font-size: 12px;
    }
  }
  
  hr {
    margin: 4px 0;
    border: none;
    border-top: 1px solid #eee;
  }
}

// 深色模式样式
html.dark {
  .konva-context-menu {
    background: #2d2d2d;
    border-color: #444;
    color: #ccc;
    
    .context-menu-item {
      color: #ccc;
      
      &:hover {
        background-color: #3d3d3d;
      }
      
      span:last-child {
        color: #999;
      }
    }
    
    hr {
      border-color: #444;
    }
  }
}

// 浅色模式样式（默认）
html:not(.dark) {
  .konva-context-menu {
    background: #fff;
    border-color: #ccc;
    color: #333;
    
    .context-menu-item {
      color: #333;
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      span:last-child {
        color: #999;
      }
    }
    
    hr {
      border-color: #eee;
    }
  }
}
</style>
