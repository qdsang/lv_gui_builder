<template>
  <el-container class="main">
    <el-header class="header-container">
      <div class="header-left">
        <div class="logo-section">
          <h1 class="logo-text">
            <span class="logo-brand">LV</span>
            <el-divider direction="vertical" />
            <span class="logo-product">GUI Builder</span>
          </h1>
        </div>

        <el-menu class="header-menu" mode="horizontal">
          <el-sub-menu index="demo">
            <template #title>
              <span>Demo</span>
            </template>

            <el-menu-item>
              <el-link href="#/lv/editor/demo1">Demo1</el-link>
            </el-menu-item>
            <el-menu-item>
              <el-link href="#/lv/editor/demo2">Demo2</el-link>
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item>
            <el-link href="https://docs.lvgl.io/master/index.html" target="_blank">
              <el-icon><Link /></el-icon>
              Documentation
            </el-link>
          </el-menu-item>
          <el-menu-item>
            <el-link href="https://sim.lvgl.io/v8.3/micropython/ports/javascript/index.html" target="_blank">
              <el-icon><Monitor /></el-icon>
              Simulator
            </el-link>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="header-right">
        <el-button-group class="action-buttons">
          <el-tooltip content="Generate Code" placement="bottom">
            <el-button @click="generateCode">
              <el-icon><DocumentAdd /></el-icon>
              Generate
            </el-button>
          </el-tooltip>
          <el-tooltip content="Save Project" placement="bottom">
            <el-button @click="savePage">
              <el-icon><Select /></el-icon>
              Save
            </el-button>
          </el-tooltip>
          <el-tooltip content="Export Project Lv File" placement="bottom">
            <el-button @click="exportCodeAsLV">
              <el-icon><FolderOpened /></el-icon>
              Save File
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>
    </el-header>

    <creator-window>
      <template #left>
        <creator-widgets @create="handleCreator"></creator-widgets>
        <el-divider></el-divider>
        <el-tag class="widget-name">{{ selectNodeId }}</el-tag>
        <creator-tree :node-key="selectNodeId" @event="handleTreeEvent"></creator-tree>
      </template>
      <template #center>
        <el-tabs type="border-card" v-model="activeTab" @tab-change="handleTabChange" style="border: none;">
          <el-tab-pane label="Simulator" name="simulator">
            <creator-simulator ref="simulator" @cursor="cursorXY" @event="handleSimulatorEvent" @console="handleSimulatorConsole"></creator-simulator>
            <creator-anim-console></creator-anim-console>
          </el-tab-pane>
          <el-tab-pane label="Anim" name="anim" :lazy="true">
            <creator-anim @save="handleAnimSave"></creator-anim>
          </el-tab-pane>
          <el-tab-pane label="Font" name="font" :lazy="true">
            <creator-font></creator-font>
          </el-tab-pane>
          <el-tab-pane label="Image" name="image" :lazy="true">
            <creator-image></creator-image>
          </el-tab-pane>
          <el-tab-pane label="Code" name="code" :lazy="true">
            <creator-editor ref="editor" @event="generateCode"></creator-editor>
          </el-tab-pane>
          <el-tab-pane label="Project" name="project" :lazy="true">
            <creator-project-settings 
              ref="projectSettings"
              @save="handleProjectSettingsChange"
            />
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
      </template>
      <template #right>
        <el-tabs type="border-card" model-value="args" class="tab-full" style="height: 100%;">
          <el-tab-pane label="Attr" name="args">
            <creator-attribute :id="selectNodeId" @change-id="handleChangeID"
            @change="handleSetterChange"></creator-attribute>
          </el-tab-pane>
          <el-tab-pane label="Event" name="event">
            
          </el-tab-pane>
          <!-- <el-tab-pane label="样式" name="style" style="height: 800px;overflow: scroll">
            <div style="padding-left: 10px">
              <lvgl-style-setter2
                :id="selectNodeId"
                @change="handleSetterChange"
              >
              </lvgl-style-setter2>
            </div>
          </el-tab-pane> -->
        </el-tabs>
      </template>
    </creator-window>
  </el-container>
</template>

