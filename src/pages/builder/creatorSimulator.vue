<template>
  <div id="mp_js_stdout" style="text-align: center; position: relative;" @click="handleClick" @dragover="handleDragOver" @drop="handleDrop">
    <iframe id="embed" style="width: 480px; height: 480px; display: none;" src="/lvgl/v8.3.0/embed.html"></iframe>
    <canvas
      id="canvas"
      ref="canvas"
      style="width: 480px; height: 480px;"
      oncontextmenu="event.preventDefault()"
      onmousedown="this.style.cursor='move'"
      onmouseup="this.style.cursor='default'"
      @mousemove="cursorXY"
      @click.stop
      tabindex="-1"
    >
    </canvas>
    
    <!-- 添加用于交互和辅助元素显示的fabric.js canvas -->
    <canvas
      id="fabric-canvas"
      ref="fabricCanvas"
      style="width: 480px; height: 480px; position: absolute; top: 0; left: 0; pointer-events: auto; display: none;"
    >
    </canvas>

    <div class="lv-widget-transform" ref="transform" v-show="isTransform" style="width: 52px; height: 52px; left: 240px; top: 190px;" @click.stop  @mousedown="dragStart" @mouseup="dragEnd">
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-nw" data-position="top-left"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-n" data-position="top"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-ne" data-position="top-right"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-e" data-position="right"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-se" data-position="bottom-right"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-s" data-position="bottom"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-sw" data-position="bottom-left"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-w" data-position="left"></div>
      <div draggable="false" class="lv-widget-transform-rotate" data-position="move"></div>
    </div>
  </div>
</template>

<script lang="ts">
import * as WidgetData from './widgetData.js';
import {
  wrap_equal,
  wrap_simple_setter,
} from './runtimeWrapper.js';
import * as engine from '@lvgl/v8.3.0/index.js';


// 引入fabric.js
import * as fabric from 'fabric';


