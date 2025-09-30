<template>
  <div style="padding: 0 0 2px;">
    {{ getTitle() }} 
    <el-row>
      <el-col :span="2">
        <input
          type="checkbox"
          style="margin-left: 0"
          v-model="isCheck"
          @change="handleCheck"
        />
      </el-col>
      <template v-for="(arg, index) in args" :key="arg.name">
      <el-col :span="1" v-if="index != 0">
      </el-col>
      <el-col :span="argSpan" style="padding: 0 0 2px;">
        <input
          v-if="arg.type === `bool`"
          type="checkbox"
          v-model="arg.value"
          v-on:change="checkArgs()"
        />
        <el-color-picker
          v-else-if="arg.type === `color32_t`"
          size="small"
          v-model="arg.value"
          :predefine="predefineColors"
          @change="checkArgs()"
        > {{ arg.value }}
      </el-color-picker>
        <el-select
          v-else-if="arg.type === `font_t`"
          size="small"
          v-model="arg.value"
          @change="checkArgs()"
        >
          <el-option
            v-for="item in defaultFonts"
            :key="item.path"
            :value="item.path"
            :label="item.name"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="arg.type === `void*`"
          size="small"
          v-model="arg.value"
          @change="checkArgs()"
          clearable
          :placeholder="`Select image`"
        >
          <el-option
            v-for="item in imageLibrary"
            :key="item.id"
            :value="item.id"
          >
            <img
              style="height: 20px; margin-right: 5px"
              :src="item.content"
            />
            <span>{{ item.name }}</span>
          </el-option>
        </el-select>

        <input
          v-else
          type="text"
          style="width: 100%"
          v-model="arg.value"
          :placeholder="arg.name + ' (' + arg.type + ')'"
          @input="checkArgs()"
        />
        
        <!-- <el-tooltip
          class="box-item"
          effect="dark"
          :content="arg.name + ' (' + arg.type + ')'"
          placement="bottom-start"
        >
        </el-tooltip> -->
      </el-col>
      </template>
    </el-row>
  </div>
</template>

<script lang="ts">
import { projectStore } from '../store/projectStore.js';

export default {
  name: 'lvgl-attr-setter',
  props: ['id', 'mode', 'part', 'name', 'body'],
  emits: ['change'],
  data: function () {
    return {
      args: [] as Array<any>,
      isCheck: false,
      argSpan: 22,
      list: [],
      defaultFonts: projectStore.getAllAssets('fonts'),
      imageLibrary: [],
      predefineColors: projectStore.getAllAssets('colors'),
    };
  },
  watch: {
    id: function () {
      this.init();
    },
  },
  created() {

  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let id = this.id;
      let node = projectStore.getWidgetById(this.id);
      if (!node) {
        return;
      }
      let attrKey = this.body.api;
      if (this.part) {
        attrKey = this.part + '.' + this.body.api;
      }

      let vals = [];
      if (typeof node.data[attrKey] == 'string') {
        vals = node.data[attrKey].split(',');
      } else {
        vals.push(node.data[attrKey]);
      }

      let args = JSON.parse(JSON.stringify(this.body.args));
      this.args = [];
      for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        arg['value'] = ''; // args: [{"name": '', "type": '', "value": ''}]
        let val = vals[i];
        if (val) {
          if (arg['type'] === 'char*') {
            arg['value'] = val.slice(1, val.length - 1);
          } else if (arg['type'] === 'bool') {
            arg['value'] = val === 'True' ? true : false;
          } else {
            arg['value'] = val;
          }
        }
        this.args.push(arg);
      }

      if (this.mode == 'styles') {
        this.list = node.styles;
      } else {
        this.list = node.apis;
      }

      this.isCheck = this.list.indexOf(attrKey) > -1;
      this.argSpan = parseInt('' + ((22 - 1 - this.args.length)  / this.args.length), 10);
      if (this.argSpan < 6) {
        this.argSpan = 6;
      }

      this.imageLibrary = projectStore.getAllAssets('images');
    },
    getTitle: function () {
      let title = this.body.desc || this.body.api || this.name;
      title = title.replace('set_', '').replace(/_/g, ' ');
      return title;
    },
    handleCheck: function () {
      let attrKey = this.body.api;
      if (this.part) {
        attrKey = this.part + '.' + this.body.api;
      }

      if (this.isCheck == false) {
        let index = this.list.indexOf(attrKey);
        if (index !== -1) {
          this.list.splice(index, 1);
        }
      }
    },
    updateAttr(id, mode, part, api, args) {
      let attrKey = api;
      if (part) {
        attrKey = part + '.' + attrKey;
      }

      let args_list = [];
      for (const arg of args) {
        // if (arg['value'] === "") {
        //     continue
        // }
        if (arg['type'] === 'char*') {
          args_list.push(`"${arg['value']}"`);
        } else if (arg['type'] === 'bool') {
          if (arg['value'] === true) {
            args_list.push('True');
          } else {
            args_list.push('False');
          }
        } else {
          args_list.push(arg.value);
        }
        // TODO: We can check each value's type here
      }

      console.log('updateAttr', id, this);
      let node = projectStore.getWidgetById(id);
      let data = node.data; // this.widgpool[id];

      let index = this.list.indexOf(attrKey);
      if (index == -1) {
        this.list.push(attrKey);
      }
      
      // if (!node.data) node.data = {};
      
      // node.data[attrKey] = this.args;
      node.data[attrKey] = args_list.toString();
      // data[attrKey] = args_list.toString();
      // wrap_setter_str(id, this.body.api, args_list.toString());
      this.$emit('change', { id, name: this.name, mode: this.mode });
    },
    checkArgs: function () {
      let attrKey = this.body.api;
      if (this.part) {
        attrKey = this.part + '.' + this.body.api;
      }

      let args_list = [];
      for (const arg of this.args) {
        // if (arg['value'] === "") {
        //     continue
        // }
        if (arg['type'] === 'char*') {
          args_list.push(`"${arg['value']}"`);
        } else if (arg['type'] === 'bool') {
          if (arg['value'] === true) {
            args_list.push('True');
          } else {
            args_list.push('False');
          }
        } else {
          args_list.push(arg.value);
        }
        // TODO: We can check each value's type here
      }

      console.log('checkArgs', this.id, this);
      let id = this.id;
      let node = projectStore.getWidgetById(this.id);
      let data = node.data; // this.widgpool[id];

      let index = this.list.indexOf(attrKey);
      if (index == -1) {
        this.list.push(attrKey);
      }
      
      // if (!node.data) node.data = {};
      
      // node.data[attrKey] = this.args;
      node.data[attrKey] = args_list.toString();
      // data[attrKey] = args_list.toString();
      // wrap_setter_str(id, this.body.api, args_list.toString());
      this.$emit('change', { id, name: this.name, mode: this.mode });

      this.isCheck = this.list.indexOf(attrKey) > -1;
    },
  },
};
</script>
<style lang="less" scoped>
input[type=checkbox] {
    cursor: pointer;
    opacity: 0.7;
    vertical-align: middle;
    margin: 2px 2px 4px 4px;
}

</style>

<style lang="less"></style>