<script>
  import 'element-plus/theme-chalk/dark/css-vars.css'
  import {useDark, useToggle} from '@vueuse/core'

  const isDark = useDark()
  isDark.value = true;

  import * as WidgetData from './widgetData.js';
  import * as api from './widgetApis.js';
  
  import { setArgvs, dispatch_data_changed_event, debounceFun, saveAs } from './utils.js';
  import { Categorize, Data_Changed_Event, MSG_AUTO_SAVE_PAGE_SUCC, MSG_SAVE_PAGE_SUCC } from  './constant.js';
  import { CMD } from  './cmd.js';
  import {
    wrap_delete,
    wrap_setter_str,
    wrap_rename,

    wrap_create_v2,
    wrap_show, wrap_hide, wrap_set_index,
    wrap_style_setter_v2,
    wrap_attr_setter_v2,
    wrap_simple_setter,
    wrap_timeline_load,
    wrap_timeline_stop_all,
  } from './runtimeWrapper.js';
  import { python_generator, c_generator } from './runtimeCompiler.js';

  import { projectStore } from './store/projectStore';
  import { initDemo, initDemoProject } from './store/demo';

  import creatorWindow from './creatorWindow.vue';
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
  import creatorProjectSettings from './creatorProjectSettings.vue';

  import { Download, FolderOpened, Document, Monitor, DocumentAdd, Select, Link } from '@element-plus/icons-vue'

  
  export default {
    name: 'lvgl-editor',
    provide() {
      return {};
    },
    components: {
      creatorWindow,
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
      creatorProjectSettings,

      Download,
      FolderOpened,
      Document, 
      Monitor,
      DocumentAdd,
      Select,
      Link,
    },
    data() {
      return {
        //Simulator
        screenWidth: 480,
        screenHeight: 320,
        cursorX: 0,
        cursorY: 0,

        //Creator
        act_FileName: '',

        // Which node in TreeView was checked
        selectNodeId: null,

        //Terminal
        term_visible: true,

        editScreenSize: false,

        // tabs
        activeTab: 'simulator',

        // 添加项目配置
        projectConfig: null,
          
        shortcuts: {
          // ... existing shortcuts ...
          'arrowleft': this.handleMove('left', -1),
          'arrowright': this.handleMove('right', 1),
          'arrowup': this.handleMove('up', -1),
          'arrowdown': this.handleMove('down', 1),
          'shift+arrowleft': this.handleMove('left', -4),
          'shift+arrowright': this.handleMove('right', 4),
          'shift+arrowup': this.handleMove('up', -4),
          'shift+arrowdown': this.handleMove('down', 4),
        },
      };
    },

    watch: {
      //Parse string to JSON
      str_json: function () {
        
        // this.$refs.TreeView.setCurrentKey(this.currentWidget.id);
      },
      // 添加对路由参数的监听
      '$route.params.id': {
        handler: async function(newId, oldId) {
          this.initProject();
          this.initWidgets();
        },
        immediate: false // 组件首次加载时不触发
      }
    },
    
    mounted() {
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
      // 添加键盘事件监听
      window.addEventListener('keydown', this.handleKeyDown);

      initDemo();
      this.initProject();
      this.mpylvInit();
    },
    beforeDestroy() {
      // 移除键盘事件监听
      window.removeEventListener('keydown', this.handleKeyDown);
    },
    methods: {
      initProject() {
        const id = this.$route.params.id;
        console.log('initProject', id);
        const key = `lvgl_project_${id}`;
        let savedData = localStorage.getItem(key);
        if (!savedData) {
          initDemoProject(id);
        }

        this.clearSimulatorWidgets();
        projectStore.initProject(id);
      },
      async mpylvInit() {
        await this.$refs.simulator.initialComplete();

        let screen = this.getWidgetById('screen');
        const width = screen.data?.width;
        const height = screen.data?.height;
        this.screenWidth = width;
        this.screenHeight = height;

        this.$refs.simulator.initScreen({width: width, height: height});
        this.initWidgets();
      },
      initWidgets() {
        let widgets = projectStore.getComponents();
        for (let id in widgets) {
          let info = widgets[id];
          info.id = id;
          
          if (id !== 'screen') {
            wrap_create_v2(info, false);
          }
          wrap_attr_setter_v2(info);
          wrap_style_setter_v2(info);

          if (info.zindex) {
            wrap_set_index(id, info.zindex);
          }
        }
        wrap_timeline_load(projectStore.getTimelines());

        this.activeNode('screen');
      },
      clearSimulatorWidgets() {
        try {
          let widgets = projectStore.getComponents();
          for (let id in widgets) {
            try {
              if (id == 'screen') {
                continue;
              }
              wrap_delete(id);
            } catch (error) {
              console.error(error);
            }
          }
          wrap_timeline_stop_all();
        } catch (error) {
        }
      },
      getWidgetById(id) {
        return projectStore.getWidgetById(id);
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
        wrap_timeline_load(projectStore.getTimelines());
      },
      refreshTerm: function () {
        this.$refs.term.clear();
      },

      handleCreator: function (type) {
        let parent_id = this.selectNodeId;
        if (parent_id === null) {
          this.message({
            message: 'You must choose a widget!',
            type: 'error',
          });
          return;
        }
        if (parent_id == '') {
          this.message({
            message: 'You created a widget invisible',
            type: 'warning',
          });
          return;
        }
        
        let widget = projectStore.createWidget({ type, parent: parent_id });

        wrap_create_v2(widget, false);
      },

      //Parametres are the String type
      copyWidget: function (info2) {
        let widget = projectStore.copyWidget(info2);

        wrap_create_v2(widget, false);
        wrap_attr_setter_v2(widget);
        wrap_style_setter_v2(widget);

        return widget;
      },

      // Delete node and its childs(reverse)
      deleteNode: function (node, data) {
        const id = data.id;

        if (id == 'screen' || id == '') {
          this.message({
            message: "You can't delete the screen or nothing!",
            type: 'error',
          });
          return; // Not support delete screen now
        }
        
        let widget = this.getWidgetById(id);
        let list = projectStore.deleteWidget(widget);
        for (const child of list) {
          wrap_delete(child.id);
        }
        
        this.activeNode('screen');

        this.message({
          showClose: true,
          grouping: true,
          message: 'Delete sucessfully',
          type: 'success',
        });
      },

      handleTreeEvent(event, node, data) {
        let id = data ? data.id : '';
        // console.log('handleTreeEvent', event, id, data);
        if (event == 'delete') {
          this.deleteNode(node, data);
        } else if (event == 'copy') {
          let info = this.getWidgetById(id);
          let widget2 = this.copyWidget(info);
          console.log('copy', node, data, info, widget2);
        } else if (event == 'show') {
          data.show = true;
          let list = projectStore.getWidgetChildrenList(id, true);
          for (const child of list) {
            wrap_show(child.id);
          }
        } else if (event == 'hide') {
          data.show = false;
          let list = projectStore.getWidgetChildrenList(id, true);
          for (const child of list) {
            wrap_hide(child.id);
          }
        } else if (event == 'click') {
          this.activeNode(id);
        } else if (event == 'sort') {
          let change = projectStore.updateWidgetTreeIndex();
          for (const item of change) {
            wrap_set_index(item.id, item.zindex);
          }
        }
      },
      activeNode: function (id = 'screen') {
        let info = this.getWidgetById(id);
        this.$refs.simulator.activeFrame(info);

        if (this.selectNodeId == id) {
          return;
        }

        console.log('selectNode', id);
        this.selectNodeId = id;
      },

      changeInfo: function (id, attribute_name) {
        let index = this.getWidgetById(id).attributes.indexOf(attribute_name);
        if (index == -1) {
          this.getWidgetById(id).attributes.push(attribute_name);
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
        let node = this.getWidgetById(id);
        let type = node.type;

        if (mode == 'styles') {
          wrap_style_setter_v2(node);
        } else {
          let body = api.setter[type][name];
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
        let screen = {
          info: projectStore.getComponents(),
          timelines: projectStore.getTimelines(),
          config: this.projectConfig // 添加项目配置
        };
        
        if (projectStore.projectData.settings.output.format == 'c') {
          preview_code = c_generator(screen, this.projectConfig?.name || this.act_FileName);
        } else {
          preview_code = python_generator(screen, this.projectConfig?.name || this.act_FileName);
        }
        
        await this.$refs.editor.setValue(preview_code);
        this.activeTab = 'code';
        this.message({
          message: 'Generate code successfully',
          type: 'success'
        });
      },
      async exportCodeAsLV() {
        let json = await this.savePage();
        let code = JSON.stringify(json, null, 2);
        let blob = new Blob([code], {type: "text/plain;charset=utf-8"});
        let fileName = +new Date();
        saveAs(blob, `lv_gui_${fileName}.lv`);
      },

      //Highlight object
      drawRect: (x, y, w, h) => {
        let ctx = document.getElementById('canvas').getContext('2d');
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, w, h);
      },

      changeScreenSize() {
        let screen = this.getWidgetById('screen');
        screen.data.width = this.screenWidth;
        screen.data.height = this.screenHeight;

        if (this.savePage({}, MSG_SAVE_PAGE_SUCC)) {
          window.location.reload();
        } else {
          this.message({
            message: 'Change failed',
            type: 'error',
          });
        }
      },

      // Save code to lvgl file.
      savePage: async function (event, msg = MSG_SAVE_PAGE_SUCC) {
        // 更新 projectStore 数据
        projectStore.projectData.settings.screen = {
          width: this.screenWidth,
          height: this.screenHeight
        };
        
        // 保存项目数据
        projectStore.saveProject();
        return projectStore.projectData;
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
          if (this.getWidgetById(newid)) {
            ElMessage({
              type: 'info',
              message: `Already exists:${value}`,
            })
          } else {
            projectStore.changeWidgetId(this.getWidgetById(id), newid);

            wrap_rename(id, newid);
            this.activeNode(newid);
          }
        })
        .catch(() => {
        })
      },

      // 处理项目设置变更
      handleProjectSettingsChange(config) {
        this.projectConfig = config;

        // 提示保存成功
        this.message({
          message: 'Project settings saved successfully',
          type: 'success'
        });

        // 如果屏幕尺寸改变,需要重新初始化模拟器
        if (config.settings.screen.width !== this.screenWidth || 
            config.settings.screen.height !== this.screenHeight) {
          this.$confirm('Screen size changed. The page needs to be reloaded. Continue?', 'Warning', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            window.location.reload();
          });
        }
      },

      message(msg) {
        this.$message({
          showClose: true,
          grouping: true,
          ...msg
        });
      },
      handleMove(direction, speed = 1) {
        let that = this;
        function move() {
          let widget = that.getWidgetById(that.selectNodeId);
          if (widget.type == 'screen') {
            return;
          }
          let id = widget.id;
          if (direction == 'left' || direction == 'right') {
            widget.data.x += speed;
            // wrap_simple_setter(id, 'x', widget.data.x);
          } else if (direction == 'up' || direction == 'down') {
            widget.data.y += speed;
            // wrap_simple_setter(id, 'y', widget.data.y);
          }

          wrap_attr_setter_v2(widget);
          that.activeNode(id);
          console.log('move', widget, direction, speed);
        }
        return move;
      },
      // 修改原有的 handleKeyDown 方法，增加对输入框的判断
      handleKeyDown(event) {
        // 如果焦点在输入框、文本框等元素上，不处理快捷键
        if (this.isInputElement(event.target)) {
          return;
        }

        // 获取按键组合
        const key = this.getKeyCombo(event);
        
        // 检查是否有对应的快捷键处理函数
        const handler = this.shortcuts[key];
        if (handler) {
          event.preventDefault(); // 阻止默认行为
          handler();
        }
      },

      // 判断是否是输入类元素
      isInputElement(element) {
        const tagName = element.tagName.toLowerCase();
        const type = element.type?.toLowerCase();
        
        return (
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          element.contentEditable === 'true'
        );
      },

      // 更新 getKeyCombo 方法，使其支持方向键
      getKeyCombo(event) {
        const keys = [];
        if (event.ctrlKey) keys.push('ctrl');
        if (event.shiftKey) keys.push('shift');
        if (event.altKey) keys.push('alt');
        
        // 处理特殊键
        const keyMap = {
          'ArrowLeft': 'arrowleft',
          'ArrowRight': 'arrowright',
          'ArrowUp': 'arrowup',
          'ArrowDown': 'arrowdown'
        };
        
        // 添加主键
        const mainKey = keyMap[event.key] || event.key.toLowerCase();
        keys.push(mainKey);
        
        return keys.join('+');
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 60px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  box-shadow: var(--el-box-shadow-lighter);

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;

    .logo-section {
      .logo-text {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.5px;

        .logo-brand {
          color: var(--el-color-primary);
          background: linear-gradient(45deg, var(--el-color-primary), var(--el-color-primary-light-3));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-product {
          color: var(--el-text-color-regular);
          font-weight: 500;
          font-size: 20px;
        }

        :deep(.el-divider--vertical) {
          margin: 0 4px;
          height: 24px;
        }
      }
    }

    .header-menu {
      width: 200px;
      border-bottom: none;
      background: transparent;

      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        height: 60px;
        line-height: 60px;
        
        .el-icon {
          margin-right: 4px;
          font-size: 16px;
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;

    .mode-switch {
      padding: 0 12px;
      border-right: 1px solid var(--el-border-color-lighter);

      :deep(.el-switch__label) {
        color: var(--el-text-color-regular);
        font-weight: 500;
      }
    }

    .action-buttons {
      .el-button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 16px;
        
        .el-icon {
          font-size: 16px;
        }
      }
    }
  }
}

// 暗色主题适配
:deep(.dark) {
  .header-container {
    background: var(--el-bg-color-overlay);
  }
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