export default {
  name : 'creator-simulator',
  props: [],
  emits: ['cursor', 'console', 'event'],
  data: function() {
    return {
      screen: { width: 0, height: 0 },
      cursorX: 0,
      cursorY: 0,

      buffer: [],
      str_json: '',
      mask: false,

      isTransform: false,
      activeInfo: null,
      transformFrameInfo: null,
      transformInfo: {startX: 0, startY: 0, },

      // 添加fabric相关属性
      fabricCanvas: null,
    }
  },
  created() {
    window.addEventListener("resize", this.resizeEventHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeEventHandler);
    window.removeEventListener("mousemove", this.dragging);
    window.removeEventListener("resize", this.handleFabricResize);
    
    // 清理fabric canvas
    if (this.fabricCanvas) {
      this.fabricCanvas.dispose();
      this.fabricCanvas = null;
    }
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
    })
    
    // 初始化fabric canvas
    // this.$nextTick(() => {
    //   this.initFabricCanvas();
    // });
  },
  methods: {
    // 初始化fabric canvas
    initFabricCanvas() {
      const canvasElement = this.$refs.fabricCanvas;
      this.fabricCanvas = new fabric.Canvas(canvasElement, {
        containerClass: 'fabric-container',
        selection: false, // 禁用默认选择
        hoverCursor: 'default',
        backgroundColor: 'transparent',
        preserveObjectStacking: true
      });
      
      // 设置canvas尺寸与主canvas一致
      const boundingRect = this.$refs.canvas.getBoundingClientRect();
      this.fabricCanvas.setDimensions({
        width: boundingRect.width,
        height: boundingRect.height
      });
      
      // 添加窗口大小变化监听
      window.addEventListener('resize', this.handleFabricResize);
      
      // 添加fabric事件监听
      this.setupFabricEvents();
      
      console.log('Fabric canvas initialized');
    },
    
    // 设置fabric事件监听
    setupFabricEvents() {
      // 可以在这里添加各种交互事件监听
      this.fabricCanvas.on('mouse:down', (options) => {
        // 处理鼠标按下事件
        console.log('Fabric mouse down', options);
      });
      
      this.fabricCanvas.on('mouse:move', (options) => {
        // 处理鼠标移动事件
        console.log('Fabric mouse move', options);
      });
      
      this.fabricCanvas.on('mouse:up', (options) => {
        // 处理鼠标释放事件
        console.log('Fabric mouse up', options);
      });
    },
    
    // 处理fabric canvas大小调整
    handleFabricResize() {
      if (this.fabricCanvas && this.$refs.canvas) {
        const boundingRect = this.$refs.canvas.getBoundingClientRect();
        this.fabricCanvas.setDimensions({
          width: boundingRect.width,
          height: boundingRect.height
        });
        this.fabricCanvas.calcOffset();
      }
    },
    
    // 添加辅助线方法
    addGuideline(type, position) {
      if (!this.fabricCanvas) return;
      
      let line;
      if (type === 'vertical') {
        line = new fabric.Line([position, 0, position, this.fabricCanvas.height], {
          stroke: '#ff0000',
          strokeWidth: 1,
          selectable: false,
          evented: false,
          strokeDashArray: [5, 5]
        });
      } else if (type === 'horizontal') {
        line = new fabric.Line([0, position, this.fabricCanvas.width, position], {
          stroke: '#ff0000',
          strokeWidth: 1,
          selectable: false,
          evented: false,
          strokeDashArray: [5, 5]
        });
      }
      
      if (line) {
        this.fabricCanvas.add(line);
        this.fabricCanvas.renderAll();
      }
    },
    
    // 清除所有辅助线
    clearGuidelines() {
      if (!this.fabricCanvas) return;
      
      const objects = this.fabricCanvas.getObjects();
      objects.forEach(obj => {
        if (obj.type === 'line') {
          this.fabricCanvas.remove(obj);
        }
      });
      this.fabricCanvas.renderAll();
    },
    
    // 添加辅助矩形（用于高亮显示选中组件区域等）
    addOverlayRect(left, top, width, height, options = {}) {
      if (!this.fabricCanvas) return;
      
      const defaultOptions = {
        fill: 'rgba(0, 0, 255, 0.1)',
        stroke: 'blue',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        opacity: 0.5,
        ...options
      };
      
      const rect = new fabric.Rect({
        left: left,
        top: top,
        width: width,
        height: height,
        ...defaultOptions
      });
      
      this.fabricCanvas.add(rect);
      this.fabricCanvas.renderAll();
      return rect;
    },
    
    dragStart(event) {
      // 获取元素初始位置和鼠标按下时的坐标
      this.transformInfo.startX = event.clientX;
      this.transformInfo.startY = event.clientY;
      this.transformInfo.position = event.target.dataset.position;
      let frameInfo = this.transformFrameInfo;
      this.transformInfo.info = {x: frameInfo.x, y: frameInfo.y, width: frameInfo.width, height: frameInfo.height};
      
      // Object.assign(this.transformInfo.info, this.transformFrameInfo);

      // 绑定mousemove事件
      document.removeEventListener('mousemove', this.dragging);
      document.addEventListener('mousemove', this.dragging);
    },
    dragging(event) {
      if (event.which == 0) {
        return this.dragEnd();
      }
      // 计算鼠标移动了多少距离
      let tinfo = this.transformInfo;
      let info = Object.assign({}, tinfo.info);
      const deltaX = event.clientX - tinfo.startX;
      const deltaY = event.clientY - tinfo.startY;
      let position = tinfo.position;

      if (position == 'top-left') {
        info.x += deltaX;
        info.width -= deltaX;
        info.y += deltaY;
        info.height -= deltaY;
      } else if (position == 'top') {
        info.y += deltaY;
        info.height -= deltaY;
      } else if (position == 'top-right') {
        info.width += deltaX;
        info.y += deltaY;
        info.height -= deltaY;
      } else if (position == 'right') {
        info.width += deltaX;
      } else if (position == 'bottom-right') {
        info.width += deltaX;
        info.height += deltaY;
      } else if (position == 'bottom') {
        info.height += deltaY;
      } else if (position == 'bottom-left') {
        info.x += deltaX;
        info.width -= deltaX;
        info.height += deltaY;
      } else if (position == 'left') {
        info.x += deltaX;
        info.width -= deltaX;
      } else if (position == 'move') {
        info.x += deltaX;
        info.y += deltaY;
      }

      let eventData = {action: 'frame', id: this.activeInfo.id, data: info };
      for (let attribute in eventData.data) {
        let value = eventData.data[attribute];
        wrap_simple_setter(eventData.id, attribute, value);
      }

      console.log('dragging', info, eventData);
      this.$emit('event', eventData);
      this.renderFrame(info);
    },
    dragEnd() {
      document.removeEventListener('mousemove', this.dragging);
    },
    async initialComplete() {
       await engine.simulatorInit(this.$refs.canvas);
    },
    initScreen({ width, height}) {
      this.screen.width = width;
      this.screen.height = height;
      console.log('initScreen', width, height);
      
      engine.ScreenSize(width, height);
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
      this.renderFrame(info.data);
      this.isTransform = true;
      this.activeInfo = info;
    },
    renderFrame(data) {
      let { x, y, width, height } = data;
      let style = this.$refs.transform.style;
      let canvas = this.$refs.canvas;
      style.left = parseInt(x, 10) + canvas.offsetLeft + 'px';
      style.top = parseInt(y, 10) + canvas.offsetTop + 'px';
      style.width = width + 'px';
      style.height = height + 'px';
    },
    resizeEventHandler() {
      if (this.isTransform) {
        this.activeFrame(this.activeInfo);
      }
    },
    handleClick() {
      this.$emit('event', {action: 'click'});
    },
    // Update the X & Y below the Simulator
    cursorXY: function (event) {
      const width = this.screen.width;
      const height = this.screen.height;
      const canvasWidth = this.$refs.canvas.offsetWidth;
      const canvasHeight = this.$refs.canvas.offsetHeight;
      this.cursorX = 0 | (event.offsetX / (canvasWidth / width));
      this.cursorY = 0 | (event.offsetY / (canvasHeight / height));
      this.$emit('cursor', this.cursorX, this.cursorY);
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
    handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    handleDrop(event) {
      event.preventDefault();
      
      // 获取画布相对于视口的位置
      const canvas = this.$refs.canvas;
      const rect = canvas.getBoundingClientRect();
      
      // 计算相对于画布的坐标
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // 转换为画布内的实际坐标
      const canvasX = Math.round(x * (this.screen.width / canvas.offsetWidth));
      const canvasY = Math.round(y * (this.screen.height / canvas.offsetHeight));
      
      try {
        const widgetInfo = JSON.parse(event.dataTransfer.getData('widgetInfo'));
        console.log('handleDrop', widgetInfo);
        // 发送创建事件，包含位置信息
        this.$emit('event', {
          action: 'create',
          type: widgetInfo.label,
          position: {
            x: canvasX,
            y: canvasY
          }
        });
      } catch (error) {
        console.error('Failed to parse widget info:', error);
      }
    },
  },
};
</script>
<style lang="less" scoped>
.lv-widget-transform {
  position: absolute;
  box-sizing: content-box !important;
  margin: -5px 0 0 -5px;
  padding: 4px;
  border: 1px dashed #999;
  border-radius: 5px;
  user-select: none;
  pointer-events: none;
  z-index: 10; /* 确保变换控件在fabric canvas之上 */
}
.lv-widget-transform > div {
  position: absolute;
  box-sizing: border-box;
  background-color: #fff;
  border: 1px solid #999;
  transition: background-color 0.2s;
  pointer-events: auto;
  -webkit-user-drag: none;
  user-drag: none;
  /* stylelint-disable-line */
}
.lv-widget-transform > div:hover {
  background-color: #d3d3d3;
}
.lv-widget-transform-cursor-n {
  cursor: n-resize;
}
.lv-widget-transform-cursor-s {
  cursor: s-resize;
}
.lv-widget-transform-cursor-e {
  cursor: e-resize;
}
.lv-widget-transform-cursor-w {
  cursor: w-resize;
}
.lv-widget-transform-cursor-ne {
  cursor: ne-resize;
}
.lv-widget-transform-cursor-nw {
  cursor: nw-resize;
}
.lv-widget-transform-cursor-se {
  cursor: se-resize;
}
.lv-widget-transform-cursor-sw {
  cursor: sw-resize;
}
.lv-widget-transform-resize {
  width: 10px;
  height: 10px;
  border-radius: 6px;
}
.lv-widget-transform-resize[data-position='top-left'] {
  top: -5px;
  left: -5px;
}
.lv-widget-transform-resize[data-position='top-right'] {
  top: -5px;
  right: -5px;
}
.lv-widget-transform-resize[data-position='bottom-left'] {
  bottom: -5px;
  left: -5px;
}
.lv-widget-transform-resize[data-position='bottom-right'] {
  right: -5px;
  bottom: -5px;
}
.lv-widget-transform-resize[data-position='top'] {
  top: -5px;
  left: 50%;
  margin-left: -5px;
}
.lv-widget-transform-resize[data-position='bottom'] {
  bottom: -5px;
  left: 50%;
  margin-left: -5px;
}
.lv-widget-transform-resize[data-position='left'] {
  top: 50%;
  left: -5px;
  margin-top: -5px;
}
.lv-widget-transform-resize[data-position='right'] {
  top: 50%;
  right: -5px;
  margin-top: -5px;
}
.lv-widget-transform.prevent-aspect-ratio .lv-widget-transform-resize[data-position='top'],
.lv-widget-transform.prevent-aspect-ratio .lv-widget-transform-resize[data-position='bottom'],
.lv-widget-transform.prevent-aspect-ratio .lv-widget-transform-resize[data-position='left'],
.lv-widget-transform.prevent-aspect-ratio .lv-widget-transform-resize[data-position='right'] {
  display: none;
}
.lv-widget-transform.no-orth-resize .lv-widget-transform-resize[data-position='bottom'],
.lv-widget-transform.no-orth-resize .lv-widget-transform-resize[data-position='left'],
.lv-widget-transform.no-orth-resize .lv-widget-transform-resize[data-position='right'],
.lv-widget-transform.no-orth-resize .lv-widget-transform-resize[data-position='top'] {
  display: none;
}
.lv-widget-transform.no-resize .lv-widget-transform-resize {
  display: none;
}
.lv-widget-transform-rotate {
  top: -20px;
  left: -20px;
  width: 12px;
  height: 12px;
  border-radius: 6px;
  cursor: crosshair;
}
.lv-widget-transform.no-rotate .lv-widget-transform-rotate {
  display: none;
}
.lv-widget-transform-active {
  border-color: transparent;
  pointer-events: all;
}
.lv-widget-transform-active > div {
  display: none;
}
.lv-widget-transform-active > .lv-widget-transform-active-handle {
  display: block;
  background-color: #808080;
}

</style>

<style lang="less">
#canvas {
  border: 1px grey solid;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

/* fabric canvas容器样式 */
.fabric-container {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  pointer-events: auto !important;
  z-index: 5; /* 确保在主canvas之上但在变换控件之下 */
}

.fabric-container canvas {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
}
</style>
