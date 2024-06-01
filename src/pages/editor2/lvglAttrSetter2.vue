<template>
  <div style="padding: 0 0 2px;">
    {{ body.desc || body.api || name }} 
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
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </el-select>
        <el-select
          v-else-if="arg.type === `void*`"
          size="small"
          v-model="arg.value"
          @change="checkArgs()"
          clearable
        >
          <el-option
            v-for="item in imageLibrary"
            :key="item.path"
            :value="item.path"
          >

            <span style="float: left">{{ item.title }}</span>
            <span
              style="
                float: right;
                color: var(--el-text-color-secondary);
                font-size: 13px;
              "
            >
              {{ item.path }}
            </span>
          </el-option>
        </el-select>

        <el-tooltip
            v-else
          class="box-item"
          effect="dark"
          :content="arg.name + '(' + arg.type + ')'"
          placement="bottom-start"
        >
          <input
            type="text"
            style="width: 100%"
            v-model="arg.value"
            :placeholder="arg.name + ' ' + arg.type"
            @input="checkArgs()"
          />
        </el-tooltip>
      </el-col>
      </template>
    </el-row>
  </div>
</template>

<script lang="ts">
import * as WidgetData from "./widgetData.js";

  export default {
    name: 'lvgl-attr-setter',
    props: ['id', 'mode', 'part', 'name', 'body', 'infpool'],
    emits: ['change'],
    data: function () {
      return {
        args: [] as Array<any>,
        isCheck: false,
        argSpan: 22,
        list: [],
        defaultFonts: WidgetData.fonts,
        imageLibrary: [],
        predefineColors: WidgetData.predefineColors,
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
        let node = this.infpool[id];
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
          this.list = this.infpool[id].styles;
        } else {
          this.list = this.infpool[id].apis;
        }

        this.isCheck = this.list.indexOf(attrKey) > -1;
        this.argSpan = parseInt('' + ((22 - 1 - this.args.length)  / this.args.length), 10);
        if (this.argSpan < 6) {
          this.argSpan = 6;
        }

        this.imageLibrary = WidgetData.imageLibraryOption();
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

        console.log('checkArgs', this.id, this, this.infpool);
        let id = this.id;
        let node = this.infpool[id];
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
<style lang="less" scoped></style>

<style lang="less"></style>
