<template>
  <div class="lv-anim-console" ref="console">
    <el-row>
      <el-col :span="8" class="lv-anim-console-item" v-for="timeline in timelines" :key="timeline.id">
        <el-switch
          class="lv-anim-switch"
          v-model="switchValue[timeline.id]"
          :inactive-text="timeline.id"
          @change="handleSwitch(timeline.id)"
        />
        <el-slider class="lv-anim-slider" v-model="sliderValue[timeline.id]" :max="65535" @input="handleSlider(timeline.id)" />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import {
  wrap_timeline_start,
  wrap_timeline_pause,
  wrap_timeline_progress,
} from './runtimeWrapper.js';

export default {
  name : 'creator-anim-console',
  props: ['timelines'],
  emits: ['save'],
  data: function() {
      return {
        switchValue: {},
        sliderValue: {},
      }
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    handleSwitch(id) {
      let value = this.switchValue[id];
      if (value == true) {
        wrap_timeline_start(id);
      } else {
        wrap_timeline_pause(id);
      }
      // console.log('handleSwitch', id, value);
    },
    handleSlider(id) {
      let value = this.sliderValue[id];
      // console.log('handleSlider', id, value);
      wrap_timeline_progress(id, value);
    },
    handleClick() {

    }
  },
};
</script>
<style lang="less" scoped>
.lv-anim-console {
  .lv-anim-console-item {
    display: flex;
    align-items: center;
    padding: 0 10px 0 0;
  }
  .lv-anim-switch {
    padding: 0 10px 0 10px;
  }
  .lv-anim-slider {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
<style lang="less">
</style>
