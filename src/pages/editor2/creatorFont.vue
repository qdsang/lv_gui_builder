<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column fixed prop="name" label="name" width="120" />
    <el-table-column prop="path" label="path" width="300" />
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
import { projectStore } from './store/projectStore';

export default {
  name : 'creator-font',
  props: ['screenLayout', 'nodeKey'],
  emits: ['node-click', 'event'],
  data: function() {
      return {
        tableData: []
      }
  },
  watch: {
  },
  mounted() {
    this.tableData = projectStore.getAllAssets('fonts');
  },
  methods: {
    handleClick(font) {
      projectStore.updateAsset('fonts', font.id, font);
    }
  },
};
</script>
<style lang="less" scoped>

</style>
<style lang="less">
</style>
