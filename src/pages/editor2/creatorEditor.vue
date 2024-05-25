<template>
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
    style="height: 420px" @click.stop @mousedown.stop @mouseup.stop @keypress.stop @keyup.stop @keydown.stop @contextmenu.stop />
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

export default {
  name : 'creator-editor',
  props: [],
  emits: ['cursor'],
  components: {
    VAceEditor,
  },
  data: function() {
    return {
      editor: null,
    }
  },
  mounted() {
    
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
      // this.py_edit_mode = py_edit_mode;
      // this.c_edit_mode = c_edit_mode;
    },
    setValue(text) {
      this.editor.setValue(text);
    },
    getValue() {
      return this.editor.getValue();
    },
  },
};
</script>
<style lang="less" scoped>

</style>
<style lang="less">
</style>
