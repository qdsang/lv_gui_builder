<template>
  <el-tree
    ref="TreeView"
    :data="treeData"
    highlight-current
    default-expand-all
    draggable
    @node-drop="handleDrop"
    :expand-on-click-node="false"
    node-key="label"
    :current-node-key="nodeKey"
    @node-click="clickNode"
    class="creator-tree-view"
    :indent="12"
  >
    <template #default="{ node, data }">
      <div class="custom-tree-node">
        <el-icon style="padding: 0 6px 0 0;"><img width="12" :src="getWidgetIcon(data.widgetType)" /></el-icon>
        <span>{{ node.label }}</span>
        <div class="node-right">
          <el-button class="btn" v-show="!(data.show == false)" icon="el-icon-view" circle @click.stop @click="hide(node, data)"></el-button>
          <el-button class="btn" v-show="data.show == false" icon="el-icon-hide" circle @click.stop @click="show(node, data)"></el-button>
          <!-- <el-button class="btn" icon="el-icon-copy-document" circle @click.stop @click="copy(node, data)"></el-button> -->
          <!-- <el-button class="btn" icon="el-icon-delete" circle @click.stop @click="remove(node, data)"></el-button> -->
        </div>
      </div>
    </template>
  </el-tree>
</template>

<script lang="ts">
import engine from './engine.js';
import { projectStore } from './store/projectStore';

export default {
  name : 'creator-tree',
  props: ['screenLayout', 'nodeKey'],
  emits: ['node-click', 'event'],
  data: function() {
      return {
      }
  },
  watch: {
    //Parse string to JSON
    nodeKey: function () {

      // this.$refs.TreeView.setCurrentKey(this.currentWidget.id);
    }
  },
  computed: {
    treeData: function () {
      return projectStore.componentTree;
    }
  },
  methods: {
    getWidgetIcon(type) {
      let widget = engine.Widget.getWidget(type);
      return widget?.iconUrl;
    },
    clickNode: function (data, obj, tree_obj) {
      // console.log('click', data, obj, tree_obj);
      this.$emit('event', 'click', obj, data, tree_obj);
    },
    copy: function (node, data) {
      this.$emit('event', 'copy', node, data);
    },
    remove: function (node, data) {
      this.$emit('event', 'delete', node, data);
    },
    show: function (node, data) {
      this.$emit('event', 'show', node, data);
    },
    hide: function (node, data) {
      this.$emit('event', 'hide', node, data);
    },
    handleDrop ( draggingNode, dropNode, dropType, ev) {
      console.log('tree drop:', dropNode.label, dropType);
      this.$emit('event', 'sort');
    },
  },
};
</script>
<style lang="less" scoped>
.custom-tree-node {
  display: flex;
  justify-content: space-between;
  width: 100%;
  // flex: 1;
  // display: flex;
  align-items: center;
  // justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  .node-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-grow: 1;
    .btn {
      width: 24px;
      margin-left: 0px;border-width: 0;
    }
  }
}
</style>
<style lang="less">
.el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
  background-color: #4A5878;
}
.creator-tree-view {
  // width: 100%;
  .el-tree-node__content {
    // width: 100%;
  }
  .el-tree-node__expand-icon {
    padding: 6px 4px;
  }
}

</style>
