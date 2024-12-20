<template>
  <div id="setting_attribute" style="height: 100%;">
    <el-form ref="form" :model="currentWidget" label-width="55px">
      <el-form-item label="ID">
        <el-row>
          <el-col :span="24">
            <em> {{ id }} </em> &nbsp;
            <el-button icon="el-icon-edit" circle @click="editID"></el-button>
          </el-col>
          <!-- <el-col :span="7">
              <i class="el-icon-lock"></i><el-switch v-model="currentWidget.drag" v-on:input="bindWidgetBool('drag')"></el-switch>
            </el-col> -->
        </el-row>
      </el-form-item>
      <!-- <el-form-item label="CB"> -->
        <!-- <el-button type="warning" icon="el-icon-plus" @click="enableCBInfo(id)">CB</el-button> -->
        <!-- <el-switch
          :value="currentWidget?.cb"
          @change="enableCBInfo(id)"
        ></el-switch>
      </el-form-item> -->
      <!-- <el-form-item label="align">
        <el-row>
          <el-col :span="12">
          <lvgl-align></lvgl-align>
          </el-col>
        </el-row>
      </el-form-item> -->
      <el-form-item label="Postion">
        <el-row>
          <el-col :span="2"><strong>X:</strong></el-col>
          <el-col :span="10">
            <el-input
              placeholder="px"
              v-model="currentWidget.x"
              v-on:input="bindWidgetNumerical('x')"
            ></el-input>
          </el-col>
          <el-col :span="2"><strong>Y:</strong></el-col>
          <el-col :span="10">
            <el-input
              placeholder="px"
              v-model="currentWidget.y"
              v-on:input="bindWidgetNumerical('y')"
            ></el-input>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="Size">
        <el-row>
          <el-col :span="2"><strong>W:</strong></el-col>
          <el-col :span="10">
            <el-input
              placeholder="px"
              v-model="currentWidget.width"
              v-on:input="bindWidgetNumerical('width')"
            ></el-input>
          </el-col>
          <el-col :span="2"><strong>H:</strong></el-col>
          <el-col :span="10">
            <el-input
              placeholder="px"
              v-model="currentWidget.height"
              v-on:input="bindWidgetNumerical('height')"
            ></el-input>
          </el-col>
        </el-row>
      </el-form-item>
<!-- 
      <el-form-item label="Other">
        <el-row>
          <el-col :span="12">
            DRAG<el-switch v-model="currentWidget.drag" v-on:input="bindWidgetBool('drag')"></el-switch>
          </el-col>
          <el-col :span="12">
            CLICK<el-switch v-model="currentWidget.click" v-on:input="bindWidgetBool('click')"></el-switch>
          </el-col>												
        </el-row>
        <el-row>
          <el-col :span="12">
            HIDDEN<el-switch v-model="currentWidget.hidden" v-on:input="bindWidgetBool('hidden')"></el-switch>
          </el-col>
          <el-col :span="12">
            TOP<el-switch v-model="currentWidget.top" v-on:input="bindWidgetBool('top')"></el-switch>
          </el-col>												
        </el-row>
      </el-form-item> -->
    </el-form>

    <el-divider style="margin: 10px 0"></el-divider>

    <!-- method area -->
    <div style="padding: 0 0 10px;">
      <div v-for="(body, name) in setter[currentType]" :key="name">
        <lvgl-attr-setter2
          :id="id"
          :mode="'apis'"
          :name="name"
          :body="body"
          @change="handleSetterChange"
        >
        </lvgl-attr-setter2>
      </div>
    </div>

    <div>
      <lvgl-style-setter2
        :id="id"
        @change="handleSetterChange"
      >
      </lvgl-style-setter2>
    </div>
  </div>
</template>

<script lang="ts">
import { reverse_del_node, pool_delete, setArgvs, dispatch_data_changed_event, debounceFun } from './utils.js';

import {
  wrap_simple_setter,
} from './runtimeWrapper.js';

import * as api from './widgetApis.js';

import lvglAttrAlign from './lvglAttrAlign.vue';
import lvglAttrSetter2 from './lvglAttrSetter2.vue';
import lvglStyleSetter2 from './lvglStyleSetter2.vue';

import { projectStore } from './store/projectStore.js';

export default {
  name : 'creator-attribute',
  props: ['id'],
  emits: ['change', 'change-id'],
  components: {
    lvglAttrAlign,
    lvglAttrSetter2,
    lvglStyleSetter2,
  },
  data: function() {
    return {
      setter: api.setter,
      currentType: '',
      currentWidget: {},
      changeIDFormVisible: false,
      changeIDForm: {},
    }
  },
  watch: {
    id: function () {
      let widget = projectStore.getWidgetById(this.id);
      if (widget) {
        this.currentType = widget['type'];
        this.currentWidget = widget.data;
      }
    },
  },
  created() {
  },
  mounted() {},
  methods: {
    handleSetterChange({ id, name, mode }) {
      this.$emit('change', { id, name, mode });
    },
    // User enable CallBack template
    enableCBInfo: function (id) {
      let widget = projectStore.getWidgetById(id);
      // dispatch_data_changed_event();

      widget.cb = !widget.cb;
    },

    // Apply change to the widget: number
    bindWidgetNumerical: function (attribute) {
      dispatch_data_changed_event();

      let value = this.currentWidget[attribute];

      if (value == null) {
        value = 0;
      }

      let id = this.id;

      wrap_simple_setter(id, attribute, value);

      // this.changeInfo(id, attribute);
    },

    // Apply change to the widget: boolean
    bindWidgetBool: function (attribute) {
      let value = this.currentWidget[attribute];

      if (value == true) {
        value = 'True';
      } else {
        value = 'False';
      }

      let id = this.id;

      wrap_simple_setter(id, attribute, value);

      // this.reverseInfo(id, attribute);
    },

    // Lock the widget, so it can't move anymore
    // lock_widget: function() {
    //     let drag_state = this.currentWidget["get_drag"];
    //     if(drag_state == true) {
    //         drag_state = "True";
    //     } else {
    //         drag_state = "False";
    //     }

    //     mp_js_do_str(this.id + ".set_drag(" + drag_state + ')');
    // },
    editID() {
      this.$emit('change-id', this.id);
    },
  },
};
</script>
<style lang="less" scoped>

</style>
<style lang="less">
</style>
