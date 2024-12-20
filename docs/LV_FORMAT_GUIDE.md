# LVGL GUI Builder LV文件格式指南
Version: 1.0.0

## 1. 概述

LV文件(.lv)是LVGL GUI Builder项目使用的GUI描述文件格式。它采用JSON结构,用于描述LVGL图形界面的完整布局、样式、动画和资源信息。本指南将详细说明LV文件的格式规范,以指导LVGL项目的开发。

## 2. 文件基本结构

LV文件是一个标准的JSON文件,包含以下顶层字段:

```json
{
  "id": string,          // 项目唯一标识符
  "name": string,        // 项目名称
  "description": string, // 项目描述
  "version": string,     // 项目版本号,如"1.0.0"
  "versionCode": number, // 版本代码,如1
  "author": string,      // 作者信息
  "components": object,  // 组件定义
  "animations": object,  // 动画定义
  "assets": object,      // 资源文件
  "settings": object     // 项目设置
}
```

## 3. 组件系统(components)

### 3.1 组件基本结构

每个组件都遵循以下统一结构:

```json
{
  "parent": string,     // 父组件ID,根组件为空字符串
  "id": string,        // 组件唯一标识符
  "type": string,      // 组件类型
  "zindex": number,    // 渲染层级顺序
  "cb": boolean,       // 是否启用回调函数
  "attributes": [      // 基础属性列表
    "x",
    "y", 
    "width",
    "height"
  ],
  "apis": [],          // 组件支持的API列表
  "styles": [],        // 样式属性列表
  "data": {           // 组件具体数据
    "x": number|string,
    "y": number|string,
    "width": number|string,
    "height": number|string,
    // 其他特定属性...
  }
}
```

### 3.2 核心组件类型

- screen: 屏幕容器组件
- obj: 基础对象组件
- arc: 圆弧组件
- label: 文本标签组件
- btn: 按钮组件
- img: 图片组件
- checkbox: 复选框组件
- slider: 滑块组件
- switch: 开关组件
- textarea: 文本区域组件

### 3.3 组件示例

#### 3.3.1 Screen组件
屏幕组件是所有其他组件的根容器:

```json
{
  "parent": "",
  "id": "screen",
  "type": "screen",
  "zindex": 0,
  "cb": false,
  "attributes": ["x", "y", "width", "height"],
  "apis": [],
  "styles": ["MAIN.bg_color"],
  "data": {
    "width": 480,
    "height": 480,
    "x": "0",
    "y": "0",
    "MAIN.bg_img_src": "",
    "MAIN.bg_color": "#000000"
  }
}
```

#### 3.3.2 Arc组件
圆弧组件用于显示进度或仪表盘:

```json
{
  "parent": "screen",
  "id": "arc_0",
  "type": "arc",
  "zindex": 4,
  "cb": false,
  "attributes": ["x", "y", "width", "height"],
  "apis": [
    "set_start_angle",
    "set_end_angle",
    "set_bg_start_angle",
    "set_bg_end_angle",
    "set_value"
  ],
  "styles": [
    "INDICATOR.arc_width",
    "INDICATOR.text_font",
    "KNOB.bg_opa",
    "INDICATOR.arc_rounded",
    "MAIN.arc_width",
    "INDICATOR.arc_color",
    "MAIN.arc_rounded",
    "MAIN.arc_color"
  ],
  "data": {
    "y": 40,
    "x": 40,
    "height": 200,
    "width": 200,
    "set_start_angle": "135",
    "set_end_angle": "45",
    "set_bg_start_angle": "135",
    "set_bg_end_angle": "45",
    "set_value": "60",
    "INDICATOR.arc_width": "22",
    "MAIN.arc_width": "22",
    "INDICATOR.arc_color": "#589EF8",
    "MAIN.arc_color": "#E3E3E3"
  }
}
```

## 4. 动画系统(animations)

### 4.1 动画结构

动画系统由时间线(timelines)和序列(sequences)组成:

```json
{
  "timelines": [
    {
      "id": string,      // 时间线ID
      "title": string,   // 时间线标题
      "anims": [         // 动画数组
        {
          "objs": [      // 动画对象
            {
              "id": string,      // 组件ID
              "attr": string,    // 动画属性
              "iseditor": boolean
            }
          ],
          "start_time": string,     // 开始时间
          "valueMin": number,       // 最小值
          "valueMax": number,       // 最大值
          "time": number,           // 动画时长
          "playback_delay": number, // 回放延迟
          "playback_time": number,  // 回放时长
          "repeat_delay": number,   // 重复延迟
          "repeat_count": number|string // 重复次数,-1表示无限循环
        }
      ]
    }
  ],
  "sequences": []  // 动画序列
}
```

## 5. 资源系统(assets)

### 5.1 图片资源

```json
{
  "images": [
    {
      "id": string,    // 图片ID
      "title": string,      // 图片标题
      "path": string,       // 图片路径
      "size": number,       // 文件大小
      "width": number,      // 图片宽度
      "height": number,     // 图片高度
      "data": string       // 图片数据(可选)
    }
  ]
}
```

### 5.2 字体资源

```json
{
  "fonts": [
    {
      "id": string,        // 字体ID
      "name": string,      // 字体名称
      "path": string       // 字体路径
    }
  ]
}
```

## 6. 项目设置(settings)

```json
{
  "screen": {
    "width": number,     // 屏幕宽度
    "height": number     // 屏幕高度
  },
  "output": {
    "format": string,    // 输出格式(python/c)
    "path": string      // 输出路径
  },
  "lvgl": {
    "version": string,   // LVGL版本
    "colorDepth": number // 颜色深度
  }
}
```

## 7. 样式系统

### 7.1 样式属性前缀

- MAIN: 主要样式
- INDICATOR: 指示器样式
- KNOB: 旋钮样式

### 7.2 常用样式属性

- bg_color: 背景颜色
- text_color: 文本颜色
- text_font: 文本字体
- radius: 圆角半径
- border_width: 边框宽度
- arc_width: 圆弧宽度
- arc_rounded: 圆弧圆角
- arc_color: 圆弧颜色
- bg_opa: 背景透明度

## 8. 注意事项

1. 组件ID必须在项目中唯一
2. 颜色值使用16进制格式(如"#000000")
3. 坐标和尺寸可以使用数字或字符串类型
4. 动画repeat_count为-1时表示无限循环
5. 所有组件必须指定父组件(除screen外)
6. zindex值决定组件的渲染顺序,值越大越靠前

## 9. 最佳实践

1. 合理使用zindex管理组件层级
2. 使用有意义的组件ID便于维护
3. 将常用样式抽取为主题
4. 合理组织动画时间线
5. 资源文件建议使用相对路径 