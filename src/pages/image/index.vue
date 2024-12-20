<template>
  <div class="image-converter">
    <div class="converter-container">
      <!-- 图片上传区域 -->
      <el-upload
        class="image-upload"
        drag
        :auto-upload="false"
        :on-change="handleImageChange"
        accept="image/*"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">拖拽图片到此处或 <em>点击上传</em></div>
      </el-upload>

      <!-- 转换设置 -->
      <el-form :model="convertSettings" label-width="120px" class="settings-form">
        <el-form-item label="颜色格式">
          <el-select v-model="convertSettings.cf">
            <el-option label="True Color" value="true_color"/>
            <el-option label="True Color Alpha" value="true_color_alpha"/>
            <el-option label="Indexed 1 (1 bit)" value="indexed_1"/>
            <el-option label="Indexed 2 (2 bit)" value="indexed_2"/>
            <el-option label="Indexed 4 (4 bit)" value="indexed_4"/>
            <el-option label="Indexed 8 (8 bit)" value="indexed_8"/>
          </el-select>
        </el-form-item>

        <el-form-item label="抖动">
          <el-switch v-model="convertSettings.dith"/>
        </el-form-item>

        <el-form-item label="输出格式">
          <el-select v-model="convertSettings.outputFormat">
            <el-option label="C 数组" :value="OutputMode.C"/>
            <el-option label="Python 数组" :value="OutputMode.PYTHON"/>
            <el-option label="二进制文件" :value="OutputMode.BIN"/>
          </el-select>
        </el-form-item>

        <!-- CF_TRUE_COLOR 和 CF_TRUE_COLOR_ALPHA 时显示 -->
        <template v-if="isRawColorFormat">
          <el-form-item label="颜色深度">
            <el-select v-model="convertSettings.colorDepth">
              <el-option label="16 bit (RGB565)" value="16"/>
              <el-option label="24 bit (RGB888)" value="24"/>
              <el-option label="32 bit (ARGB8888)" value="32"/>
            </el-select>
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" @click="convertImage" :disabled="!imageFile">
            转换图片
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 预览区域 -->
      <div class="preview-section" v-if="imagePreview">
        <h3>预览</h3>
        <div class="preview-container">
          <img :src="imagePreview" alt="Preview"/>
          <div class="image-info" v-if="imageInfo">
            <p>尺寸: {{imageInfo.width}} x {{imageInfo.height}} px</p>
            <p>文件大小: {{formatFileSize(imageInfo.size)}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ImageMode, OutputMode } from './enums'
import { convertImageBlob } from './convert'

// 状态定义
const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const imageInfo = ref<{
  width: number
  height: number
  size: number
} | null>(null)

// 转换设置
const convertSettings = reactive({
  cf: ImageMode.CF_TRUE_COLOR,
  dith: false,
  outputFormat: OutputMode.C,
  binaryFormat: ImageMode.CF_TRUE_COLOR,
  swapEndian: false,
  outName: 'img_converted',
  colorDepth: '16'
})

// 计算属性
const isRawColorFormat = computed(() => {
  return [ImageMode.CF_TRUE_COLOR, ImageMode.CF_TRUE_COLOR_ALPHA].includes(convertSettings.cf)
})

// 处理图片上传
const handleImageChange = (file: any) => {
  imageFile.value = file.raw
  imagePreview.value = URL.createObjectURL(file.raw)
  
  const img = new Image()
  img.onload = () => {
    imageInfo.value = {
      width: img.width,
      height: img.height,
      size: file.raw.size
    }
  }
  img.src = imagePreview.value
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
  else return (bytes / 1048576).toFixed(2) + ' MB'
}

// 转换图片
const convertImage = async () => {
  try {
    if (!imageFile.value) {
      ElMessage.warning('请先选择图片')
      return
    }

    // 创建Image对象用于转换
    const img = new Image()
    const imageLoadPromise = new Promise((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = reject
    })
    img.src = imagePreview.value
    await imageLoadPromise

    // 调用LVGL转换逻辑
    const result = await convertImageBlob(img, {
      cf: convertSettings.cf,
      dith: convertSettings.dith,
      outputFormat: convertSettings.outputFormat,
      binaryFormat: convertSettings.binaryFormat,
      swapEndian: convertSettings.swapEndian,
      outName: convertSettings.outName
    })
    
    const getFileExtension = (format: OutputMode) => {
      switch (format) {
        case OutputMode.C:
          return 'c'
        case OutputMode.PYTHON:
          return 'py'
        case OutputMode.BIN:
          return 'bin'
        default:
          return 'txt'
      }
    }

    const blob = new Blob([result], { 
      type: convertSettings.outputFormat === OutputMode.BIN 
        ? 'application/octet-stream' 
        : 'text/plain' 
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${convertSettings.outName}.${getFileExtension(convertSettings.outputFormat)}`
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success('图片转换成功')
  } catch (error) {
    console.error('图片转换失败:', error)
    ElMessage.error('图片转换失败: ' + error.message)
  }
}
</script>

<style scoped>
.image-converter {
  padding: 20px;
}

.converter-container {
  max-width: 800px;
  margin: 0 auto;
}

.image-upload {
  margin-bottom: 20px;
}

.settings-form {
  margin: 20px 0;
}

.preview-section {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.preview-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.preview-container img {
  max-width: 300px;
  max-height: 300px;
  object-fit: contain;
}

.image-info {
  color: #606266;
}

.dark .image-info {
  color: #a6a6a6;
}
</style> 