<template>
  <div class="font-converter">
    <div class="font-settings">
      <el-upload
        class="font-upload"
        drag
        :auto-upload="false"
        :on-change="handleFontFileChange"
        accept=".ttf,.woff,.woff2,.otf"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">拖拽字体文件到此处或 <em>点击上传</em></div>
      </el-upload>

      <el-form :model="fontSettings" label-width="120px" class="settings-form">
        <el-form-item label="字体名">
          <el-input 
            v-model="fontSettings.font_name"
            placeholder="例如: arial_40"
          />
        </el-form-item>
        <el-form-item label="字体函数名">
          <el-input 
            v-model="fontSettings.fallback"
            placeholder="例如: lv_font_montserrat_16"
          />
        </el-form-item>
        <el-form-item label="字体大小(px)">
          <el-input-number v-model="fontSettings.size" :min="8" :max="400"/>
        </el-form-item>
        
        <el-form-item label="位深(bpp)">
          <el-select v-model="fontSettings.bpp">
            <el-option label="1位 (黑白)" :value="1"/>
            <el-option label="2位 (4级灰度)" :value="2"/>
            <el-option label="3位 (8级灰度)" :value="3"/>
            <el-option label="4位 (16级灰度)" :value="4"/>
          </el-select>
        </el-form-item>

        <el-form-item label="字符范围">
          <el-input 
            v-model="fontSettings.range"
            placeholder="例如: 0x20-0x7F"
          />
          <div class="range-shortcuts">
            <el-button 
              v-for="preset in rangePresets" 
              :key="preset.name"
              size="small"
              @click="addRange(preset.range)"
            >
              {{ preset.name }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="符号">
          <el-input
            v-model="fontSettings.symbols"
            type="textarea"
            :rows="2"
            placeholder="输入需要包含的具体字符，如: ABC你好123"
          />
        </el-form-item>

        <el-form-item label="输出格式">
          <el-select v-model="fontSettings.format">
            <el-option label="LVGL C文件" value="lvgl"/>
            <el-option label="LVGL Python文件" value="python"/>
            <el-option label="二进制文件" value="bin"/>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="fontSettings.compress">启用压缩</el-checkbox>
          <el-checkbox v-model="fontSettings.kerning">保留字距信息</el-checkbox>
          <el-checkbox v-model="fontSettings.autohint">启用自动微调</el-checkbox>
        </el-form-item>
      </el-form>

      <div class="preview-section">
        <h3>预览</h3>
        <div class="preview-content" v-if="previewText" :style="previewStyle">
          {{ previewText }}
        </div>
        <div class="preview-placeholder" v-else>
          上传字体文件后在此处预览
        </div>
      </div>

      <el-button type="primary" @click="generateFont" :disabled="!fontFile">
        生成字体文件
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Buffer } from 'buffer'
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import FontCollectData from 'lv_font_conv/lib/collect_font_data'
import FontWriterBin from 'lv_font_conv/lib/writers/bin'
import FontWriterLvgl from 'lv_font_conv/lib/writers/lvgl'
import FontWriterPython from './writers/python'

let writers = {
  bin: FontWriterBin,
  lvgl: FontWriterLvgl,
  python: FontWriterPython
};

async function FontConvert(args) {
  let font_data = await FontCollectData(args);
  let files = writers[args.format](args, font_data);
  return files;
}

