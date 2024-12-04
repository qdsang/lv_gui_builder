<template>
<div>
  <div style="display: flex; justify-content: space-between;">
    <div style="display: flex; flex-grow: 1; justify-content: flex-end; align-items: center;">
      <el-upload
        class="upload-demo"
        multiple
        :show-file-list="false"
        :auto-upload="false"
        :on-change="handFileChange"
      >
        <el-button type="primary">Click to upload</el-button>
      </el-upload>
    </div>
  </div>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="imageid" label="ID Path" width="150">
      <template #default="props">
        <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.imageid" />
        <span v-show="!props.row.iseditor">{{props.row.imageid}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="title" label="title">
      <template #default="props">
        <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.title" />
        <span v-show="!props.row.iseditor">{{props.row.title}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="type" label="Type" width="140">
      <template #default="props">
        <el-select
          v-show="props.row.iseditor"
          size="small"
          style="width: 100%;"
          v-model="props.row.type"
          @change="handleImgTypeChange(props)"
        >
          <el-option value="image/png" label="png"></el-option>
          <el-option value="image/jpeg" label="jpg"></el-option>
        </el-select>
        <span v-show="!props.row.iseditor">{{props.row.type}}</span>
      </template>
    </el-table-column>
    <!-- <el-table-column prop="path" label="Path" width="200">
      <template #default="props">
        <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.path" />
        <span v-show="!props.row.iseditor">{{props.row.path}}</span>
      </template>
    </el-table-column> -->
<!--     
    <el-table-column label="Image" width="120">
      <template #default>
        <img></img>
      </template>
    </el-table-column> -->

    <el-table-column label="Info">
      <template #default="props">
        <span>{{ props.row.size/1000 }}kb</span><br />
        <span>{{ props.row.width + 'x' + props.row.height }}</span>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="Operations" width="180">
      <template #default="props">
        <el-button link type="primary" size="small" v-if="props.row.iseditor" @click="save(props)">Save</el-button>
        <el-button link type="primary" size="small" v-if="!props.row.iseditor" @click="edit(props)">Edit</el-button>
        <el-button link type="primary" size="small" @click="handleImageCropper(props)">Cropper</el-button>
        <el-button link type="primary" size="small" @click="handleDelete(props)">Delete</el-button>
      </template>
    </el-table-column>
  </el-table>
</div>
</template>

<script lang="ts">
import * as WidgetData from "./widgetData.js";
import { projectStore } from './store/projectStore';

function compressImg(file) {
  let id = file.name;
  var size = file['size'];
  var read = new FileReader()
  read.readAsDataURL(file.raw)
  return new Promise(function(resolve, reject) {
    read.onload = function(res) {
      let base64 = res.target.result;
      var img = new Image()
      img.src = base64.toString();
      let type = file.raw.type;
      img.onload = function() {
        resolve({ imageid: id, title: id, path: id, type, size, width: img.width, height: img.height, base64 });
      }
    }
  })
}

let convertImage = (function () {
  var canvas = document.createElement('canvas');

  var context2D = canvas.getContext('2d');

  return function (base64, format) {
    var image = new Image()
    image.src = base64;
    return new Promise(function(resolve, reject) {
      image.onload = function() {
        context2D.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = image.naturalWidth;

        canvas.height = image.naturalHeight;

        image.crossOrigin = 'Anonymous';

        context2D.drawImage(image, 0, 0);

        let imgbase64 = canvas.toDataURL((format || 'image/png'), 1);
        resolve(imgbase64);
      }
    });
  };
})();


export default {
  name : 'creator-image',
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
    // 从 projectStore 加载图片数据
    this.tableData = projectStore.getAllAssets('images');
  },
  methods: {
    edit(props) {
      props.row.iseditor = true;
    },
    save(props) {
      props.row.iseditor = false;
      projectStore.updateAsset('images', props.row.id, props.row);
    },
    async handFileChange(file) {
      let imageData = await compressImg(file);
      // 使用 projectStore 添加图片
      const id = projectStore.addAsset('images', imageData);
      this.tableData = projectStore.getAllAssets('images');
    },
    handleDelete(props) {
      projectStore.deleteAsset('images', props.row.id);
      this.tableData = projectStore.getAllAssets('images');
    },
    async handleImgTypeChange(props) {
      let base64 = await convertImage(props.row.base64, props.row.type);
      if (base64) {
        console.log('handleImgTypeChange', props.row.type, base64, props.row.base64);
        props.row.base64 = base64;
      }
    },
    handleImageCropper() {

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
