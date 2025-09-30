# 画布组件架构设计

## 概述

本文档描述了画布组件的架构设计，包括组件结构、职责划分和代码组织原则。

## 组件结构

### 核心组件

1. **Canvas.vue**
   - 主画布组件
   - Vue组件包装器，提供Vue集成
   - 管理KonvaCanvas实例的生命周期

2. **KonvaCanvas.js**
   - 基于Konva.js的画布实现
   - 纯JavaScript类，不依赖Vue
   - 提供缩放、拖动、插件系统等核心功能
   - 支持LVGL内容渲染

### 插件系统

插件系统为画布提供可扩展的功能：

1. **CanvasPlugin 基类**
   - 所有插件的基类
   - 定义插件的标准接口和生命周期方法

2. **PluginManager 插件管理器**
   - 负责插件的注册、初始化、销毁和调用
   - 提供统一的插件管理接口

3. **具体插件实现**
   - RulerPlugin: 比例尺插件
   - GridPlugin: 网格插件（示例）

### 核心管理器

为了更好地管理画布的各种功能，我们实现了多个专门的管理器：

1. **ElementManager 元素管理器**
   - 管理画布中的所有元素
   - 提供元素的创建、删除、查找等功能

2. **ViewManager 视图管理器**
   - 管理画布的视图状态
   - 处理缩放、平移等视图操作

3. **SelectionManager 选择管理器**
   - 管理元素的选择状态
   - 提供多选、单选等功能

4. **AlignmentManager 对齐管理器**
   - 处理元素的对齐功能
   - 提供各种对齐操作

5. **EventManager 事件管理器**
   - 管理画布的事件系统
   - 处理用户交互事件

### 工具函数

为了提高代码复用性和可维护性，我们将通用的业务逻辑抽离到独立的工具函数中：

1. **canvasUtils.js**
   - 画布相关工具函数
   - 包括组对象管理、屏幕变换、背景绘制等

2. **eventUtils.js**
   - 事件处理工具函数
   - 包括鼠标滚轮、鼠标按下、鼠标移动等事件处理

3. **rulerUtils.js**
   - 比例尺相关工具函数
   - 包括单位计算、刻度绘制等

## 职责划分

### Vue组件职责

Vue组件主要负责以下职责：

1. **Vue集成**
   - 提供Vue模板和绑定
   - 管理组件生命周期
   - 处理Vue特定的逻辑

2. **实例管理**
   - 创建和销毁KonvaCanvas实例
   - 暴露公共API给父组件

### KonvaCanvas职责

KonvaCanvas类主要负责以下职责：

1. **画布管理**
   - 初始化和管理Konva.js画布
   - 管理屏幕组和其他可视化元素

2. **交互处理**
   - 处理缩放、拖动等用户交互
   - 管理视图状态

3. **插件系统**
   - 集成插件管理器
   - 协调插件与画布的交互

4. **核心功能**
   - 坐标转换
   - 视图更新
   - LVGL集成支持

### 插件职责

插件主要负责以下职责：

1. **功能扩展**
   - 实现特定功能（如比例尺、网格等）
   - 保持与画布核心功能的独立性

2. **生命周期管理**
   - 实现标准的插件生命周期方法
   - 管理插件内部资源

### 管理器职责

各个管理器负责特定领域的功能：

1. **ElementManager**
   - 管理画布元素的生命周期
   - 提供元素操作接口

2. **ViewManager**
   - 管理视图变换和显示
   - 处理缩放和平移操作

3. **SelectionManager**
   - 管理元素选择状态
   - 提供选择相关功能

4. **AlignmentManager**
   - 处理元素对齐逻辑
   - 提供对齐操作接口

5. **EventManager**
   - 管理画布事件系统
   - 协调各组件间的事件交互

### 工具函数职责

工具函数主要负责以下职责：

1. **业务逻辑处理**
   - 实现具体的业务逻辑
   - 提供可复用的功能模块

2. **数据处理**
   - 处理坐标转换
   - 计算缩放比例等

3. **绘图辅助**
   - 提供绘图相关的辅助函数
   - 简化主要类中的绘图代码

## 代码组织原则

### 关注点分离

