<template>
  <div id="mp_js_stdout" class="simulator-container"  @click="handleClick" @dragover="handleDragOver" @drop="handleDrop">
    <!-- 使用适配KonvaCanvas的组件 -->
    <Canvas 
      ref="canvasComponent"
      @event="handleElementModified"
    />
    <div ref="container" class="simulator-container">
    </div>
  </div>
</template>

<script lang="ts">
import {
  engineAttrUpdate,
} from './runtimeWrapper.js';
import * as engine from '@lvgl/v8.3.0/index.js';

import { projectStore } from './store/projectStore';

// 引入新的Canvas组件
import Canvas from './canvas/Canvas.vue';

export default {
  name : 'creator-simulator',
  components: {
    Canvas
  },
  props: [],
  emits: ['cursor', 'console', 'event'],
  data: function() {
    return {
      screen: { width: 480, height: 480 },

      buffer: [],
      str_json: '',
      mask: false,

      isTransform: false,
      activeInfo: null,
      transformFrameInfo: null,
      transformInfo: {startX: 0, startY: 0, },
      
      // 组件管理
      components: new Map()
    }
  },
  created() {
    window.addEventListener("resize", this.resizeEventHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeEventHandler);
  },
  mounted() {
    engine.init();

    let vm = this;
    engine.on('stdout', (e) => {
        // setTimeout(() => {
          // @ts-ignore
          let data = e.data;
          for (let i = 0; i < data.length; i++) {
            vm.handleOutput(data[i]);
          }
        // }, 50);
    });
    
    // // 初始化完成后创建LVGL渲染目标
    // this.$nextTick(() => {
    //   this.initLvglRenderTarget();
    // });
  },
  methods: {
    
    // 重置视图
    resetView() {
      this.$refs.canvasComponent?.resetView();
    },
    
    // 将屏幕坐标转换为LVGL坐标
    screenToLvglCoords(screenX, screenY) {
      const canvasComponent = this.$refs.canvasComponent;
      if (!canvasComponent) return { x: 0, y: 0 };
      
      const coords = canvasComponent.screenToCanvas(screenX, screenY);
      // 转换为整数坐标
      const lvglX = Math.round(coords.x * (this.screen.width / (this.screen.width || 480)));
      const lvglY = Math.round(coords.y * (this.screen.height / (this.screen.height || 480)));
      return { x: lvglX, y: lvglY };
    },
    
    handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    
    // 处理拖放事件
    handleDrop(event) {
      event.preventDefault();
      
      const coords = this.screenToLvglCoords(event.clientX, event.clientY);
      
      try {
        const widgetInfo = JSON.parse(event.dataTransfer.getData('widgetInfo'));
        console.log('handleDrop', widgetInfo);
        // 发送创建事件，包含位置信息
        this.$emit('event', {
          action: 'create',
          type: widgetInfo.label,
          position: {
            x: coords.x,
            y: coords.y
          }
        });
      } catch (error) {
        console.error('Failed to parse widget info:', error);
      }
    },
    
    async initialComplete() {
      const renderCanvas = document.createElement('canvas');
      // renderCanvas.id = `${screenId}-render-target`;
      renderCanvas.id = `canvas`;
      renderCanvas.width = this.screen.width;
      renderCanvas.height = this.screen.height;
      renderCanvas.style.position = 'absolute';
      renderCanvas.style.left = `0px`;
      renderCanvas.style.top = `0px`;
      renderCanvas.style.display = 'none'; // 隐藏该canvas
      this.$refs.container.appendChild(renderCanvas);
      this.renderCanvas = renderCanvas;

      await engine.simulatorInit(renderCanvas);
    },
    async initScreen({ width, height}) {
      this.screen.width = width;
      this.screen.height = height;
      console.log('initScreen', width, height);
      
      await engine.ScreenSize(width, height);

      await this.loadScreen();
    },
    async loadScreen() {
    // 初始化LVGL渲染目标
      const canvasComponent = this.$refs.canvasComponent;
      const canvasObject = canvasComponent.getCanvasObject();
      if (!canvasObject) {
        await new Promise(r => setTimeout(r, 100));
        this.$nextTick(() => this.loadScreen());
        return;
      }
      
      const width = this.screen.width || 480;
      const height = this.screen.height || 480;

      // 创建屏幕元素
      canvasObject.createElement('screen', {
        type: 'screen',
        width: width,
        height: height
      });
      
      // 为屏幕元素创建渲染目标
      const lvglCanvas = canvasObject.createRenderTarget('screen', {
        renderCanvas: this.renderCanvas,
        width: width,
        height: height,
      });

      let widgets = projectStore.getComponents();
      let components = [];
      for (let id in widgets) {
        if (id == 'screen') continue;
        let widget = widgets[id];
        let data = widget.data;
        components.push({
          id: id,
          type: widget.type,
          parent: widget.parent,
          zindex: widget.zindex,
          x: data.x,
          y: data.y,
          width: data.width,
          height: data.height,
        });
      }

      // components.push({
      //   id: 'main2',
      //   type: 'label',
      //   parent: '',
      //   zindex: 0,
      //   x: 0,
      //   y: 0,
      //   width: 200,
      //   height: 200,
      // });
      // components.push({
      //   id: 'main3',
      //   type: 'label',
      //   parent: '',
      //   zindex: 0,
      //   x: 150,
      //   y: 150,
      //   width: 100,
      //   height: 100,
      // });

      console.log('updateComponents', components);

      // 添加所有组件
      for (const component of components) {
        canvasObject.createElement(component.id, component, 'screen');
      }
      
      canvasObject.centerView({ fit: true, padding: 20 });
      
    },
    activeFrame(info) {
      if (info.type == 'screen') {
        this.isTransform = false;
        this.activeInfo = null;
        return;
      }
      let attrs = ['x', 'y', 'width', 'height'];
      for (let key of attrs) {
        info.data[key] = parseInt(info.data[key], 10) || 0;
      }
      
      this.transformFrameInfo = info.data;
      // this.renderFrame(info.data);
      engineAttrUpdate(info);
      this.isTransform = true;
      this.activeInfo = info;
      

      const canvasObject = this.$refs.canvasComponent.getCanvasObject();
      canvasObject.selectElement(info.id);
    },
    renderFrame(data) {
      // 强制更新渲染显示
      this.$refs.canvasComponent?.updateRenderDisplay('screen');
    },
    resizeEventHandler() {
      if (this.isTransform) {
        this.activeFrame(this.activeInfo);
      }
    },
    handleClick() {
      // TODO 无法分辨是否点击中元素， 导致切换到screen
      // this.$emit('event', {action: 'click'});
    },
    // Handle the information(strats with \x06, end with \x15)
    handleOutput: function (text) {
      if (text == '\x15') {
        //End: '\x15'
        this.mask = false;
        this.str_json = this.buffer.join('');
        let json = JSON.parse(this.str_json);
        // console.log('handleOutput', json);
        this.$emit('event', json);
      }
      if (this.mask) {
        this.buffer.push(text);
        text = '';
      }
      if (text == '\x06') {
        //Begin: '\x06'
        this.mask = true;
      }

      if (text == '\n') {
        this.buffer.splice(0, this.buffer.length);
      }
      if (['\x06', '\x15', ''].indexOf(text) == -1) {
        if (this.consoleTmp == '\r' && text == '\n') {

        } else {
          this.$emit('console', text);
        }
        this.consoleTmp = text;
      }
      return text;
    },
    
    // 处理元素修改事件
    handleElementModified(event) {
      const { action, elementId, element, transform, data } = event.detail;
      console.log('event:', action, elementId, data);
      
      // 发送事件到父组件
      this.$emit('event', {
        action: action,
        id: elementId,
        data: data
      });
    },
    
  },
};
</script>

<style lang="less" scoped>
.simulator-container {
  position: relative;
}
</style>

<style lang="less">
#canvas {
  border: 1px grey solid;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
</style>