<template>
<div class="image-gallery-container">
  <div class="upload-section">
    <div class="upload-wrapper">
      <el-upload
        class="upload-demo"
        multiple
        :show-file-list="false"
        :auto-upload="false"
        :on-change="handFileChange"
      >
        <el-button type="primary" class="upload-button">
          <el-icon><Upload /></el-icon>
          Upload Images
        </el-button>
      </el-upload>
    </div>
  </div>
  
  <div class="gallery-grid">
    <div 
      v-for="(item, index) in tableData" 
      :key="item.id" 
      class="gallery-item"
      @dblclick="openEditDialog(item)"
    >
      <div class="image-card">
        <div class="image-preview" @click="handleImagePreview(item)">
          <img :src="item.content" :alt="item.name" :title="item.name" />
        </div>
        
        <!-- Hover时显示的图片信息 -->
        <div class="image-hover-info" v-if="false">
          <div class="info-content">
            <div class="info-row" :title="item.name">
              <span class="info-label">Title:</span>
              <span class="info-value">{{ item.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID:</span>
              <span class="info-value">{{ item.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Size:</span>
              <span class="info-value">{{ item.width }}×{{ item.height }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">File:</span>
              <span class="info-value">{{ formatFileSize(item.size) }}</span>
            </div>
          </div>
        </div>
        
        <div class="image-title">
          {{ item.name }}
        </div>
        
        <div class="image-actions">
          <div class="action-buttons">
            <el-button 
              type="primary" 
              size="small" 
              @click.stop="openEditDialog(item)"
              circle
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            
            <el-button 
              type="primary" 
              size="small" 
              @click.stop="handleImageCropper({ row: item })"
              circle
            >
              <el-icon><Crop /></el-icon>
            </el-button>
            
            <el-button 
              type="danger" 
              size="small" 
              @click.stop="handleDelete({ row: item, $index: index })"
              circle
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 编辑图片信息弹框 -->
  <el-dialog
    v-model="editDialogVisible"
    title="Edit Image"
    width="500px"
    destroy-on-close
  >
    <div class="edit-dialog-content" v-if="editingItem">
      <div class="form-item">
        <label class="form-label">Title</label>
        <el-input 
          v-model="editingItem.name" 
          placeholder="Image title"
        />
      </div>
      
      <div class="form-item">
        <label class="form-label">ID</label>
        <el-input 
          v-model="editingItem.id" 
          placeholder="Image ID"
        />
      </div>
      
      <div class="form-item">
        <label class="form-label">Type</label>
        <el-select
          v-model="editingItem.type"
          @change="handleImgTypeChange({ row: editingItem })"
          style="width: 100%"
        >
          <el-option value="image/png" label="PNG"></el-option>
          <el-option value="image/jpeg" label="JPG"></el-option>
        </el-select>
      </div>
      
      <div class="form-item">
        <label class="form-label">Preview</label>
        <div class="preview-container">
          <img :src="editingItem.content" :alt="editingItem.title" />
        </div>
      </div>
      
      <div class="form-item">
        <label class="form-label">Details</label>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Dimensions:</span>
            <span>{{ editingItem.width }} × {{ editingItem.height }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">File size:</span>
            <span>{{ formatFileSize(editingItem.size) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Type:</span>
            <span>{{ editingItem.type }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveEditedItem">Confirm</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 添加裁剪对话框 -->
  <el-dialog
    v-model="cropperVisible"
    title="Image Cropper"
    width="800px"
    destroy-on-close
    class="cropper-dialog"
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
    :hide-on-click-modal="true"
    @close="previewVisible = false"
  />
</div>
</template>

<script>
import { projectStore } from './store/projectStore';
import 'vue-cropper/dist/index.css'
import { VueCropper } from 'vue-cropper'
import { Upload, Picture, Document, Files, Edit, Delete, Check, Crop } from '@element-plus/icons-vue'

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
    VueCropper,
    Upload,
    Picture,
    Document,
    Files,
    Edit,
    Delete,
    Check,
    Crop
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
      editDialogVisible: false,
      editingItem: null,
      editingItemOriginal: null,
      hoveredItem: null
    }
  },
  watch: {
  },
  mounted() {
    // 从 projectStore 加载图片数据
    this.tableData = projectStore.getAllAssets('images');
  },
  methods: {
    openEditDialog(item) {
      // 保存原始数据用于取消操作
      this.editingItemOriginal = JSON.parse(JSON.stringify(item));
      this.editingItem = JSON.parse(JSON.stringify(item));
      this.editDialogVisible = true;
    },
    saveEditedItem() {
      if (this.editingItem) {
        // 更新数据
        projectStore.updateAsset('images', this.editingItem.id, this.editingItem);
        // 更新表格数据
        const index = this.tableData.findIndex(item => item.id === this.editingItem.id);
        if (index !== -1) {
          this.tableData[index] = JSON.parse(JSON.stringify(this.editingItem));
        }
      }
      this.editDialogVisible = false;
      this.editingItem = null;
      this.editingItemOriginal = null;
    },
    async handFileChange(file) {
      const id = await projectStore.importImage(file);
      this.tableData = projectStore.getAllAssets('images');
    },
    handleDelete(props) {
      projectStore.deleteAsset('images', props.row.id);
      this.tableData = projectStore.getAllAssets('images');
    },
    async handleImgTypeChange(props) {
      let content = await convertImage(props.row.content, props.row.type);
      if (content) {
        // console.log('handleImgTypeChange', props.row.type, content, props.row.content);
        props.row.content = content;
      }
    },
    handleImageCropper(props) {
      this.currentRow = props.row
      this.currentImage = props.row.content
      this.cropperVisible = true
    },
    cropImage(data) {
      this.croppedData = data
    },
    async confirmCrop() {
      if (!this.croppedData) return

      const canvas = this.$refs.cropper.getCropData(async (data) => {
        // 更新当前图片数据
        this.currentRow.content = data
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
      this.previewImage = props.row ? props.row.content : props.content
      this.previewVisible = true
    },
    formatFileSize(size) {
      if (size < 1024) {
        return size + ' B';
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + ' KB';
      } else {
        return (size / (1024 * 1024)).toFixed(1) + ' MB';
      }
    }
  },
};
</script>
<style lang="less" scoped>
.image-gallery-container {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: 100%;
  
  .upload-section {
    margin-bottom: 30px;
    
    .upload-wrapper {
      display: flex;
      justify-content: center;
      
      .upload-button {
        padding: 12px 24px;
        font-size: 16px;
        
        .el-icon {
          margin-right: 8px;
        }
      }
    }
  }
  
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
    
    .gallery-item {
      transition: all 0.3s ease;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      
      .image-card {
        background: var(--el-bg-color-overlay);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        position: relative;
        
        &:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }
        
        .image-preview {
          height: 140px;
          overflow: hidden;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            transition: transform 0.3s ease;
          }
          
          &:hover img {
            transform: scale(1.05);
          }
        }
        
        .image-title {
          padding: 4px 6px 4px;
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .image-hover-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 10px;
          font-size: 12px;
          transform: translateY(100%);
          transition: transform 0.3s ease;
          z-index: 10;
          
          .info-content {
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              
              &:last-child {
                margin-bottom: 0;
              }
              
              .info-label {
                font-weight: 500;
              }
              
              .info-value {
                text-align: right;
                max-width: 65%;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
        }
        
        &:hover .image-hover-info {
          transform: translateY(0);
        }
        
        .image-actions {
          padding: 4px 8px 8px;
          
          .action-buttons {
            display: flex;
            justify-content: space-between;
            
            .el-button {
              flex: 1;
              margin: 0 3px;
              padding: 8px;
              
              &:first-child {
                margin-left: 0;
              }
              
              &:last-child {
                margin-right: 0;
              }
            }
          }
        }
      }
    }
  }
}

.edit-dialog-content {
  .form-item {
    margin-bottom: 20px;
    
    .form-label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    
    .preview-container {
      width: 100%;
      height: 150px;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      
      .detail-item {
        display: flex;
        flex-direction: column;
        
        .detail-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

.cropper-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}

:deep(.vue-cropper) {
  height: 400px;
  width: 100%;
}

:deep(.el-image-viewer__wrapper) {
  // 确保预览窗口在最顶层
  z-index: 2100;
}

// 深色模式适配
html.dark {
  .image-gallery-container {
    .gallery-grid {
      .gallery-item {
        .image-card {
          background: var(--el-bg-color-overlay);
        }
      }
    }
  }
}
</style>
<style lang="less">
</style>