<template>
<div style="padding: 0 10px;">
  <el-collapse v-model="collapseModel">
    <el-collapse-item  v-for="(item, index) in creator_options" :key="item.value" :title="item.label" :name="item.value">
      <el-row v-if="item.children">
        <el-col v-for="(item2, index2) in item.children" :key="item2.label" :sm="12" :lg="8" style="text-align: center; cursor: pointer;" @click="handleClick(item2)">
          <div>
            <img
              :src="imageMap[item2.img]"
              style="width: 60%"
            />
          </div>
          <!-- <img :src="require(`@/pages/editor2/objects/screen.png`)" /> -->
          <span> {{  item2.label }} </span>
        </el-col>
      </el-row>
    </el-collapse-item>
  </el-collapse>
<!-- 
  <el-cascader
    :options="creator_options"
    :show-all-levels="false"
    :props="{ emitPath: false, expandTrigger: 'hover' }"
    v-model="selectedType"
  ></el-cascader>
  
  <div style="margin: 15px">
    <el-row>
      <el-button type="primary" icon="el-icon-plus" @click="Creator" circle></el-button>
    </el-row>
    <el-row style="margin-top: 15px"> </el-row>
  </div> -->
</div>
</template>

<script lang="ts">
import * as WidgetData from './widgetData.js';

let imageList = import.meta.glob('./objects/*.png',{eager:true})
let imageMap = {};
for (let p in imageList) {
  let k = p.replace('./objects/', '').replace('.png', '');
  // @ts-ignore
  imageMap[k] = imageList[p].default;
}

// import accIcon from "@/pages/editor2/objects/screen.png"
// console.log(accIcon);

export default {
  name : 'creator-widgets',
  props: [],
  emits: ['create'],
  data: function() {
      return {
        //Creator
        creator_options: WidgetData.WidgetsOption,
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
  },
};
</script>
<style lang="less" scoped>

</style>
<style lang="less">
</style>
