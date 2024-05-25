<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column fixed prop="imageid" label="ID" width="100" />
    <el-table-column prop="title" label="Title" width="140" />
    <el-table-column prop="path" label="Path" />
<!--     
    <el-table-column label="Image" width="120">
      <template #default>
        <img></img>
      </template>
    </el-table-column> -->

    <el-table-column label="Info" width="100">
      <template #default="props">
        <span>{{ props.row.size }}b</span><br />
        <span>{{ props.row.width + 'x' + props.row.height }}</span>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="Operations" width="120">
      <template #default>
        <el-button link type="primary" size="small" @click="handleClick">
          Detail
        </el-button>
        <el-button link type="primary" size="small">Edit</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import * as WidgetData from "./widgetData.js";

export default {
  name : 'creator-image',
  props: ['screenLayout', 'nodeKey'],
  emits: ['node-click', 'event'],
  data: function() {
      return {
        tableData: WidgetData.imageLibrary,
      }
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    handleClick() {
      
    }
  },
};
</script>
<style lang="less" scoped>

</style>
<style lang="less">
</style>
