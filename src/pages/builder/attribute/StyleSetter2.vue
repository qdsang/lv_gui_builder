<template>

<el-collapse v-model="collPart">
  <el-collapse-item v-for="part in parts" :key="part" :title="'Style ' + part.toLowerCase() + countTip(part)" :name="part">

    <el-collapse v-model="collStyles" style="padding: 0 0 0 16px;">
      <el-collapse-item v-for="styles in styleGroups" :title="styles.title + countTip2(part, styles)" :name="part + '_' + styles.title" :key="styles.title">
        <div v-for="api in styles.list" :key="api.api">
          <attr-setter2
              :id="id"
              :part="part"
              :mode="'styles'"
              :name="api.api"
              :body="api"
              @change="handleSetterChange"
            >
            </attr-setter2>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-collapse-item>
</el-collapse>
</template>

<script lang="ts">
import engine from '../engine.js';

import AttrSetter2 from './AttrSetter2.vue';

import { projectStore } from '../store/projectStore.js';

export default {
  name: 'lvgl-style-setter-v2',
  props: ['id'],
  emits: ['change'],
  components: {
    AttrSetter2,
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
      let widget = engine.Widget.getWidget(widgetType);
      if (!widget) {
        console.error('Style Setter not found', this.id, widgetType);
        return ;
      }
      this.parts = widget.parts;
      this.styleGroups = widget.styleGroups;

      this.partCountMap = {};
      for (let key in node.styles) {
        let part = node.styles[key].split('.')[0];
        if (!this.partCountMap[part]) {
          this.partCountMap[part] = 0;
        }
        this.partCountMap[part]++;
      }
    },
    handleSetterChange({ id, name, mode }) {
      this.$emit('change', { id, name, mode });
    },
    countTip(part) {
      let count = this.partCountMap[part] || 0;
      return count ? (' (' + count + ')') : '';
    },
    countTip2(part, styles) {
      let node = projectStore.getWidgetById(this.id);
      let count = 0;
      for (let key in styles.list) {
        let style = styles.list[key];
        let attrKey = style.api;
        if (part) {
          attrKey = part + '.' + attrKey;
        }

        let list = node.styles;
        let isCheck = list.indexOf(attrKey) > -1;
        if (isCheck) {
          count++;
        }
      }
      // console.log(styles);
      return count ? (' (' + count + ')') : '';
    }
  },
};
</script>
<style lang="less" scoped></style>

<style lang="less"></style>
