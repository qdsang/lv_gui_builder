<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column fixed prop="value" label="value" width="300" />
    <el-table-column prop="label" label="label" width="120" />
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
  name : 'creator-font',
  props: ['screenLayout', 'nodeKey'],
  emits: ['node-click', 'event'],
  data: function() {
      return {
        tableData: WidgetData.fonts,
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