我们遵循关注点分离原则，将不同类型的代码组织在不同的文件中：

1. **UI相关代码** → Vue组件文件
2. **业务逻辑代码** → 纯JavaScript类文件
3. **功能扩展代码** → 插件文件
4. **通用工具代码** → 工具函数文件

### 代码复用

通过将通用功能抽离为工具函数和插件，我们实现了代码复用：

1. **减少重复代码**
2. **提高开发效率**
3. **便于维护和更新**

### 可维护性

我们的代码组织方式提高了可维护性：

1. **职责清晰**：每个文件都有明确的职责
2. **易于定位问题**：问题可以快速定位到具体文件
3. **便于扩展**：新功能可以轻松添加而不影响现有代码

## 目录结构

```
src/pages/builder/canvas/
├── Canvas.vue              # Vue组件包装器
├── KonvaCanvas.js          # 基于Konva.js的画布实现
├── core/                   # 核心管理器目录
│   ├── ElementManager.js   # 元素管理器
│   ├── ViewManager.js      # 视图管理器
│   ├── SelectionManager.js # 选择管理器
│   ├── AlignmentManager.js # 对齐管理器
│   ├── EventManager.js     # 事件管理器
│   └── EventSystem.js      # 事件系统
├── plugins/                # 插件目录
│   ├── CanvasPlugin.js     # 插件基类
│   ├── PluginManager.js    # 插件管理器
│   ├── RulerPlugin.js      # 比例尺插件
│   └── GridPlugin.js       # 网格插件（示例）
└── utils/                  # 工具函数目录
    ├── canvasUtils.js      # 画布相关工具函数
    ├── eventUtils.js       # 事件处理工具函数
    └── rulerUtils.js       # 比例尺相关工具函数
```

## 使用示例

### 基本使用

```vue
<template>
  <Canvas 
    ref="canvasComponent"
    :canvas-width="screen.width || 480"
    :canvas-height="screen.height || 480"
    :plugins="['ruler']"
  />
</template>

<script>
import Canvas from './canvas/Canvas.vue';

export default {
  components: {
    Canvas
  },
  methods: {
    resetView() {
      this.$refs.canvasComponent.resetView();
    }
  }
};
</script>
```

### 高级使用

```vue
<template>
  <Canvas 
    ref="canvasComponent"
    :plugins="['ruler', 'grid']"
  />
</template>

<script>
import Canvas from './canvas/Canvas.vue';

export default {
  components: {
    Canvas
  },
  methods: {
    toggleGrid() {
      const gridPlugin = this.$refs.canvasComponent.getPlugin('grid');
      if (gridPlugin) {
        if (gridPlugin.options.enabled) {
          gridPlugin.disable();
        } else {
          gridPlugin.enable();
        }
      }
    }
  }
};
</script>
```

## 最佳实践

### 组件开发

1. **保持组件简洁**：Vue组件应只关注UI渲染和状态管理
2. **使用纯JavaScript实现核心逻辑**：复杂逻辑应在KonvaCanvas类中实现
3. **明确定义接口**：组件应提供清晰的公共接口

### KonvaCanvas开发

1. **关注核心功能**：KonvaCanvas应专注于画布管理和交互处理
2. **通过插件扩展功能**：新功能应尽可能通过插件实现
3. **提供清晰的API**：公共方法应有明确的输入输出

### 插件开发

1. **继承基类**：所有插件都应继承CanvasPlugin基类
2. **实现必要方法**：根据插件需求实现相应的生命周期方法
3. **错误处理**：在插件方法中添加适当的错误处理
4. **资源管理**：在destroy方法中正确释放资源

### 管理器开发

1. **单一职责**：每个管理器应只负责一个特定领域
2. **接口清晰**：提供明确的公共接口
3. **低耦合**：管理器之间应尽量减少直接依赖

### 工具函数开发

1. **单一职责**：每个函数应只负责一个功能
2. **无副作用**：函数应尽量避免副作用，便于测试
3. **良好命名**：函数名应清晰表达其功能

### 代码维护

1. **定期重构**：定期检查和重构重复代码
2. **文档更新**：及时更新相关文档
3. **测试覆盖**：为关键功能编写测试用例