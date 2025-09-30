<template>
  <div
    id="mpy_repl"
    ref="terminalContainer"
    style="height: 200px; padding: 0 0 0 10px"
    :style="{ visibility: term_visible ? 'visible' : 'hidden' }"
  >
  </div>
</template>

<script lang="ts">
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

import engine from './engine.js';

export default {
  name : 'creator-simulator',
  props: [],
  emits: ['cursor'],
  data: function() {
    return {
      term: null,
      fitAddon: null,
      resizeObserver: null,

      //Terminal
      term_visible: false,
    }
  },
  mounted() {
    this.initVM();
    this.initResizeObserver();
  },
  beforeUnmount() {
    // 清理 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    initVM() {
      let vm = this;
      /* Initialize the xtermjs */
      var term = new Terminal({
        cursorBlink: true,
        //   theme: {
        //     background: '#fdf6e3'
        //   }
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      term.open(this.$refs.terminalContainer);
      fitAddon.fit();
      // term.write('Welcome To \x1B[1;3;31mLV LV-Extension\x1B[0m');

      /*Setup key input handler */
      term.onData(key => {
      // term.on('data', function(key, e) {
        for (var i = 0; i < key.length; i++) {
          engine.simulatorStdioInput(key.charCodeAt(i));
        }
      });

      vm.term = term;
      vm.fitAddon = fitAddon;
    },
    initResizeObserver() {
      // 创建 ResizeObserver 实例来监听容器尺寸变化
      this.resizeObserver = new ResizeObserver(entries => {
        // 当容器尺寸变化时，调整终端大小
        if (this.fitAddon) {
          this.fitAddon.fit();
        }
      });

      // 开始观察容器元素
      if (this.$refs.terminalContainer) {
        this.resizeObserver.observe(this.$refs.terminalContainer);
      }
    },
    write(text) {
      this.term.write(text);
    },
    clear() {
      this.term.clear();
      this.term.write('\r\x1b[K>>> ');
    },
  },
};
</script>
<style lang="less" scoped>

</style>
<style lang="less">
</style>