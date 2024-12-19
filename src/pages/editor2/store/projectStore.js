import { dispatch_data_changed_event } from '../utils.js';
import testData from '../testData.json';
import { reactive } from 'vue'  // Vue 3


// 项目状态管理
class ProjectStore {
  constructor() {
    this.currentProject = null;
    // this.projectData = reactive(this.getInitialState());
  }

  // 获取初始状态
  getInitialState() {
    return testData;
  }

  // 初始化/加载项目
  initProject(projectId) {
    this.currentProject = projectId;
    this.loadProject();

    this.componentCheck();
    this.updateTree();
  }

  // 从localStorage加载项目数据
  loadProject() {
    if (!this.currentProject) {
      this.projectData = reactive(this.getInitialState());
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
      this.projectData = reactive({
        ...this.getInitialState(),
        ...data
      });
    } catch (error) {
      console.error('Failed to parse project data:', error);
      this.projectData = reactive(this.getInitialState());
    }
  }

  componentCheck() {
    let pool = this.projectData.components.pool;
    if (!pool['screen']) {
      this.createWidget({ id: 'screen', type: 'screen', data: { x: 0, y: 0, width: 480, height: 480 } });
    }
  }

  getComponents() {
    return this.projectData.components.pool;
  }

  getWidgetById(id) {
    return this.projectData.components.pool[id];
  }

  makeWidgetId(widget) {
    let widgetNum = parseInt((widget.id || '_0').split('_')[1], 10);
    while (this.projectData.components.pool[widget.type + '_' + widgetNum.toString(10)]) {
      widgetNum++;
    }
    return widget.type + '_' + widgetNum.toString(10);
  }

  createWidget(widget) {
    let id = this.makeWidgetId(widget);

    let widgetInfo = {
      parent: '',
      id: id,
      type: widget.type,
      zindex: 0,
      cb: false,
      attributes: ['x', 'y', 'width', 'height'],
      apis: [],
      styles: [],
      data: {},
      ...widget
    };
    this.projectData.components.pool[id] = widgetInfo;

    this.updateTree();
    return widgetInfo;
  }

  copyWidget(widget) {
    let id = this.makeWidgetId(widget);
    let widgetWithId = { ...widget, id };
    this.projectData.components.pool[id] = widgetWithId;
    
    this.updateTree();
    return widgetWithId;
  }

  changeWidgetId(widget, id) {
    let widgetWithId = { ...widget, id };
    delete this.projectData.components.pool[widget.id];
    this.projectData.components.pool[id] = widgetWithId;
    this.updateTree();
  }

  getWidgetChildrenList(id, self = true) {
    let pool = this.projectData.components.pool;
    let dlist = [];
    if (self) {
      dlist.push(pool[id]);
    }
    for (const id in pool) {
      let child = pool[id];
      if (child.parent === id) {
        dlist.push(child);
      }
    }
    return dlist;
  }

  deleteWidget(widget) {
    let dlist = this.getWidgetChildrenList(widget.id, true);
    for (const child of dlist) {
      delete this.projectData.components.pool[child.id];
    }
    this.updateTree();
    return dlist;
  }

  updateTree() {
    // 创建一个Map来存储所有节点，方便查找
    const nodeMap = new Map();
    const trees = [];
    
    // 第一步：创建所有节点
    for (const widget of Object.values(this.projectData.components.pool)) {
      const node = {
        id: widget.id,
        label: widget.id,
        widgetType: widget.type,
        show: true,
        expanded: true,
        zindex: widget.zindex,
        children: []
      };
      nodeMap.set(widget.id, node);
    }
    
    // 第二步：构建树形结构
    for (const widget of Object.values(this.projectData.components.pool)) {
      const node = nodeMap.get(widget.id);
      
      if (widget.parent && nodeMap.has(widget.parent)) {
        // 如果有父节点且父节点存在，将当前节点添加到父节点的children中
        const parentNode = nodeMap.get(widget.parent);
        parentNode.children.push(node);
      } else {
        // 如果没有父节点或父节点不存在，将节点添加到根级别
        trees.push(node);
      }
    }

    // 排序
    for (const node of Object.entries(nodeMap)) {
      node.children.sort((a, b) => a.zindex - b.zindex);
    }
    trees.sort((a, b) => a.zindex - b.zindex);

    this.projectData.components.tree.splice(0, this.projectData.components.tree.length);
    this.projectData.components.tree.push(...trees);
    console.log('updateTree', this.projectData.components.tree);
  }

  updateWidgetTreeIndex() {
    let change = [];
    let tree = this.projectData.components.tree;
    let pool = this.projectData.components.pool;
    let index = 0;
    function updateIndex(node, zindex) {
      if (node.zindex != zindex) {
        change.push({id: node.id, zindex: zindex });
      }
      node.zindex = zindex;
      pool[node.id].zindex = zindex;

      for (const child of node.children) {
        updateIndex(child, index++);
      }
    }
    for (const node of tree) {
      updateIndex(node, index++);
    }
    console.log('updateWidgetTreeIndex', change, tree);
    return change;
  }

  getTimelines() {
    return this.projectData.animations.timelines;
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
    let list = this.projectData.assets[type] || [];
    for (const asset of list) {
      asset.value = asset.value || '';
    }
    return list;
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
      version: '2.0.0',
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