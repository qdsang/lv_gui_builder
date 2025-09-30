<template>
  <div class="canvas-wrapper" ref="canvasContainer">
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
// 导入KonvaCanvas类
import { KonvaCanvas } from './KonvaCanvas.js';
import { useDark } from '@vueuse/core';

// 定义props
const props = defineProps({
  plugins: {
    type: Array,
    default: () => [] // Konva版本暂时不支持插件
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
  
  // 监听元素修改事件并转发给父组件
  konvaCanvas.value.container.addEventListener('event', (event) => {
    // 使用Vue的emit机制传递事件
    emit('event', event);
  });
  
  // 监听容器尺寸变化
  resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
  });
  resizeObserver.observe(container);
});

onBeforeUnmount(() => {
  // 销毁KonvaCanvas
  if (konvaCanvas.value) {
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
    // Konva版本暂时不支持插件
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
</style>