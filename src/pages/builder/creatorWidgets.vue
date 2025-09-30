<template>
<div style="padding: 0 6px; overflow: hidden;">
  <el-collapse v-model="collapseModel" style="border: none;">
    <el-collapse-item v-for="(item, index) in creator_options" :key="item.value" :title="item.label" :name="item.value">
      <el-row v-if="item.children">
        <el-col v-for="(item2, index2) in item.children" 
          :key="item2.label" 
          :xs="8"
          :sm="8" 
          :md="7" 
          :lg="6" 
          :xl="5" 
          style="text-align: center;" 
          class="widget-item"
          draggable="true"
          @dragstart="handleDragStart($event, item2)"
          @dragend="handleDragEnd">
          <div style="padding: 2px;">
            <img
              :src="imageMap[item2.img]"
              style="width: 80%"
            />
          </div>
          <span> {{ item2.label }} </span>
        </el-col>
      </el-row>
    </el-collapse-item>
  </el-collapse>
</div>
</template>

<script lang="ts">

import engine from './engine.js';

// let imageList = import.meta.glob('../../../lvgl/v8.3.0/objects/*.png',{eager:true, as: 'url' })
let imageList = import.meta.glob('./objects/*.png', { eager:true })
let imageMap = {};
for (let p in imageList) {
  let k = p.replace('./objects/', '').replace('.png', '');
  // @ts-ignore
  imageMap[k] = imageList[p].default;
}
engine.Widget.updateIcon(imageMap);


export default {
  name : 'creator-widgets',
  props: [],
  emits: ['create'],
  data: function() {
      return {
        //Creator
        creator_options: engine.Widget.WidgetsOption,
        selectedType: '',
        imageMap: imageMap,
        collapseModel: 'basics',
      }
  },
  mounted() {
  },
  methods: {
    Creator: function () {
      if (this.selectedType == '') {
        this.$message({
          message: 'Please select a type',
          type: 'error',
        });
        return;
      } else {
        this.$emit('create', this.selectedType)
      }
    },
    handleClick(item) {
      this.$emit('create', item.label);
    },
    handleDragStart(event, item) {
      event.dataTransfer.setData('widgetInfo', JSON.stringify(item));
      // 设置拖拽时的视觉效果
      event.dataTransfer.effectAllowed = 'copy';
    },
    handleDragEnd(event) {
      // 清理拖拽状态
    },
  },
};
</script>
<style lang="less" scoped>
.widget-item {
  cursor: grab;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    cursor: grabbing;
  }
}
</style>
<style lang="less">
</style>
