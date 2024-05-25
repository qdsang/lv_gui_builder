<template>
  <div id="mp_js_stdout" style="text-align: center" @click="handleClick">
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

    <div class="lv-widget-transform" ref="transform" v-show="isTransform" style="width: 52px; height: 52px; left: 240px; top: 190px;">
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-nw" data-position="top-left"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-n" data-position="top"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-ne" data-position="top-right"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-e" data-position="right"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-se" data-position="bottom-right"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-s" data-position="bottom"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-sw" data-position="bottom-left"></div>
      <div draggable="false" class="lv-widget-transform-resize lv-widget-transform-cursor-w" data-position="left"></div>
      <div draggable="false" class="lv-widget-transform-rotate"></div>
    </div>
  </div>
</template>

<script lang="ts">
import * as WidgetData from './widgetData.js';
import {
  wrap_create,
  wrap_query_attr,
  wrap_equal,
  wrap_simple_setter,
  wrap_delete,
  wrap_setter_str,
  wrap_attributes_setter_str,
  wrap_style_setter_str,
  wrap_style_setter_v2,
  wrap_apis_setter_str,
} from './runtimeWrapper.js';


import {
    MicroPython,
    mp_js_init,
    mp_js_do_str,
    mp_js_init_repl,
    mp_js_process_char,
  } from './micropython.js';

import * as wasm_file_api from './wasm_file_api.js';
wasm_file_api;

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
    }
  },
  created() {
    window.addEventListener("resize", this.resizeEventHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeEventHandler);
  },
  mounted() {
    MicroPython.run();
    let runing = 0;
    let timer = setInterval(() => {
      runing += 10;
      if (mp_js_init) {
        console.log('VM init:', runing+'ms');
        clearInterval(timer);
        this.initVM();
      }
    }, 10);

    let vm = this;
    window.addEventListener(
        'python:stdout_print',
      (e) => {
        // setTimeout(() => {
          // @ts-ignore
          let data = e.data;
          for (let i = 0; i < data.length; i++) {
            vm.handleOutput(data[i]);
          }
        // }, 50);
      },
      false
    );
  },
  methods: {
    initVM() {
      MicroPython.canvas = document.getElementById('canvas');

      /* Bind mp_js_stdout */
      // let mp_js_stdout = document.getElementById('mp_js_stdout');
      // mp_js_stdout.value = '';


      /*Initialize MicroPython itself*/
      mp_js_init(8 * 1024 * 1024);

      /* Add function querry_attr() & walv_callback() */
      mp_js_do_str(WidgetData.QueryCode.join('\n'));
      wrap_equal('ATTR', JSON.stringify(WidgetData.Getter)); //Add ATTR to mpy, ATTR is common getter

      /*Setup lv_task_handler loop*/
      var the_mp_handle_pending = MicroPython.cwrap('mp_handle_pending', null, [], { async: true });
      function handle_pending() {
        the_mp_handle_pending();
        setTimeout(handle_pending, 10); // should call lv_task_handler()
      }

      /*Initialize the REPL.*/
      mp_js_init_repl();

      /*Start the main loop, asynchronously.*/
      handle_pending();
    },
    initScreen({ width, height}) {
      this.screen.width = width;
      this.screen.height = height;

      /* Run init script */
      mp_js_do_str(WidgetData.EnvInitCode(width, height).join('\n'));

      MicroPython.canvas.style.width = width+'px';
      MicroPython.canvas.style.height = height+'px';
    },
    activeFrame(info) {
      if (info.type == 'screen') {
        this.isTransform = false;
        this.activeInfo = null;
        return;
      }
      
      let { x, y, width, height } = info.data;
      let style = this.$refs.transform.style;
      let canvas = this.$refs.canvas;
      style.left = x + canvas.offsetLeft + 'px';
      style.top = y + canvas.offsetTop + 'px';
      style.width = width + 'px';
      style.height = height + 'px';
      this.isTransform = true;
      this.activeInfo = info;
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
        this.$emit('console', text);
      }
      return text;
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
  border: 2px grey solid;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
</style>
