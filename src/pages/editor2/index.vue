<template>
  <el-container class="main">
    <el-header class="header-container">
      <el-menu class="el-menu-demo" mode="horizontal">
        <el-menu-item index="1">
          <h2>LVGL</h2>
        </el-menu-item>
        <el-sub-menu index="2">
          <template slot="title">Help</template>
          <el-menu-item index="2-1">
            <el-link href="https://docs.lvgl.io/master/index.html" target="_blank">Docs</el-link>
          </el-menu-item>
          <el-menu-item index="2-2">
            <el-link href="https://sim.lvgl.io/v8.3/micropython/ports/javascript/index.html" target="_blank">Sim</el-link>
          </el-menu-item>
        </el-sub-menu>
        <!-- <el-menu-item index="3" disabled>More</el-menu-item> -->
        <!-- <el-menu-item>
          <el-button icon="el-icon-camera-solid" @click="screenshot"></el-button>
          <el-divider direction="vertical"></el-divider>
        </el-menu-item> -->
        <!-- <el-menu-item>
          <el-button round @click="build">编译</el-button>
          <el-button round @click="run">下载</el-button>
          <el-button round @click="dialogSettingVisible = true">设置</el-button>
        </el-menu-item> -->
      </el-menu>

      <div class="header-right">
        <el-switch
          style="padding: 0 10px;"
          v-model="is_c_mode"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="C"
          inactive-text="Python"
          @change="generateCode"
        ></el-switch>
        <el-button-group >
          <el-button type="success" round @click="exportCodeAsFile">Export</el-button>
          <el-button type="primary" round @click="generateCode">Generate</el-button>
          <el-button type="primary" round @click="exportCodeAsLV">SaveFile</el-button>
          <el-button type="success" round @click="savePage">Save</el-button>
        </el-button-group>
      </div>
    </el-header>

    <el-container class="main-container">
      <el-aside width="15%">
        <creator-widgets @create="Creator"></creator-widgets>

        <el-divider></el-divider>
        <el-tag class="widget-name">{{ selectNode.id }}</el-tag>
        <creator-tree :screen-layout="widget_tree" :node-key="selectNode.id" @event="handleTreeEvent"></creator-tree>
      </el-aside>

      <el-main style="padding: 0">
        <el-tabs type="border-card" v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="Simulator" name="simulator">
            <creator-simulator ref="simulator" @cursor="cursorXY" @event="handleSimulatorEvent" @console="handleSimulatorConsole"></creator-simulator>
            <creator-anim-console :timelines="timelines"></creator-anim-console>
          </el-tab-pane>
          <el-tab-pane label="Anim" name="anim">
            <creator-anim :timelines="timelines" @save="handleAnimSave"></creator-anim>
          </el-tab-pane>
          <el-tab-pane label="Font" name="font">
            <creator-font></creator-font>
          </el-tab-pane>
          <el-tab-pane label="Image" name="image">
            <creator-image></creator-image>
          </el-tab-pane>
          <el-tab-pane label="Code" name="code">
            <creator-editor ref="editor"></creator-editor>
          </el-tab-pane>
          <el-tab-pane label="Project" name="Project">    
            <el-switch
              style="padding: 0 10px;"
              v-model="is_c_mode"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="C"
              inactive-text="Python"
              @change="generateCode"
            ></el-switch>
          </el-tab-pane>
        </el-tabs>

        <div style="margin: 18px">
          <i class="el-icon-monitor">REPL Terminal</i>
          <el-switch v-model="term_visible"></el-switch>
          <el-button icon="el-icon-refresh" circle @click="refreshTerm"></el-button>
          <i style="float: right"
            >X: {{ cursorX }}, Y: {{ cursorY }}
            <el-tooltip :value="editScreenSize" manual effect="light" placement="top">
              <template #content><div slot="content" style="color: red">* 更改分辨率会重新加载页面</div></template>
              <div style="display: inline-block">
                Size:
                <el-input
                  :disabled="!editScreenSize"
                  v-model.number="screenWidth"
                  style="width: 85px !important"
                  size="small"
                  type="text"
                ></el-input>
                x
                <el-input
                  :disabled="!editScreenSize"
                  v-model.number="screenHeight"
                  style="width: 85px !important"
                  size="small"
                  type="text"
                ></el-input>
              </div>
            </el-tooltip>
            <el-button
              v-show="editScreenSize"
              icon="el-icon-close"
              circle
              @click="editScreenSize = false"
            >
            </el-button>
            <el-button
              :type="editScreenSize ? 'success' : 'primary'"
              :icon="editScreenSize ? 'el-icon-check' : 'el-icon-edit'"
              circle
              @click="editScreenSize ? changeScreenSize() : (editScreenSize = true)"
            >
            </el-button>
          </i>
        </div>

        <creator-term ref="term" :style="{ visibility: term_visible ? 'visible' : 'hidden' }"></creator-term>
      </el-main>

      <el-aside width="20%" style="padding-right: 10px">

        <el-tabs type="border-card" model-value="args" class="tab-full" style="height: 100%;">
          <el-tab-pane label="Attr" name="args">
            <creator-attribute :id="selectNode.id" :info-pool="InfoPool" @change-id="handleChangeID"
            @change="handleSetterChange"></creator-attribute>
          </el-tab-pane>
          <el-tab-pane label="Event" name="event">
            
          </el-tab-pane>
          <!-- <el-tab-pane label="样式" name="style" style="height: 800px;overflow: scroll">
            <div style="padding-left: 10px">
              <lvgl-style-setter2
                :id="selectNode.id"
                :infpool="InfoPool"
                @change="handleSetterChange"
              >
              </lvgl-style-setter2>
            </div>
          </el-tab-pane> -->
        </el-tabs>
      </el-aside>
    </el-container>

    <el-dialog width="80%" :visible.sync="dialogSettingVisible">
      <div class="setting_item">
        编译脚本
        <el-input placeholder="请选择编译脚本" v-model="buildScriptPath" @input="saveBuildScript">
          <el-button slot="append" icon="el-icon-document" @click="selectBuildScript"> </el-button>
        </el-input>
      </div>
      <div class="setting_item">
        下载脚本
        <el-input placeholder="请选择下载脚本" v-model="runScriptPath" @input="saveRunScript">
          <el-button slot="append" icon="el-icon-document" @click="selectRunScript"> </el-button>
        </el-input>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
  import 'element-plus/theme-chalk/dark/css-vars.css'
  import {useDark, useToggle} from '@vueuse/core'

  const isDark = useDark()
  isDark.value = true;

  import * as WidgetData from './widgetData.js';
  import * as api from './widgetApis.js';
  
  import { reverse_del_node, pool_delete, setArgvs, dispatch_data_changed_event, debounceFun, saveAs } from './utils.js';
  import {
    wrap_create,
    wrap_delete,
    wrap_setter_str,
    wrap_rename,

    wrap_create_v2,
    wrap_show, wrap_hide, wrap_set_index,
    wrap_style_setter_v2,
    wrap_attr_setter_v2,
    wrap_timeline_load,
    wrap_timeline_stop_all,
  } from './runtimeWrapper.js';
  import { python_generator, c_generator } from './runtimeCompiler.js';
  import { Categorize, Data_Changed_Event, MSG_AUTO_SAVE_PAGE_SUCC, MSG_SAVE_PAGE_SUCC } from  './constant.js';
  import { CMD } from  './cmd.js';

  import * as Store from './store.js';

  import lvglAttrAlign from './lvglAttrAlign.vue';
  import lvglAttrSetter2 from './lvglAttrSetter2.vue';
  import lvglStyleSetter2 from './lvglStyleSetter2.vue';

  import creatorWidgets from './creatorWidgets.vue';
  import creatorTree from './creatorTree.vue';
  import creatorSimulator from './creatorSimulator.vue';
  import creatorTerm from './creatorTerm.vue';
  import creatorEditor from './creatorEditor.vue';
  import creatorAttribute from './creatorAttribute.vue';
  import creatorAnim from './creatorAnim.vue';
  import creatorAnimConsole from './creatorAnimConsole.vue';
  import creatorFont from './creatorFont.vue';
  import creatorImage from './creatorImage.vue';

  import testData from './testData.json';

  
  export default {
    name: 'lvgl-editor',
    provide() {
      return {};
    },
    components: {
      lvglAttrAlign,
      lvglAttrSetter2,
      lvglStyleSetter2,

      creatorWidgets,
      creatorTree,
      creatorSimulator,
      creatorTerm,
      creatorEditor,
      creatorAttribute,

      creatorAnimConsole,
      creatorAnim,
      creatorFont,
      creatorImage,
    },
    data() {
      return {
        version: '1.0.0',
        versionCode: 1,
        editor: null,
        c_edit_mode: null,
        py_edit_mode: null,
        is_c_mode: true, //true: c, false: python

        posJSON: {},
        WidgetPool: {},
        InfoPool: {},
        Api: {},
        timelines: [],

        setter: api.setter,

        //Simulator
        screenWidth: 480,
        screenHeight: 320,
        cursorX: 0,
        cursorY: 0,

        //Creator
        creator_options: WidgetData.WidgetsOption,
        props: { emitPath: false, expandTrigger: 'hover' },
        widgetNum: 0,
        Count: 0,
        act_FileName: '',

        //TreeView
        widget_tree: [
          {
            id: 'screen',
            label: 'screen',
            widgetType: 'screen',
            children: [],
          },
        ],

        // Which node in TreeView was checked
        selectNode: {
          id: null,
          obj: null,
          // type: null,  // DEPRECATED
        },
        selectedType: '',
        selectNodeData: {}, // The Attributes

        //Terminal
        term_visible: false,

        // Style Editor
        style_visible: false,
        style: {
          body: {
            main_color: null,
            grad_color: null,
          },
          text: {
            color: '#409EFF',
            font: 'font_roboto_16',
          },
          image: {},
          line: {},
        },

        editScreenSize: false,

        // setting dialog
        dialogSettingVisible: false,
        buildScriptPath: window.localStorage.getItem('buildScriptPath') || '',
        runScriptPath: window.localStorage.getItem('runScriptPath') || '',

        // tabs
        activeTab: 'simulator',
      };
    },

    watch: {
      //Parse string to JSON
      str_json: function () {
        
        // this.$refs.TreeView.setCurrentKey(this.currentWidget.id);
      },
    },

    mounted() {
      // console.log('mounted', this, Store.getTreeList());
      window.vue2 = this;
      
      let pageData = {};
      let json = localStorage.getItem("lvgl_data");
      if (json) {
        pageData = JSON.parse(json);
      } else {
        pageData = testData;
      }

      setTimeout(() => {
        let vm = this;

        if (!pageData) {
          pageData = {};
        }
        Object.assign(vm.$data, pageData);

        if (!this.InfoPool['screen']) {
          this.addInfo('screen', '', 'screen');
          let screen = this.getWidgetById('screen');
          Object.assign(screen.data, { x: 0, y: 0, width: 480, height: 480 });
        }

        this.mpylvInit();
        this.restorePageData();

      }, 2000);
      
    },
    methods: {
      mpylvInit() {
        let vm = this;

        window.addEventListener(
          Data_Changed_Event,
          (e) => {
            debounceFun(10 * 1000, function (v, v2) {
              vm.savePage({}, MSG_AUTO_SAVE_PAGE_SUCC);
            });
          },
          false
        );

        let screen = this.getWidgetById('screen');
        const width = screen.data?.width;
        const height = screen.data?.height;
        vm.screenWidth = width;
        vm.screenHeight = height;

        this.$refs.simulator.initScreen({width: width, height: height});

      },
      restorePageData() {
        let vm = this;
        let InfoPool = this.InfoPool;
        for (let id in InfoPool) {
          let info = InfoPool[id];
          info.id = id;
          // this.InfoPool[id].data = pageData.WidgetPool[id];
          if (id !== 'screen') {
            wrap_create_v2(info, false);
          }
          wrap_attr_setter_v2(info);
          wrap_style_setter_v2(info);

          if (info.data.index) {
            wrap_set_index(id, info.data.index);
          }
        }
        wrap_timeline_load(this.timelines);
        
        this.activeNode('screen');
      },
      getWidgetById(id) {
        return this.InfoPool[id];
      },

      handleSimulatorEvent(json) {
        if (json.action == 'click') {
          this.activeNode();
          return;
        }

        dispatch_data_changed_event();
        // console.log('watch str_json', this.str_json);

        try {
          let id = json.id;
          let node = this.getWidgetById(id);
          let data = node.data;
          for (let key in json.data) {
            data[key] = json.data[key];

            this.changeInfo(id, key);
          }

          this.selectNodeData = data;

          if (json.action == 'query_xy') {
            // this.drawRect(data.x, data.y, data.width, data.height);
            this.activeNode(id);
          }
        } catch (error) {
          console.error(error);
        }
      },
      handleSimulatorConsole(text) {
        this.$refs.term.write(text);
      },
      handleAnimSave() {
        dispatch_data_changed_event();

        wrap_timeline_stop_all();
        wrap_timeline_load(this.timelines);
      },
      refreshTerm: function () {
        this.$refs.term.clear();
      },

      Creator: function (selectedType) {
        let parent_id = this.getCurrentID();
        if (parent_id === null) {
          this.$message({
            message: 'You must choose a widget!',
            type: 'error',
          });
          return;
        }
        if (parent_id == '') {
          this.$message({
            message: 'You created a widget invisible',
            type: 'warning',
          });
        }
        this.createWidget(selectedType, parent_id);
      },

      //Parametres are the String type
      createWidget: function (type, strPar) {
        var id = this.makeID(type);
        var par = strPar;

        this.appendNode(id, type, par);

        //Store Info that a widget was created from.
        this.addInfo(id, par, type);

        wrap_create(id, par, type);

        return id;
      },

      //Parametres are the String type
      copyWidget: function (info2) {
        var id = this.makeID(info2.type);
        var par = info2.parent;
        
        let info = {}
        Object.assign(info, JSON.parse(JSON.stringify(info2)));
        info.id = id;
        this.InfoPool[id] = info;

        //TODO: BUG
        this.appendNode(id, info.type, par);

        wrap_create_v2(info, false);
        wrap_attr_setter_v2(info);
        wrap_style_setter_v2(info);

        return id;
      },

      // Increase by 1
      makeID: function (type) {
        let id = type + '_' + (this.Count++).toString(16);
        this.widgetNum += 1;
        return id;
      },

      // Add some information for the new widget to InfoPool
      addInfo: function (id, par_name, type) {
        let info = {
          parent: par_name,
          id: id,
          type: type,
          zindex: 0,
          cb: false,
          attributes: ['x', 'y', 'width', 'height'],
          apis: [],
          styles: [],
          data: {},
        };
        this.InfoPool[id] = info;
      },

      // Append new node to TreeView
      appendNode(widget_name, widgetType, parentId) {
        let new_child = {
          id: widget_name,
          label: widget_name,
          widgetType: widgetType,
          show: true,
          children: [],
        };
        let parentNode = this.getTreeChildren(this.widget_tree[0], parentId);
        if (parentNode) {
          parentNode.children.push(new_child);
        }
        console.log('appendNode', parentNode);
        // let node = this.$refs.TreeView.getCurrentNode();
        // if (node != null) {
        //   node.children.push(new_child);
        // }
      },
      getTreeChildren: function(tree, id) {
        if (tree.label == id) {
          return tree;
        }
        for (let i = 0; i < tree.children.length; i++) {
          let item = tree.children[i];
          if (item.label == id) {
            return item;
          }
          if (item.children.length) {
            let node = this.getTreeChildren(item, id);
            if (node) {
              return node;
            }
          }
        }
        return null;
      },
      // Delete node and its childs(reverse)
      deleteNode: function (node, data) {
        // const node = this.selectNode.obj;
        const id = data.label;

        if (id == 'screen' || id == '') {
          this.$message({
            message: "You can't delete the screen or nothing!",
            type: 'error',
          });
          return; // Not support delete screen now
        }
        // delete child
        let record = [id]; // Which child was deleted
        reverse_del_node(node.data, record);

        // delete itself
        const children = node.parent.data.children;
        const index = children.findIndex((d) => d.label === id);
        wrap_delete(id);
        children.splice(index, 1);
        this.widgetNum -= record.length;

        // Clear this.selectNode
        this.selectNode.obj = null;
        this.selectNode.id = null;

        // Remove the related info
        pool_delete(this.InfoPool, record);
        
        this.activeNode('screen');

        dispatch_data_changed_event();

        this.$message({
          message: 'Delete sucessfully',
          type: 'success',
        });
      },

      handleTreeEvent(event, node, data) {
        let id = data ? data.label : '';
        // console.log('handleTreeEvent', event, id, data);
        if (event == 'delete') {
          this.deleteNode(node, data);
        } else if (event == 'copy') {
          let info = this.InfoPool[id];
          console.log('copy', node, data, info);

          let id2 = this.copyWidget(info);
        } else if (event == 'show') {
          data.show = true;
          wrap_show(id);
        } else if (event == 'hide') {
          data.show = false;
          wrap_hide(id);
        } else if (event == 'click') {
          this.activeNode(id);
        } else if (event == 'sort') {
          this.sortNode(this.widget_tree);
        }
      },
      sortNode(nodes) {
        let index = 1;
        for (let i = nodes.length - 1; i >= 0; i--) {
          let id = nodes[i].label;
          let info = this.InfoPool[id];
          info.data.index = index;
          wrap_set_index(id, info.data.index);
          index++;
          this.sortNode(nodes[i].children);
        }
      },
      activeNode: function (id = 'screen') {
        let info = this.InfoPool[id];
        this.$refs.simulator.activeFrame(info);

        if (this.selectNode.id == id) {
          return;
        }

        let node = this.getTreeChildren(this.widget_tree[0], id);
        if (!node) {
          // NOTICE
          return;
        }
        console.log('selectNode', id);

        this.selectNode.id = id;
        this.selectNode.obj = node;
 
        // // If WidgetPool doesn't has infomation of the widget
        // if (this.InfoPool[id] == undefined) {
        //   let type = "'obj'";
        //   if (id != 'screen') {
        //     type = this.InfoPool[id]['type'];
        //   }
        //   wrap_query_attr(id, type);
        //   return;
        // }

        // if (id != 'screen') {
        //     this.selectNode.type = this.InfoPool[id]['type'];   // TODO
        // } DEPRECATED
        this.selectNodeData = node.data;
      },

      // Get the id of recently checked node
      getCurrentID: function () {
        return this.selectNode.id;
        // node = this.$refs.TreeView.getCurrentNode()
        // if (node != null) {
        //     return node.label;
        // }
        // return null;
      },


      // For text or number, save something in InfoPool
      changeInfo: function (id, attribute_name) {
        if (id == 'screen' && this.InfoPool[id] == undefined) {
          this.addInfo('screen', '', 'screen');
        }
        let index = this.InfoPool[id].attributes.indexOf(attribute_name);
        if (index == -1) {
          this.InfoPool[id].attributes.push(attribute_name);
        }
      },
      
      // Update the X & Y below the Simulator
      cursorXY: function (cursorX, cursorY) {
        this.cursorX = cursorX;
        this.cursorY = cursorY;
      },

      handleSetterChange({ id, name, mode }) {
        console.log('handleSetterChange', id, name, mode);
        dispatch_data_changed_event();
        let node = this.InfoPool[id];
        let type = node.type;

        if (mode == 'styles') {
          wrap_style_setter_v2(node);
        } else {
          let body = this.setter[type][name];
          let args_list = node.data[body.api];
          wrap_setter_str(id, body.api, args_list);
        }
      },

      // Take a screenshot for the Simulator
      screenshot: function () {
        document.getElementById('canvas').toBlob((blob) => {
          saveAs(blob, 'screenshot.png');
        });
      },

      // Generate the code and print them to the editor.
      generateCode: async function () {
        let preview_code = '';
        let screen = {info: this.InfoPool, timelines: this.timelines };
        if (this.is_c_mode) {
          preview_code = c_generator(screen, this.act_FileName);
        } else {
          preview_code = python_generator(screen, this.act_FileName);
        }
        await this.$refs.editor.setValue(preview_code);
        this.activeTab = 'code';
        this.$message({
          message: 'Generate code sucessfully',
          type: 'success',
        });
      },

      // Export the code in editor as a file.
      exportCodeAsFile: async function () {
        await this.generateCode();
        let code = await this.$refs.editor.getValue();
        // this.$message({
        //     message: 'Export file sucessfully',
        //     type: 'success'
        // });
        let blob = new Blob([code], {type: "text/plain;charset=utf-8"});
        let fileName = this.act_FileName || ('' + +new Date());
        if (this.is_c_mode) {
          saveAs(blob, `lvgl_lv_${fileName}.h`);
          // this.sendMessage(CMD.exportCodeAsFile, { name: `lvgl_lv_${fileName}.h`, code });
        } else {
          saveAs(blob, `lvgl_lv_${fileName}.py`);
          // this.sendMessage(CMD.exportCodeAsFile, { name: `lvgl_lv_${fileName}.py`, code });
        }
      },
      async exportCodeAsLV() {
        let json = await this.savePage();
        let code = JSON.stringify(json, 0, 4);
        let blob = new Blob([code], {type: "text/plain;charset=utf-8"});
        let fileName = +new Date();
        saveAs(blob, `lvgl_gui_builder_${fileName}.lv`);
      },

      // Set the style
      makeStyle: function () {
        wrap_simple_style(this.selectNode.id, this.style);
      },

      //Highlight object
      drawRect: (x, y, w, h) => {
        let ctx = document.getElementById('canvas').getContext('2d');
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, w, h);
      },

      setArgs: (args) => {
        return setArgvs(args);
      },

      sendMessage(cmd, data) {
        return { data: 1 };
        // axios.post(`/index`, {cmd, data}).then(res => {
        //     // console.log(`状态码: ${res.statusCode}`)
        //     // console.log("client receive:", res.data)
        // }).catch(error => {watch str_json
        //     console.error(error);
        // });

        return axios.post(`/index`, { cmd, data }).catch((error) => {
          console.error(error);
        });
      },

      changeScreenSize() {
        let screen = this.getWidgetById('screen');
        screen.data.width = this.screenWidth;
        screen.data.height = this.screenHeight;

        if (this.savePage({}, MSG_SAVE_PAGE_SUCC)) {
          window.location.reload();
        } else {
          this.$message({
            message: 'Change failed',
            type: 'error',
          });
        }
      },

      selectBuildScript() {
        this.sendMessage(CMD.selectScript).then((v) => {
          if (v && v.status === 200 && v.data) {
            this.buildScriptPath = v.data;
            this.saveBuildScript();
          }
        });
      },

      selectRunScript() {
        this.sendMessage(CMD.selectScript).then((v) => {
          if (v && v.status === 200 && v.data) {
            this.runScriptPath = v.data;
            this.saveRunScript();
          }
        });
      },

      build() {
        if (this.buildScriptPath) {
          this.sendMessage(CMD.build, this.buildScriptPath);
        } else {
          this.dialogSettingVisible = true;
        }
      },

      run() {
        if (this.runScriptPath) {
          this.sendMessage(CMD.run, this.runScriptPath);
        } else {
          this.dialogSettingVisible = true;
        }
      },

      saveBuildScript() {
        window.localStorage.setItem('buildScriptPath', this.buildScriptPath);
      },

      saveRunScript() {
        window.localStorage.setItem('runScriptPath', this.runScriptPath);
      },

      // Save code to lvgl file.
      savePage: async function (event, msg = MSG_SAVE_PAGE_SUCC) {
        let lvgl_data = {};
        lvgl_data[`version`] = this.version;
        lvgl_data[`versionCode`] = this.versionCode;
        lvgl_data[`InfoPool`] = this.InfoPool;
        lvgl_data[`timelines`] = this.timelines;
        lvgl_data[`widget_tree`] = this.widget_tree;
        lvgl_data[`selectedType`] = this.selectedType;
        lvgl_data[`widgetNum`] = this.widgetNum;
        lvgl_data[`Count`] = this.Count;
        lvgl_data[`term_visible`] = this.term_visible;
        lvgl_data[`is_c_mode`] = this.is_c_mode;

        localStorage.setItem("lvgl_data", JSON.stringify(lvgl_data));

        console.log('save', lvgl_data);
        const res = await this.sendMessage(CMD.savePage, lvgl_data);
        if (res.data) {
          this.$message({
            message: msg,
            type: 'success',
          });
        } else {
          this.$message({
            message: 'Save failed',
            type: 'error',
          });
        }
        return lvgl_data;
        return res.data;
      },

      handleTabChange(name) {
        if (name == 'code') {
          this.generateCode();
        }
      },

      handleChangeID(id) {
        ElMessageBox.prompt('ID（' + id + '）  new ID：', 'Edit ID', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          inputValue: id,	
        })
        .then(({ value }) => {
          let newid = value;
          if (this.InfoPool[newid]) {
            ElMessage({
              type: 'info',
              message: `Already exists:${value}`,
            })
          } else {
            let treeNode = this.getTreeChildren(this.widget_tree[0], id);
            this.InfoPool[newid] = this.InfoPool[id];
            this.InfoPool[newid].id = newid;
            treeNode.id = newid;
            treeNode.label = newid;
            delete this.InfoPool[id];
            wrap_rename(id, newid);
            this.activeNode(newid);
          }
        })
        .catch(() => {
        })
      },
    },
  };
</script>

<style lang="less" scoped>
.main {
  height: 100%;
  font-size: 14px;
}
.header-container {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  margin: 0;
  display: flex;
  justify-content: space-between;

  .header-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-grow: 1;
  }
}
.main-container {
  height: 100%;

}
</style>

<style lang="less">
  [v-cloak] {
    display: none;
  }

  .dark #app {
    color: white;
  }

.tab-full.el-tabs {
  display: flex;
  flex-flow: column;
  height: 100%;

  .el-tabs__content {
    flex: 1;
    overflow: scroll;
  }
}
</style>
