<template>

<el-collapse v-model="collPart">
  <el-collapse-item v-for="part in parts" :key="part" :title="'STYLE ' + part" :name="part">

    <el-collapse v-model="collStyles" style="padding: 0 0 0 16px;">
      <el-collapse-item v-for="styles in styleGroups" :title="styles.title" :name="part + '_' + styles.title" :key="styles.title">
        <div v-for="api in styles.list" :key="api.api">
          <lvgl-attr-setter2
              :id="id"
              :part="part"
              :mode="'styles'"
              :name="api.api"
              :body="api"
              @change="handleSetterChange"
            >
            </lvgl-attr-setter2>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-collapse-item>
</el-collapse>
</template>

<script lang="ts">
import * as widgetData from './widgetData.js';
import lvglAttrSetter2 from './lvglAttrSetter2.vue';

import { projectStore } from './store/projectStore.js';

export default {
  name: 'lvgl-style-setter-v2',
  props: ['id'],
  emits: ['change'],
  components: {
    lvglAttrSetter2,
  },
  data: function () {
    return {
      parts: [],
      styleGroups: [],

      collPart: '',
      collStyles: '',
    };
  },
  watch: {
    id: function () {
      this.init();
    },
  },
  created() {
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let node = projectStore.getWidgetById(this.id);
      if (!node) {
        return;
      }
      let widgetType = node.type;
      let widget = widgetData.getWidget(widgetType);
      if (!widget) {
        console.error('Style Setter not found', this.id, widgetType);
        return ;
      }
      this.parts = widget.parts;
      this.styleGroups = widget.styleGroups;
    },
    handleSetterChange({ id, name, mode }) {
      this.$emit('change', { id, name, mode });
    },
  },
};
</script>
<style lang="less" scoped></style>

<style lang="less"></style>