export default {
  name: 'FontConverter',
  provide() {
    return {};
  },
  setup() {
    const fontFile = ref(null)
    const previewText = ref('Hello 你好 123')
    const fontUrl = ref('')
    
    const fontSettings = reactive({
      font_name: 'arial_40',
      fallback: 'lv_font_montserrat_16',
      size: 16,
      bpp: 4,
      range: '0x20-0x7F', // 默认包含英文
      format: 'lvgl',
      compress: true,
      kerning: true,
      autohint: true,
      symbols: '' // 默认符号
    })

    const previewStyle = computed(() => ({
      fontSize: `${fontSettings.size}px`,
      fontFamily: fontUrl.value ? 'preview-font' : 'inherit'
    }))

    const handleFontFileChange = async (file) => {
      // 读取文件内容为 ArrayBuffer
      const arrayBuffer = await file.raw.arrayBuffer()
      fontFile.value = {
        name: file.name,
        data: Buffer.from(arrayBuffer)
      }
      console.log('fontFile', fontFile.value, arrayBuffer)
      
      // 创建字体预览
      if (fontUrl.value) {
        URL.revokeObjectURL(fontUrl.value)
      }
      fontUrl.value = URL.createObjectURL(file.raw)
      
      // 添加@font-face规则
      const style = document.createElement('style')
      style.textContent = `
        @font-face {
          font-family: 'preview-font';
          src: url('${fontUrl.value}') format('${file.raw.type}');
        }
      `
      document.head.appendChild(style)
    }

    const generateFont = async () => {
      if (!fontFile.value) return
      console.log('fontFile', fontFile.value)
      
      try {
        let fcnt = 0;
        const fonts = [
          {
            source_path: fontFile.value.name,
            source_bin: fontFile.value.data,
            ranges: [ { range : [], symbols: '' } ]
          }
        ]
        fonts[fcnt].ranges[0].symbols = fontSettings.symbols;

        const r_str = fontSettings.range || '0x20-0x7F';
        let r_sub = r_str.split(',');
        if (r_str.length) {
          // Parse the ranges. A range is array with 3 elements:
          //[range start, range end, range remap start]
          // Multiple ranges just means
          //an other 3 element in the array
          for (let i = 0; i < r_sub.length; i++) {
            let r = r_sub[i].split('-');
            fonts[fcnt].ranges[0].range[i * 3 + 0] = parseInt(r[0]);
            if (r[1]) {
              fonts[fcnt].ranges[0].range[i * 3 + 1] = parseInt(r[1]);
            } else {
              fonts[fcnt].ranges[0].range[i * 3 + 1] = parseInt(r[0]);
            }
            fonts[fcnt].ranges[0].range[i * 3 + 2] = parseInt(r[0]);
          }
        }
        // 创建lv_font_conv命令行参数
        const args = {
          font: [],
          size: fontSettings.size,
          bpp: fontSettings.bpp,
          no_compress: !fontSettings.compress,
          lcd: false,
          lcd_v: false,
          use_color_info: false,
          format: fontSettings.format,
          output: fontSettings.font_name,
          lv_fallback: fontSettings.fallback,
          opts_string: '',
        }
        args.opts_string = 'lv_font_conv -f ' + JSON.stringify(args);
        args.font = fonts;

        ElMessage({
          message: 'Generating font file...',
          type: 'info'
        });

        // 调用lv_font_conv
        const results = await FontConvert(args)
        console.log('result', results)
        // 下载生成的文件
        for (const font_name in results) {
          const result = results[font_name];
          const blob = new Blob([result], { 
            type: fontSettings.format === 'lvgl' ? 'text/plain' : 'application/octet-stream' 
          })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `font_${font_name}_${fontSettings.size}px.${
            fontSettings.format === 'lvgl' ? 'c' : 
            fontSettings.format === 'python' ? 'py' : 'bin'
          }`
          link.click()
          URL.revokeObjectURL(url)
        }

        ElMessage.success('字体文件生成成功')
      } catch (error) {
        console.error('生成字体文件失败:', error)
        ElMessage.error('生成字体文件失败: ' + error.message)
      }
    }

    const rangePresets = [
      { name: '数字（0-9）', range: '0x30-0x39' },
      { name: '英文字母（A-Z, a-z）', range: '0x20-0x7F' },
      { name: '常用中文（一、我、你...）', range: '0x4E00-0x9FFF' },
      { name: '特殊符号（←→↑↓♠♥♦♣☀）', range: '0x2000-0x206F' },
      { name: '标点符号（，。、；：！？）', range: '0x3000-0x303F' },
      { name: '希腊字母（αβγδεζηθικ）', range: '0x0370-0x03FF' }
    ]

    const addRange = (newRange: string) => {
      const currentRanges = fontSettings.range.split(',').filter(r => r.trim())
      if (!currentRanges.includes(newRange)) {
        fontSettings.range = currentRanges.length 
          ? `${fontSettings.range},${newRange}`
          : newRange
      }
    }

    return {
      fontFile,
      fontSettings,
      previewText,
      previewStyle,
      handleFontFileChange,
      generateFont,
      rangePresets,
      addRange
    }
  }
}
</script>

<style scoped>
.font-converter {
  padding: 20px;
}

.font-settings {
  max-width: 800px;
  margin: 0 auto;
}

.settings-form {
  margin-top: 20px;
}

.preview-section {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.dark .preview-section {
  color: #fff;
}

.preview-content {
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  word-break: break-all;
  line-height: 1.5;
}

.preview-placeholder {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background: #f5f7fa;
  border-radius: 4px;
}

.range-shortcuts {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.range-shortcuts .el-button {
  margin-right: 0;
}

.el-input.el-textarea {
  margin-top: 8px;
}
</style> 