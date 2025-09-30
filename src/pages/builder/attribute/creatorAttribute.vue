<template>
  <div id="setting_attribute" style="height: 100%;">
    <el-form ref="form" :model="currentWidget" label-width="55px" label-position="top" size="small" class="attrs-form">
      <el-form-item label="ID">
        <el-row>
          <el-col :span="24">
            <em> {{ id }} </em> {{ currentType }}&nbsp;
            <el-button icon="el-icon-edit" circle @click="editID"></el-button>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="Postion">
        <el-row>
          <el-col :span="10">
            <el-input placeholder="px" v-model="currentWidget.x"
              v-on:input="bindWidgetNumerical('x')">
              <template #prepend>X</template>
            </el-input>
          </el-col>
          <el-col :span="2"></el-col>
          <el-col :span="10">
            <el-input placeholder="px" v-model="currentWidget.y"
              v-on:input="bindWidgetNumerical('y')">
              <template #prepend>Y</template>
            </el-input>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="Size">
        <el-row>
          <el-col :span="10">
            <el-input placeholder="px" v-model="currentWidget.width"
              v-on:input="bindWidgetNumerical('width')">
              <template #prepend>W</template>
            </el-input>
          </el-col>
          <el-col :span="2"></el-col>
          <el-col :span="10">
            <el-input placeholder="px" v-model="currentWidget.height"
              v-on:input="bindWidgetNumerical('height')">
              <template #prepend>H</template>
            </el-input>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>

    <!-- <el-divider style="margin: 10px 0"></el-divider> -->

    <!-- method area -->
    <div style="padding: 0 0 10px;">
      <div v-for="(body, name) in setter[currentType]" :key="name">
        <attr-setter2
          :id="id"
          :mode="'apis'"
          :name="name"
          :body="body"
          @change="handleSetterChange"
        >
        </attr-setter2>
      </div>
    </div>

    <div>
      <style-setter2
        :id="id"
        @change="handleSetterChange"
      >
      </style-setter2>
    </div>
  </div>
</template>

<script lang="ts">
import * as api from '@lvgl/v8.3.0/widgetApis.js';

import AttrAlign from './AttrAlign.vue';
import AttrSetter2 from './AttrSetter2.vue';
import StyleSetter2 from './StyleSetter2.vue';

import { projectStore } from '../store/projectStore.js';

export default {
  name : 'creator-attribute',
  props: ['id'],
  emits: ['change', 'change-id'],
  components: {
    AttrAlign,
    AttrSetter2,
    StyleSetter2,
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

    // Apply change to the widget: number
    bindWidgetNumerical: function (attribute) {
      let value = this.currentWidget[attribute];

      if (value == null) {
        value = 0;
      }

      let id = this.id;
      let widget = projectStore.getWidgetById(id);
      let attrKey = attribute;
      widget.data[attrKey] = value;
      
      this.handleSetterChange({ id, name: attrKey, mode: 'styles'});
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
.attrs-form {
  :deep(.el-input-group__prepend) {
    padding: 0 10px;
  }
  :deep(.el-form-item--small) {
    margin-bottom: 6px;
  }
  :deep(.el-form-item--label-top .el-form-item__label) {
    margin-bottom: 0;
  }
}
</style>
<style lang="less">
</style>
