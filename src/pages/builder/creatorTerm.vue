<template>
  <div
    id="mpy_repl"
    style="height: 270px"
    :style="{ visibility: term_visible ? 'visible' : 'hidden' }"
  >
  </div>
</template>

<script lang="ts">
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

import * as engine from '@lvgl/v8.3.0/index.js';

export default {
  name : 'creator-simulator',
  props: [],
  emits: ['cursor'],
  data: function() {
    return {
      term: null,

      //Terminal
      term_visible: false,
    }
  },
  mounted() {
    this.initVM();
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

      term.open(document.getElementById('mpy_repl'));
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
