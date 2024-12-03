<template>
  <div class="project-settings">
    <el-tabs type="border-card">
      <!-- 基本信息 -->
      <el-tab-pane label="Basic Info">
        <el-form :model="config" label-width="120px">
          <el-form-item label="Project Name">
            <el-input v-model="config.name" />
          </el-form-item>
          <el-form-item label="Description">
            <el-input type="textarea" v-model="config.description" />
          </el-form-item>
          <el-form-item label="Version">
            <el-input v-model="config.version" />
          </el-form-item>
          <el-form-item label="Author">
            <el-input v-model="config.author" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- LVGL 配置 -->
      <el-tab-pane label="LVGL Settings">
        <el-form :model="config" label-width="120px">
          <el-form-item label="LVGL Version">
            <el-select v-model="config.lvglVersion">
              <el-option label="v8.3.0" value="8.3.0" />
              <el-option label="v8.2.0" value="8.2.0" />
            </el-select>
          </el-form-item>
          <el-form-item label="Screen Size">
            <el-input-number v-model="config.screenSize.width" :min="1" />
            x
            <el-input-number v-model="config.screenSize.height" :min="1" />
          </el-form-item>
          <el-form-item label="Color Depth">
            <el-select v-model="config.colorDepth">
              <el-option label="16-bit" :value="16" />
              <el-option label="32-bit" :value="32" />
            </el-select>
          </el-form-item>
          <el-form-item label="Default Font">
            <el-select v-model="config.defaultFont">
              <el-option 
                v-for="font in availableFonts"
                :key="font.value" 
                :label="font.label"
                :value="font.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 代码生成配置 -->
      <el-tab-pane label="Code Generation">
        <el-form :model="config" label-width="120px">
          <el-form-item label="Output Format">
            <el-radio-group v-model="config.outputFormat">
              <el-radio label="c">C</el-radio>
              <el-radio label="python">Python</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="Output Path">
            <el-input v-model="config.outputPath">
              <template #append>
                <el-button @click="selectOutputPath">Browse</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="Variable Prefix">
            <el-input v-model="config.prefix" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 资源管理 -->
      <el-tab-pane label="Assets">
        <el-tabs>
          <el-tab-pane label="Fonts">
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleFontUpload"
            >
              <el-button type="primary">Add Font</el-button>
            </el-upload>
            <el-table :data="config.assets.fonts">
              <el-table-column prop="name" label="Font Name" />
              <el-table-column prop="size" label="Size" />
              <el-table-column fixed="right" label="Operations">
                <template #default="scope">
                  <el-button 
                    link 
                    type="danger" 
                    @click="removeFontAsset(scope.$index)"
                  >
                    Delete
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="Images">
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleImageUpload"
            >
              <el-button type="primary">Add Image</el-button>
            </el-upload>
            <el-table :data="config.assets.images">
              <el-table-column prop="name" label="Image Name" />
              <el-table-column prop="size" label="Size" />
              <el-table-column fixed="right" label="Operations">
                <template #default="scope">
                  <el-button 
                    link 
                    type="danger" 
                    @click="removeImageAsset(scope.$index)"
                  >
                    Delete
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>

    <!-- 底部操作按钮 -->
    <div class="settings-footer">
      <el-button type="primary" @click="saveSettings">Save Settings</el-button>
      <el-button @click="resetSettings">Reset</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'creator-project-settings',
  data() {
    return {
      config: {
        name: '',
        description: '',
        version: '1.0.0',
        author: '',
        lvglVersion: '8.3.0',
        screenSize: {
          width: 480,
          height: 320
        },
        colorDepth: 16,
        defaultFont: 'montserrat_16',
        outputFormat: 'c',
        outputPath: '',
        prefix: 'ui_',
        assets: {
          fonts: [],
          images: []
        }
      },
      availableFonts: [
        { label: 'Montserrat 16', value: 'montserrat_16' },
        { label: 'Montserrat 14', value: 'montserrat_14' }
      ]
    }
  },
  methods: {
    // 保存设置
    saveSettings() {
      localStorage.setItem('project_config', JSON.stringify(this.config));
      this.$emit('save', this.config);
    },
    
    // 重置设置
    resetSettings() {
      this.config = JSON.parse(localStorage.getItem('project_config') || '{}');
    },

    // 选择输出路径
    selectOutputPath() {
      // 调用系统文件选择对话框
    },

    // 处理字体上传
    handleFontUpload(file) {
      // 处理字体文件上传
    },

    // 处理图片上传  
    handleImageUpload(file) {
      // 处理图片文件上传
    },

    // 移除字体资源
    removeFontAsset(index) {
      this.config.assets.fonts.splice(index, 1);
    },

    // 移除图片资源
    removeImageAsset(index) {
      this.config.assets.images.splice(index, 1);
    }
  }
}
</script>

<style lang="less" scoped>
.project-settings {
  padding: 20px;

  .settings-footer {
    margin-top: 20px;
    text-align: right;
  }
}
</style> 