<template>
  <div style="height: 100%;">
    <div class="mode-switch">
      <el-tooltip content="Switch between C and Python mode" placement="bottom">
        <el-radio-group v-model="config.format" @change="generateCode">
          <el-radio disabled value="cpp">C++</el-radio>
          <el-radio value="c">C</el-radio>
          <el-radio value="python">Python</el-radio>
        </el-radio-group>
      </el-tooltip> &nbsp;

      <el-button @click="exportCodeAsFile">
        <el-icon><Download /></el-icon>
        Export
      </el-button>
    </div>

    <v-ace-editor
      id="code-editor"
      @init="editorInit"
      value=""
      :lang="'python'"
      :options="{
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        fontSize: 14,
        tabSize: 2,
        showPrintMargin: false,
        highlightActiveLine: true,
      }"
      style="height: 600px" @click.stop @mousedown.stop @mouseup.stop @keypress.stop @keyup.stop @keydown.stop @contextmenu.stop />
  </div>
</template>

<script lang="ts">
import { VAceEditor } from 'vue3-ace-editor';
// import 'ace-builds/src-noconflict/mode-json'; // Load the language definition file used below
import 'ace-builds/src-noconflict/ext-language_tools';
// import "ace-builds/src-noconflict/snippets/sql";
// import "ace-builds/src-noconflict/mode-sql";
// import "ace-builds/src-noconflict/theme-monokai";
// import "ace-builds/src-noconflict/mode-html";
// import "ace-builds/src-noconflict/mode-html_elixir";
// import "ace-builds/src-noconflict/mode-html_ruby";
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-vue';
// import "ace-builds/src-noconflict/mode-python";
import 'ace-builds/src-noconflict/snippets/less';
// import "ace-builds/src-noconflict/theme-chrome";
// import "ace-builds/src-noconflict/ext-static_highlight";
// import "ace-builds/src-noconflict/ext-beautify";

// import snippetsJsUrl from 'ace-builds/src-noconflict/snippets/javascript?url';
// @ts-ignore
ace.config.set('basePath', '/node_modules/ace-builds/src-min-noconflict');

import { projectStore } from './store/projectStore';
import { Download } from '@element-plus/icons-vue';
import { saveAs } from './utils.js';

export default {
  name : 'creator-editor',
  props: [],
  emits: ['event'],
  components: {
    VAceEditor,
    Download,
  },
  data: function() {
    return {
      editor: null,
      config: projectStore.projectData.settings.output,
    }
  },
  mounted() {
    this.generateCode();
  },
  methods: {
    // Init the ace editor
    editorInit(editor) {
      // let editor = ace.edit("code-editor");
      editor.getSession().setUseWrapMode(true);
      editor.setAutoScrollEditorIntoView(true);
      editor.setFontSize(15);
      editor.resize();
      
      editor.setTheme("ace/theme/clouds_midnight");

      // let c_edit_mode = ace.require("ace/mode/c_cpp").Mode;
      // let py_edit_mode = ace.require("ace/mode/python").Mode;
      // editor.session.setMode(new py_edit_mode());
      editor.setOptions({ maxLines: '200px' });

      this.editor = editor;
    },
    setValue(text) {
      this.editor.setValue(text);
    },
    getValue() {
      return this.editor.getValue();
    },
    generateCode() {
      projectStore.projectData.settings.output.format = this.config.format;
      this.$emit('event', 'generateCode', this.config.format);
    },

    // Export the code in editor as a file.
    exportCodeAsFile: async function () {
      await this.generateCode();
      let code = this.getValue();
      // this.$message({
      //     message: 'Export file sucessfully',
      //     type: 'success'
      // });
      let blob = new Blob([code], {type: "text/plain;charset=utf-8"});
      let fileName = this.act_FileName || ('' + +new Date());
      if (projectStore.projectData.settings.output.format == 'c') {
        saveAs(blob, `lvgl_lv_${fileName}.h`);
        // this.sendMessage(CMD.exportCodeAsFile, { name: `lvgl_lv_${fileName}.h`, code });
      } else {
        saveAs(blob, `lvgl_lv_${fileName}.py`);
        // this.sendMessage(CMD.exportCodeAsFile, { name: `lvgl_lv_${fileName}.py`, code });
      }
    },
  },
};
</script>
<style lang="less" scoped>

</style>
<style lang="less">
</style>
