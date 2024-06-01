<template>
  <div>
    <div style="display: flex; justify-content: space-between;">
      <div style="display: flex; flex-grow: 1; justify-content: flex-end; align-items: center;">
        <el-button class="btn" icon="el-icon-plus" circle @click="timelineAdd"></el-button>
        <el-button class="btn" icon="el-icon-refresh" circle @click="timelineSave"></el-button>
      </div>
    </div>
    <div v-for="(timeline, tindex) in timelines" :key="timeline.id" style="padding: 0 0 20px;">
      <div style="font-size: 16px;padding: 2px 0; display: flex; align-items: center;">
        <div><input type="text" v-model="timeline.id" /></div>
        <div style="">
          <el-button class="btn" icon="el-icon-plus" circle @click="animAdd(timeline)"></el-button>
          <el-button class="btn" icon="el-icon-copy-document" circle @click="timelineCopy(timeline)"></el-button>
          <el-button class="btn" icon="el-icon-delete" circle @click="timelineRemove(tindex)"></el-button>
        </div>
      </div>
      <el-table :data="timeline.anims" style="width: 100%" :default-expand-all="true" :border="true">
        <el-table-column type="expand">
          <template #default="props">
            <div m="4" style="padding: 0 20px; display: flex;">
              <h4 style="margin: 10px;">Obj<el-button class="btn" icon="el-icon-plus" circle @click="objAdd(props.row)"></el-button></h4>
              <el-table :data="props.row.objs" :border="true">
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
        <el-table-column prop="start_time" label="start time" width="80">
          <template #default="props">
            <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.start_time" />
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
        <el-table-column fixed="right" label="Operations" width="150">
          <template #default="props">
            <el-button link type="primary" size="small" v-if="props.row.iseditor" @click="save(props)">Save</el-button>
            <el-button link type="primary" size="small" v-if="!props.row.iseditor" @click="edit(props)">Edit</el-button>
            <el-button link type="primary" size="small" @click="animCopy(props, timeline)">Copy</el-button>
            <el-button link type="primary" size="small" @click="animRemove(props, timeline)">Delete</el-button>
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

</style>
<style lang="less">
</style>
