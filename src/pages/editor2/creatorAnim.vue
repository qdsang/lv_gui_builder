<template>
  <div class="creator-anim">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-title">Animation Timeline Editor</div>
      <div class="toolbar-actions">
        <el-tooltip content="Add Timeline" placement="top">
          <el-button class="action-btn" type="primary" icon="el-icon-plus" circle @click="timelineAdd"></el-button>
        </el-tooltip>
        <el-tooltip content="Save All Changes" placement="top">
          <el-button class="action-btn" type="success" icon="el-icon-refresh" circle @click="timelineSave"></el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- Timeline列表 -->
    <div v-for="(timeline, tindex) in timelines" :key="timeline.id" class="timeline-item">
      <div class="timeline-header">
        <div class="timeline-id">
          <span class="label">Timeline ID:</span>
          <el-input 
            v-model="timeline.id"
            size="small"
            class="id-input"
            placeholder="Enter timeline ID"
          />
        </div>
        <div class="timeline-actions">
          <el-tooltip content="Add Animation" placement="top">
            <el-button type="primary" size="small" icon="el-icon-plus" circle @click="animAdd(timeline)"></el-button>
          </el-tooltip>
          <el-tooltip content="Duplicate Timeline" placement="top">
            <el-button type="info" size="small" icon="el-icon-copy-document" circle @click="timelineCopy(timeline)"></el-button>
          </el-tooltip>
          <el-tooltip content="Delete Timeline" placement="top">
            <el-button type="danger" size="small" icon="el-icon-delete" circle @click="timelineRemove(tindex)"></el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- Animation表格 -->
      <el-table 
        :data="timeline.anims" 
        class="anim-table"
        :default-expand-all="true"
        :border="true"
        stripe
      >
        <!-- 展开列保持不变 -->
        <el-table-column type="expand">
          <template #default="props">
            <div class="obj-panel">
              <div class="obj-header">
                <h4>Objects</h4>
                <el-tooltip content="Add Object" placement="top">
                  <el-button type="primary" size="small" icon="el-icon-plus" circle @click="objAdd(props.row)"></el-button>
                </el-tooltip>
              </div>
              
              <el-table 
                :data="props.row.objs" 
                :border="true"
                class="obj-table"
                stripe
              >
                <!-- 对象表格列保持不变但优化样式 -->
                <el-table-column fixed prop="id" label="id" width="150">
                  <template #default="props2">
                    <input type="text" v-show="props2.row.iseditor" style="width: 100%;" v-model="props2.row.id" />
                    <span v-show="!props2.row.iseditor">{{props2.row.id}}</span>
                  </template>
                </el-table-column>
                <el-table-column fixed prop="attr" label="attr" width="150">
                  <template #default="props2">
                    <input type="text" v-show="props2.row.iseditor" style="width: 100%;" v-model="props2.row.attr" />
                    <span v-show="!props2.row.iseditor">{{props2.row.attr}}</span>
                  </template>
                </el-table-column>
                <el-table-column fixed="right" label="Operations" width="150">
                  <template #default="props2">
                    <el-button link type="primary" size="small" v-if="props2.row.iseditor" @click="save(props2)">Save</el-button>
                    <el-button link type="primary" size="small" v-if="!props2.row.iseditor" @click="edit(props2)">Edit</el-button>
                    <el-button link type="primary" size="small" @click="objRemove(props2, props.row)">Delete</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <!-- 动画参数列保持原有结构但统一宽度和样式 -->
        <el-table-column prop="start_time" label="Start Time" width="120">
          <template #default="props">
            <el-input
              v-show="props.row.iseditor"
              v-model="props.row.start_time"
              size="small"
              class="param-input"
            />
            <span v-show="!props.row.iseditor">{{props.row.start_time}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="valueMin" label="value Min" width="80">
          <template #default="props">
            <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.valueMin" />
            <span v-show="!props.row.iseditor">{{props.row.valueMin}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="valueMax" label="value Max" width="80">
          <template #default="props">
            <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.valueMax" />
            <span v-show="!props.row.iseditor">{{props.row.valueMax}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="time" label="time" width="80">
          <template #default="props">
            <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.time" />
            <span v-show="!props.row.iseditor">{{props.row.time}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="playback_delay" label="playback delay" width="90">
          <template #default="props">
            <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.playback_delay" />
            <span v-show="!props.row.iseditor">{{props.row.playback_delay}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="playback_time" label="playback time" width="90">
          <template #default="props">
            <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.playback_time" />
            <span v-show="!props.row.iseditor">{{props.row.playback_time}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="repeat_delay" label="repeat delay" width="90">
          <template #default="props">
            <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.repeat_delay" />
            <span v-show="!props.row.iseditor">{{props.row.repeat_delay}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="repeat_count" label="repeat count" width="90">
          <template #default="props">
            <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.repeat_count" />
            <span v-show="!props.row.iseditor">{{props.row.repeat_count}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="path_cb" label="path" width="120">
          <template #default="props">
            <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.path_cb" />
            <span v-show="!props.row.iseditor">{{props.row.path_cb}}</span>
          </template>
        </el-table-column>

        <!-- 操作列优化 -->
        <el-table-column fixed="right" label="Operations" width="200">
          <template #default="props">
            <div class="operation-buttons">
              <el-button 
                v-if="props.row.iseditor" 
                type="success" 
                size="small" 
                icon="el-icon-check"
                @click="save(props)"
              >
                Save
              </el-button>
              <el-button 
                v-if="!props.row.iseditor" 
                type="primary" 
                size="small"
                icon="el-icon-edit" 
                @click="edit(props)"
              >
                Edit
              </el-button>
              <el-button 
                type="info"
                size="small"
                icon="el-icon-document-copy"
                @click="animCopy(props, timeline)"
              >
                Copy
              </el-button>
              <el-button 
                type="danger"
                size="small"
                icon="el-icon-delete"
                @click="animRemove(props, timeline)"
              >
                Delete
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script lang="ts">
import * as WidgetData from "./widgetData.js";

export default {
  name : 'creator-anim',
  props: ['timelines'],
  emits: ['save'],
  data: function() {
      return {
      }
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    animAdd(timeline) {
      let anim = JSON.parse(JSON.stringify(WidgetData.timeline_anim_def));
      timeline.anims.push(anim);
    },
    animCopy(props, timeline) {
      let anim = JSON.parse(JSON.stringify(props.row));
      timeline.anims.push(anim);
    },
    animRemove(props, timeline) {
      timeline.anims.splice(props.$index, 1);
    },

    objAdd(anim) {
      let obj = JSON.parse(JSON.stringify(WidgetData.timeline_obj_def));
      anim.objs.push(obj);
    },
    objRemove(row, anim) {
      anim.objs.splice(row.$index, 1);
    },
    edit(props) {
      props.row.iseditor = true;
    },
    save(props) {
      props.row.iseditor = false;
    },
    timelineAdd() {
      let timeline = JSON.parse(JSON.stringify(WidgetData.timeline_def));
      timeline.id = 'timeline_' + (this.timelines.length + 1);
      this.timelines.push(timeline);
      console.log(this.timelines)
    },
    timelineCopy(timeline2) {
      let timeline = JSON.parse(JSON.stringify(timeline2));
      timeline.id = 'timeline_' + (this.timelines.length + 1);
      this.timelines.push(timeline);
    },
    timelineRemove(index) {
      this.timelines.splice(index, 1);
    },
    timelineSave() {
      this.$emit('save');
    },
    handleClick() {

    }
  },
};
</script>
<style lang="less" scoped>
.creator-anim {
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-light);

    &-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    &-actions {
      display: flex;
      gap: 12px;
    }
  }

  .timeline-item {
    margin-bottom: 24px;
    background: var(--el-bg-color-overlay);
    border-radius: 8px;
    padding: 16px;
    box-shadow: var(--el-box-shadow-light);

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .timeline-id {
        display: flex;
        align-items: center;
        gap: 12px;

        .label {
          font-weight: 500;
          color: var(--el-text-color-regular);
        }

        .id-input {
          width: 200px;
        }
      }

      .timeline-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .anim-table {
    :deep(.el-table__expanded-cell) {
      padding: 20px 40px;
    }
  }

  .obj-panel {
    .obj-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      h4 {
        margin: 0;
        font-size: 16px;
        color: var(--el-text-color-primary);
      }
    }
  }

  .param-input {
    width: 100%;
  }

  .operation-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}
</style>
<style lang="less">
</style>
