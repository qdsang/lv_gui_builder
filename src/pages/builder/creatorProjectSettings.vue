<template>
  <div class="project-settings">
    <div class="settings-layout">
      <!-- 左侧设置分类 -->
      <div class="settings-menu">
        <el-menu
          :default-active="activeMenu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="basic">
            <el-icon><Document /></el-icon>
            <span>Basic Info</span>
          </el-menu-item>
          <el-menu-item index="lvgl">
            <el-icon><Monitor /></el-icon>
            <span>LV Settings</span>
          </el-menu-item>
          <el-menu-item index="code">
            <el-icon><DocumentAdd /></el-icon>
            <span>Code Generation</span>
          </el-menu-item>
          <el-menu-item index="assets">
            <el-icon><FolderOpened /></el-icon>
            <span>Assets</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧设置内容 -->
      <div class="settings-content">
        <!-- 基本信息 -->
        <div v-show="activeMenu === 'basic'" class="settings-section">
          <h3>Basic Information</h3>
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
        </div>

        <!-- LVGL 配置 -->
        <div v-show="activeMenu === 'lvgl'" class="settings-section">
          <h3>LVGL Configuration</h3>
          <el-form :model="config" label-width="120px">
            <el-form-item label="LVGL Version">
              <el-select v-model="config.lvglVersion">
                <el-option label="v9.2.0" value="9.2.0" disabled />
                <el-option label="v8.3.0" value="8.3.0" />
                <el-option label="v8.2.0" value="8.2.0" disabled/>
              </el-select>
            </el-form-item>
            <el-form-item label="Screen Size">
              <div class="size-inputs">
                <el-input-number v-model="config.screenSize.width" :min="1" />
                <span class="x-separator">×</span>
                <el-input-number v-model="config.screenSize.height" :min="1" />
                <span class="size-unit">px</span>
              </div>
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
        </div>

        <!-- 代码生成配置 -->
        <div v-show="activeMenu === 'code'" class="settings-section">
          <h3>Code Generation</h3>
          <el-form :model="config" label-width="120px">
            <el-form-item label="Output Format">
              <el-radio-group v-model="config.outputFormat">
                <el-radio value="cpp" disabled>C++</el-radio>
                <el-radio value="c">C</el-radio>
                <el-radio value="python">Python</el-radio>
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
        </div>

        <!-- 资源管理 -->
        <div v-show="activeMenu === 'assets'" class="settings-section">
          <h3>Assets Management</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Images">
              {{ config.assets.images.length }} images
              <el-link type="primary" @click="activeTab = 'image'">Manage Images</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="Fonts">
              {{ config.assets.fonts.length }} fonts
              <el-link type="primary" @click="activeTab = 'font'">Manage Fonts</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="Themes">
              {{ config.assets.themes.length }} themes
              <el-link type="primary">Manage Themes</el-link>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="settings-footer">
      <el-button type="primary" @click="saveSettings">Save Settings</el-button>
      <el-button @click="resetSettings">Reset</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Document, Monitor, DocumentAdd, FolderOpened } from '@element-plus/icons-vue'
import { projectStore } from './store/projectStore'

export default {
  name: 'creator-project-settings',
  components: {
    Document,
    Monitor, 
    DocumentAdd,
    FolderOpened
  },
  data() {
    return {
      activeMenu: 'basic',
      // 直接使用 projectStore 中的数据
      config: {
        name: projectStore.projectData.name,
        description: projectStore.projectData.description,
        version: projectStore.projectData.version,
        author: projectStore.projectData.author,
        lvglVersion: projectStore.projectData.settings.lvgl.version,
        screenSize: projectStore.projectData.settings.screen,
        colorDepth: projectStore.projectData.settings.lvgl.colorDepth,
        defaultFont: projectStore.projectData.settings.lvgl.defaultFont || 'montserrat_16',
        outputFormat: projectStore.projectData.settings.output.format,
        outputPath: projectStore.projectData.settings.output.path,
        prefix: projectStore.projectData.settings.output.prefix || 'ui_',
        assets: projectStore.projectData.assets
      },
      availableFonts: projectStore.getAllAssets('fonts')
    }
  },
  methods: {
    handleMenuSelect(key) {
      this.activeMenu = key;
    },

    // 保存设置到 projectStore
    saveSettings() {
      // 更新 projectStore 数据
      projectStore.projectData.name = this.config.name;
      projectStore.projectData.description = this.config.description;
      projectStore.projectData.version = this.config.version;
      projectStore.projectData.author = this.config.author;

      // 更新 LVGL 设置
      projectStore.projectData.settings.lvgl = {
        version: this.config.lvglVersion,
        colorDepth: this.config.colorDepth,
        defaultFont: this.config.defaultFont
      };

      // 更新屏幕设置
      projectStore.projectData.settings.screen = this.config.screenSize;

      // 更新输出设置
      projectStore.projectData.settings.output = {
        format: this.config.outputFormat,
        path: this.config.outputPath,
        prefix: this.config.prefix
      };

      // 保存到 projectStore
      projectStore.saveProject();

      // 通知父组件
      this.$emit('save', projectStore.projectData);
    },

    // 重置为 projectStore 中的数据
    resetSettings() {
      this.config = {
        name: projectStore.projectData.name,
        description: projectStore.projectData.description,
        version: projectStore.projectData.version,
        author: projectStore.projectData.author,
        lvglVersion: projectStore.projectData.settings.lvgl.version,
        screenSize: projectStore.projectData.settings.screen,
        colorDepth: projectStore.projectData.settings.lvgl.colorDepth,
        defaultFont: projectStore.projectData.settings.lvgl.defaultFont || 'montserrat_16',
        outputFormat: projectStore.projectData.settings.output.format,
        outputPath: projectStore.projectData.settings.output.path,
        prefix: projectStore.projectData.settings.output.prefix || 'ui_',
        assets: projectStore.projectData.assets
      };
    },

    selectOutputPath() {
      // 调用系统文件选择对话框
    }
  },

  // 监听 projectStore 变化
  watch: {
    'projectStore.projectData': {
      handler() {
        this.resetSettings();
      },
      deep: true
    }
  },

  // 组件挂载时从 projectStore 加载数据
  mounted() {
    this.resetSettings();
  }
}
</script>

<style lang="less" scoped>
.project-settings {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-overlay);

  .settings-layout {
    flex: 1;
    display: flex;
    overflow: hidden;

    .settings-menu {
      width: 100px;
      border-right: 1px solid var(--el-border-color-light);
      
      :deep(.el-menu) {
        border-right: none;
      }

      :deep(.el-menu-item) {
        .el-icon {
          margin-right: 12px;
        }
      }
    }

    .settings-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;

      .settings-section {
        max-width: 800px;
        margin: 0 auto;

        h3 {
          margin: 0 0 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--el-border-color-light);
          color: var(--el-text-color-primary);
        }

        .size-inputs {
          display: flex;
          align-items: center;
          gap: 8px;

          .x-separator {
            color: var(--el-text-color-secondary);
          }

          .size-unit {
            color: var(--el-text-color-secondary);
            margin-left: 4px;
          }
        }
      }
    }
  }

  .settings-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--el-border-color-light);
    text-align: right;
    background: var(--el-bg-color);
  }
}
</style> 