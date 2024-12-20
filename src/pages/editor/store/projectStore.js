import { dispatch_data_changed_event } from '../utils.js';
import { reactive } from 'vue'  // Vue 3

let predefineColors = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577',
];


// 项目状态管理
class ProjectStore {
  constructor() {
    this.currentProject = null;
    this.componentTree = reactive([]);
    this.projectData = reactive({
      id: "",
      "name": "Project",
      "description": "",
      "version": "1.0.0",
      "versionCode": 1,
      "author": "",
      components: {
      },
      animations: {
        timelines: [],
        sequences: []
      },
      assets: {
        images: [],
        fonts: [],
        themes: []
      },
      settings: {
        screen: {
          width: 480,
          height: 320
        },
        lvgl: {
          version: '8.3.0',
          colorDepth: 16
        },
        output: {
          format: 'python',
          path: ''
        }
      }
    });
  }

  // 获取初始状态
  getInitialState() {
    return {};
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
      Object.assign(this.projectData, this.getInitialState());
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

      Object.assign(this.projectData, {
        ...this.getInitialState(),
        ...data
      });
    } catch (error) {
      console.error('Failed to parse project data:', error);
      Object.assign(this.projectData, this.getInitialState());
    }
  }

  componentCheck() {
    let pool = this.projectData.components;
    if (!pool['screen']) {
      this.createWidget({ id: 'screen', type: 'screen', data: { x: 0, y: 0, width: 480, height: 480 } });
    }

    // 检查字体
    let fonts = this.getAllAssets('fonts');
    if (fonts.find(font => font.path == 'lv.font_montserrat_14') == null) {
      this.addAsset('fonts', { name: 'Montserrat 14', path: 'lv.font_montserrat_14' });
    }
    if (fonts.find(font => font.path == 'lv.font_montserrat_16') == null) {
      this.addAsset('fonts', { name: 'Montserrat 16', path: 'lv.font_montserrat_16' });
    }

    let assets = this.projectData.assets;
    assets.images = assets.images || [];
    assets.fonts = assets.fonts || [];
    assets.themes = assets.themes || [];
    
    assets.fonts.sort((a, b) => a.name.localeCompare(b.name));
  }

  getComponents() {
    return this.projectData.components;
  }

  getWidgetById(id) {
    return this.projectData.components[id];
  }

  makeWidgetId(widget) {
    let widgetNum = parseInt((widget.id || '_1').split('_')[1], 10) || 1;
    while (this.projectData.components[widget.type + '_' + widgetNum.toString(10)]) {
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
    this.projectData.components[widgetInfo.id] = widgetInfo;

    this.updateTree();
    return widgetInfo;
  }

  copyWidget(widget) {
    let id = this.makeWidgetId(widget);
    let widget2 = JSON.parse(JSON.stringify(widget));
    let widgetWithId = { ...widget2, id };
    this.projectData.components[id] = widgetWithId;
    
    this.updateTree();
    return widgetWithId;
  }

  changeWidgetId(widget, id) {
    let widgetWithId = { ...widget, id };
    delete this.projectData.components[widget.id];
    this.projectData.components[id] = widgetWithId;
    this.updateTree();
  }

  getWidgetChildrenList(id, self = true) {
    let pool = this.projectData.components;
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
      delete this.projectData.components[child.id];
    }
    this.updateTree();
    return dlist;
  }

  updateTree() {
    // 创建一个Map来存储所有节点，方便查找
    const nodeMap = new Map();
    const trees = [];
    
    // 第一步：创建所有节点
    for (const widget of Object.values(this.projectData.components)) {
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
    for (const widget of Object.values(this.projectData.components)) {
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
    function sortChildren(nodes) {
      nodes.sort((a, b) => a.zindex - b.zindex);
      for (const node of nodes) {
        sortChildren(node.children);
      }
    }
    sortChildren(trees);

    this.componentTree.splice(0, this.componentTree.length);
    this.componentTree.push(...trees);
    console.log('updateTree', this.componentTree);
  }

  updateWidgetTreeIndex() {
    let change = [];
    let tree = this.componentTree;
    let pool = this.projectData.components;
    let index = 0;
    function updateIndex(node, parent, zindex) {
      if (node.zindex != zindex) {
        change.push({id: node.id, zindex: zindex });
      }
      node.zindex = zindex;
      pool[node.id].zindex = zindex;
      pool[node.id].parent = parent;

      for (const child of node.children) {
        updateIndex(child, node.id, index++);
      }
    }
    for (const node of tree) {
      updateIndex(node, '', index++);
    }
    console.log('updateWidgetTreeIndex', change, tree, pool);
    // this.updateTree();
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
    if (type == 'colors') {
      return predefineColors;
    }
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
// projectStore.initProject('default'); 