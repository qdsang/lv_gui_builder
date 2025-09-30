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
    <el-table-column prop="id" label="ID Path" width="150">
      <template #default="props">
        <input type="text" v-show="props.row.iseditor" style="width: 100%;" v-model="props.row.id" />
        <span v-show="!props.row.iseditor">{{props.row.id}}</span>
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

    <el-table-column label="Info">
      <template #default="props">
        <span>{{ props.row.size/1000 }}kb</span><br />
        <span>{{ props.row.width + 'x' + props.row.height }}</span>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="Operations" width="250">
      <template #default="props">
        <el-button link type="primary" size="small" v-if="props.row.iseditor" @click="save(props)">Save</el-button>
        <el-button link type="primary" size="small" v-if="!props.row.iseditor" @click="edit(props)">Edit</el-button>
        <el-button link type="primary" size="small" @click="handleImagePreview(props)">Preview</el-button>
        <el-button link type="primary" size="small" @click="handleImageCropper(props)">Cropper</el-button>
        <el-button link type="primary" size="small" @click="handleDelete(props)">Delete</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 添加裁剪对话框 -->
  <el-dialog
    v-model="cropperVisible"
    title="Image Cropper"
    width="800px"
    destroy-on-close
  >
    <vue-cropper
      ref="cropper"
      :img="currentImage"
      :info="true"
      :autoCrop="true"
      :fixedBox="true"
      :centerBox="true"
      outputType="jpeg"
      @realTime="cropImage"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cropperVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmCrop">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 添加图片预览组件 -->
  <el-image-viewer
    v-if="previewVisible"
    :url-list="[previewImage]"
    :initial-index="0"
    @close="previewVisible = false"
  />
</div>
</template>

<script>
import { projectStore } from './store/projectStore';
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'

async function compressImg(file) {
  let id = file.name;
  var size = file['size'];
  let type = file.raw.type;
  let base64 = await imgToBase64(file.raw);
  
  type = 'image/jpeg';
  base64 = await convertImage(base64.toString(), type);

  let imgInfo = await imgGetInfo(base64.toString());
  
  return { id: id, title: id, path: id, type, size, width: imgInfo.width, height: imgInfo.height, base64 };
}

async function imgToBase64(file) {
  var read = new FileReader()
  read.readAsDataURL(file)
  return new Promise(function(resolve, reject) {
    read.onload = function(res) {
      let base64 = res.target.result;
      resolve(base64);
    }
  });
}

async function imgGetInfo(url) {
  var img = new Image()
  return new Promise(function(resolve, reject) {
    img.src = url;
    img.onload = function() {
      resolve({ width: img.width, height: img.height });
    }
  });
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
  components: {
    VueCropper
  },
  data: function() {
    return {
      tableData: [],
      cropperVisible: false,
      currentImage: '',
      currentRow: null,
      croppedData: null,
      previewVisible: false,
      previewImage: '',
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
    handleImageCropper(props) {
      this.currentRow = props.row
      this.currentImage = props.row.base64
      this.cropperVisible = true
    },
    cropImage(data) {
      this.croppedData = data
    },
    async confirmCrop() {
      if (!this.croppedData) return

      const canvas = this.$refs.cropper.getCropData(async (data) => {
        // 更新当前图片数据
        this.currentRow.base64 = data
        this.currentRow.width = this.croppedData.w
        this.currentRow.height = this.croppedData.h
        this.currentRow.size = Math.round(data.length * 0.75) // base64 to binary size approximation

        // 保存到 store
        projectStore.updateAsset('images', this.currentRow.id, this.currentRow)
        
        // 关闭对话框
        this.cropperVisible = false
        
        // 刷新表格数据
        this.tableData = projectStore.getAllAssets('images')
      })
    },
    handleImagePreview(props) {
      this.previewImage = props.row.base64
      this.previewVisible = true
    },
  },
};
</script>
<style lang="less" scoped>
.cropper-container {
  height: 500px;
}

:deep(.vue-cropper) {
  height: 400px;
  width: 100%;
}

:deep(.el-image-viewer__wrapper) {
  // 确保预览窗口在最顶层
  z-index: 2100;
}
</style>
<style lang="less">
</style>
