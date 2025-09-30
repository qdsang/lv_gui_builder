<template>
  <div><p>{{align}}</p>
    <span v-for="type2 in options" :key="type2">
      <input type="radio" v-if="type2 !== 0" :disabled="type2 ===''" :value="type2" v-model="align"/>
      <br v-else />
    </span>
  </div>
</template>

<script lang="ts">
import engine from '../engine.js';

export default {
  name : 'lvgl-attr-align',
  props: ['id', 'ref_id'],
  data: function() {
      return {
          align: '',
          ref_obj: '',
          x_shift: 0,
          y_shift: 0,
          options: [
              '',                 'OUT_TOP_LEFT',     'OUT_TOP_MID',  'OUT_TOP_RIGHT', '', 0, 
              'OUT_LEFT_TOP',     'IN_TOP_LEFT',      'IN_TOP_MID',   'IN_TOP_RIGHT', 'OUT_RIGHT_TOP', 0,
              'OUT_LEFT_MID',     'IN_LEFT_MID',      'CENTER',        'IN_RIGHT_MID', 'OUT_RIGHT_MID', 0,
              'OUT_LEFT_BOTTOM', 'IN_BOTTOM_LEFT',    'IN_BOTTOM_MID', 'IN_BOTTOM_RIGHT', 'OUT_RIGHT_BOTTOM', 0,
              '',                 'OUT_BOTTOM_LEFT', 'OUT_BOTTOM_MID', 'OUT_BOTTOM_RIGHT', '', 0,
          ]
      }
  },
  watch: {
    align: function (type) {
      // wrap_align(this.id, 'None', type, 0, 0);
      // wrap_align(this.id, type, 0, 0);
      let node = null;
      engine.simulatorWidget.updateAttr(node);
    }
  },
};
</script>
<style lang="less" scoped>

</style>

<style lang="less">
</style>
