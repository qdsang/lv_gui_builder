<template>
  <div class="simulator-container" @click="handleClick" @dragover="handleDragOver" @drop="handleDrop">
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
import engine from './engine.js';

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
    engine.registerAssetServer((id) => {
      return projectStore.getAsset('', id);
    });

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
    getCanvasObject() {
      return this.$refs.canvasComponent?.getCanvasObject();
    },
    
    // 将屏幕坐标转换为Canvas坐标
    screenToCanvasCoords(screenX, screenY) {
      const canvasComponent = this.getCanvasObject();
      if (!canvasComponent) return { x: 0, y: 0 };
      
      const coords = canvasComponent.screenToCanvas(screenX, screenY);
      console.log('screenToCanvasCoords', screenX, screenY, coords);
      return coords;
    },
    
    handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    
    // 处理拖放事件
    handleDrop(event) {
      console.log('handleDrop', event);
      const coords = this.screenToCanvasCoords(event.clientX, event.clientY);
      
      try {
        // event.dataTransfer.effectAllowed == "copyMove"
        let widgetInfoStr = event.dataTransfer.getData('widgetInfo');
        if (!widgetInfoStr) return;
        const widgetInfo = JSON.parse(widgetInfoStr);
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
        event.preventDefault();
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
      
      await engine.simulatorScreenSize(this.screen);

      // await this.loadScreen();
    },
    async loadScreen({ width, height}) {
      // 初始化LVGL渲染目标
      const canvasObject = this.getCanvasObject();
      if (!canvasObject) {
        await new Promise(r => setTimeout(r, 100));
        this.$nextTick(() => this.loadScreen());
        return;
      }
      
      console.log('loadScreen', width, height);
      this.screen.width = width;
      this.screen.height = height;

      canvasObject.clearScreenComponents('screen');

      // 创建屏幕元素
      canvasObject.createElement('screen', {
        type: 'screen',
        width: width,
        height: height
      });
      
      // 为屏幕元素创建渲染目标
      this.renderCanvas.width = width;
      this.renderCanvas.height = height;
      const lvglCanvas = canvasObject.createRenderTarget('screen', {
        renderCanvas: this.renderCanvas,
        width: width,
        height: height,
      });

      // let widgets = projectStore.getComponents();
      // let components = [];
      // for (let id in widgets) {
      //   if (id == 'screen') continue;
      //   let widget = widgets[id];
      //   this.createElement(widget);
      // }
      
      this.centerView();
    },
    createElement(widget) {
      if (widget.type == 'screen') return;

      const canvasObject = this.getCanvasObject();
      let data = widget.data;
      let component = {
        id: widget.id,
        type: widget.type,
        parent: widget.parent,
        zindex: widget.zindex,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
      };
      canvasObject.createElement(component.id, component, component.parent);
    },
    updateElementAttr(widget) {
      const canvasObject = this.getCanvasObject();
      canvasObject.updateElement(widget.id, {
        x: widget.data.x,
        y: widget.data.y,
        width: widget.data.width,
        height: widget.data.height,
        zindex: widget.zindex,
      });
    },
    updateView() {
      const canvasObject = this.getCanvasObject();
      setTimeout(() => {
        canvasObject.updateView();
      }, 100);
    },
    centerView() {
      const canvasObject = this.getCanvasObject();
      // setTimeout(() => {
        canvasObject.centerView({ fit: true, padding: 80 });
      // }, 100);
    },
    deleteElement(screenid, id) {
      const canvasObject = this.getCanvasObject();
      canvasObject.deselectElement(id);
      canvasObject.removeElement(id);
    },
    activeFrame(info) {
      const canvasObject = this.getCanvasObject();
      canvasObject.selectElement(info.id);

      if (info.type == 'screen') {
        this.isTransform = false;
        this.activeInfo = null;
        return;
      }
      let attrs = ['x', 'y', 'width', 'height'];
      for (let key of attrs) {
        info.data[key] = parseInt(info.data[key], 10) || 0;
      }
      
      // this.renderFrame(info.data);
      engine.simulatorWidget.updateAttr(info);
      this.isTransform = true;
      this.activeInfo = info;
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
        this.$emit('console', text);
      }
      return text;
    },
    
    // 处理元素修改事件
    handleElementModified(event) {
      const { action, elementId, element, transform, data } = event.detail;
      // console.log('event:', action, elementId, data);
      
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
  height: 100%;
}
</style>

<style lang="less">
#canvas {
  border: 1px grey solid;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
</style>