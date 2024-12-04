import { dispatch_data_changed_event } from '../utils.js';
import testData from '../testData.json';

// 项目状态管理
class ProjectStore {
  constructor() {
    this.currentProject = null;
    this.projectData = this.getInitialState();
  }

  // 获取初始状态
  getInitialState() {
    return testData;
  }

  // 初始化/加载项目
  initProject(projectId) {
    this.currentProject = projectId;
    this.loadProject();
  }

  // 从localStorage加载项目数据
  loadProject() {
    if (!this.currentProject) {
      this.projectData = this.getInitialState();
      return;
    }
    
    // 先尝试加载新格式数据
    const key = `lvgl_project_${this.currentProject}`;
    let savedData = localStorage.getItem(key);
    if (!savedData) {
      savedData = '{}'
    }
    
    try {
      const data = JSON.parse(savedData);
      this.projectData = {
        ...this.getInitialState(),
        ...data
      };
    } catch (error) {
      console.error('Failed to parse project data:', error);
      this.projectData = this.getInitialState();
    }
  }

  // 保存项目数据
  saveProject() {
    if (!this.currentProject) return;
    
    const key = `lvgl_project_${this.currentProject}`;
    localStorage.setItem(key, JSON.stringify(this.projectData));
    dispatch_data_changed_event();
  }

  // 资源管理方法
  addAsset(type, asset) {
    const id = Date.now().toString();
    const assetWithId = { id, ...asset };
    
    if (!Array.isArray(this.projectData.assets[type])) {
      this.projectData.assets[type] = [];
    }
    
    this.projectData.assets[type].push(assetWithId);
    this.saveProject();
    return id;
  }

  updateAsset(type, id, data) {
    const assets = this.projectData.assets[type];
    const index = assets.findIndex(asset => asset.id === id);
    
    if (index !== -1) {
      assets[index] = {
        ...assets[index],
        ...data
      };
      this.saveProject();
      return true;
    }
    return false;
  }

  deleteAsset(type, id) {
    const assets = this.projectData.assets[type];
    const index = assets.findIndex(asset => asset.id === id);
    
    if (index !== -1) {
      assets.splice(index, 1);
      this.saveProject();
      return true;
    }
    return false;
  }

  getAsset(type, id) {
    return this.projectData.assets[type].find(asset => asset.id === id);
  }

  getAllAssets(type) {
    return this.projectData.assets[type] || [];
  }

  // 项目设置方法
  updateSettings(path, value) {
    let target = this.projectData.settings;
    const parts = path.split('.');
    const last = parts.pop();
    
    for (const part of parts) {
      target = target[part];
    }
    
    target[last] = value;
    this.saveProject();
  }

  // 获取项目设置
  getSettings(path) {
    let target = this.projectData.settings;
    const parts = path.split('.');
    
    for (const part of parts) {
      target = target[part];
    }
    
    return target;
  }

  // 清空项目数据
  clear() {
    this.projectData = this.getInitialState();
    this.saveProject();
  }

  // 添加数据兼容转换方法
  convertOldData(oldData) {
    return {
      id: oldData.id || 'default',
      name: oldData.name || 'Untitled Project',
      description: '',
      version: oldData.version || '1.0.0',
      versionCode: oldData.versionCode || 1,

      components: {
        tree: oldData.widget_tree || [
          {
            id: 'screen',
            label: 'screen',
            widgetType: 'screen',
            children: []
          }
        ],
        pool: oldData.InfoPool || {}
      },

      animations: {
        timelines: oldData.timelines || [],
        sequences: []
      },

      assets: {
        images: [],
        fonts: [
          {
            id: 'montserrat_16',
            name: 'Montserrat 16',
            path: 'lv.font_montserrat_16'
          },
          {
            id: 'montserrat_14',
            name: 'Montserrat 14',
            path: 'lv.font_montserrat_14'
          }
        ],
        themes: []
      },

      settings: {
        screen: {
          width: oldData.screenWidth || 480,
          height: oldData.screenHeight || 320
        },
        output: {
          format: oldData.is_c_mode ? 'c' : 'python',
          path: ''
        },
        lvgl: {
          version: '8.3.0',
          colorDepth: 16
        }
      }
    };
  }
}

export const projectStore = new ProjectStore();

// 初始化默认项目
projectStore.initProject('default'); 