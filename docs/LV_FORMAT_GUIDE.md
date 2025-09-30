# LVGL GUI Builder LV文件格式指南
Version: 1.0.0

## 1. 概述

LV文件(.lv)是LVGL GUI Builder项目使用的GUI描述文件格式。它采用类似Vue单文件组件的结构，用于描述LVGL图形界面的完整布局、样式、动画和资源信息。本指南将详细说明LV文件的格式规范，以指导LVGL项目的开发。

## 2. 文件基本结构

LV文件采用类似Vue单文件组件的结构，包含以下三个主要部分:

```html
<template>
  <!-- 组件定义 -->
</template>
<style>
  /* 样式定义 */
</style>
<script>
  /* 项目数据 */
</script>
```

### 2.1 Template部分

Template部分包含组件的层级结构定义，使用嵌套的XML标签表示组件的父子关系。

### 2.2 Style部分

Style部分包含所有组件的样式定义，使用类似CSS的语法。

### 2.3 Script部分

Script部分包含项目数据，包括动画、资源和设置等信息，使用ES6模块语法导出。

## 3. Template部分(components)

### 3.1 组件基本结构

每个组件都遵循以下统一结构:

```html
<组件类型 id="组件ID" x="X坐标" y="Y坐标" width="宽度" height="高度" zindex="层级" 其他属性></组件类型>
```

### 3.2 组件嵌套关系

组件通过嵌套结构表示父子关系，父组件包含子组件:

```html
<screen id="screen" x="0" y="0" width="480" height="480" zindex="0">
  <arc id="arc_0" x="40" y="40" width="200" height="200" zindex="1"></arc>
</screen>
```

### 3.3 核心组件类型

- screen: 屏幕容器组件
- obj: 基础对象组件
- arc: 圆弧组件
- bar: 进度条组件
- btn: 按钮组件
- btnmatrix: 按钮矩阵组件
- calendar: 日历组件
- canvas: 画布组件
- chart: 图表组件
- checkbox: 复选框组件
- colorwheel: 颜色选择器组件
- dropdown: 下拉菜单组件
- img: 图片组件
- imgbtn: 图片按钮组件
- keyboard: 键盘组件
- label: 文本标签组件
- led: LED指示器组件
- line: 线条组件
- list: 列表组件
- menu: 菜单组件
- meter: 仪表组件
- msgbox: 消息框组件
- roller: 滚轮选择器组件
- slider: 滑块组件
- spinbox: 数字输入框组件
- spinner: 加载动画组件
- switch: 开关组件
- table: 表格组件
- tabview: 标签页组件
- textarea: 文本区域组件
- tileview: 平铺视图组件
- win: 窗口组件

### 3.4 组件示例

#### 3.4.1 Screen组件
屏幕组件是所有其他组件的根容器:

```html
<screen id="screen" x="0" y="0" width="480" height="480" zindex="0"></screen>
```

#### 3.4.2 Arc组件
圆弧组件用于显示进度或仪表盘:

```html
<arc id="arc_0" x="40" y="40" width="200" height="200" 
     set_start_angle="135" set_end_angle="45" 
     set_bg_start_angle="135" set_bg_end_angle="45" 
     set_value="60" zindex="1"></arc>
```

## 4. Style部分

### 4.1 样式结构

样式部分使用类似CSS的语法定义组件样式:

```css
#组件ID {
  样式属性: 值;
}

#组件ID::部分 {
  样式属性: 值;
}
```

### 4.2 样式部分前缀

- main: 主要样式部分（默认部分，可省略::main）
- indicator: 指示器样式部分
- knob: 旋钮样式部分
- scrollbar: 滚动条样式部分
- pressed: 按下状态样式部分
- checked: 选中状态样式部分
- focused: 焦点状态样式部分
- edited: 编辑状态样式部分
- hovered: 悬停状态样式部分
- disabled: 禁用状态样式部分

### 4.3 样式示例

```css
#screen {
  bg-color: #000000;
}

#arc_0 {
  start-angle: 135;
  end-angle: 45;
  bg-start-angle: 135;
  bg-end-angle: 45;
  value: 60;
}

#arc_0::indicator {
  arc-width: 22;
  text-font: lv.font_montserrat_16;
  arc-color: #589EF8;
  arc-rounded: False;
}

#arc_0::knob {
  bg-opa: 0;
}
```

## 5. Script部分

### 5.1 数据结构

Script部分使用ES6模块语法导出多个变量:

```javascript
const project = {
  // 项目基本信息
};

const animations = {
  // 动画数据
};

const assets = {
  // 资源数据
};

const settings = {
  // 设置数据
};

export { project, animations, assets, settings };
```

### 5.2 Project数据

```javascript
const project = {
  "id": string,          // 项目唯一标识符
  "name": string,        // 项目名称
  "description": string, // 项目描述
  "version": string,     // 项目版本号,如"1.0.0"
  "versionCode": number, // 版本代码,如1
  "author": string       // 作者信息
};
```

### 5.3 Animations数据

动画系统由时间线(timelines)和序列(sequences)组成:

```javascript
const animations = {
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
};
```

### 5.4 Assets数据

#### 5.4.1 图片资源

```javascript
const assets = {
  "images": [
    {
      "id": string,    // 图片ID
      "title": string,      // 图片标题
      "path": string,       // 图片路径
      "size": number,       // 文件大小
      "width": number,      // 图片宽度
      "height": number,     // 图片高度
      "base64": string       // 图片数据
    }
  ]
};
```

#### 5.4.2 字体资源

```javascript
const assets = {
  "fonts": [
    {
      "id": string,        // 字体ID
      "name": string,      // 字体名称
      "path": string       // 字体路径
    }
  ]
};
```

### 5.5 Settings数据

```javascript
const settings = {
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
};
```

## 6. 样式系统

### 6.1 常用样式属性

#### 背景相关
- bg-color: 背景颜色
- bg-opa: 背景透明度
- bg-grad-color: 背景渐变颜色
- bg-grad-dir: 背景渐变方向
- bg-main-stop: 背景渐变起始位置
- bg-grad-stop: 背景渐变结束位置
- bg-img-src: 背景图片源
- bg-img-opa: 背景图片透明度
- bg-img-recolor: 背景图片重新着色
- bg-img-recolor-opa: 背景图片重新着色透明度

#### 边框相关
- border-color: 边框颜色
- border-opa: 边框透明度
- border-width: 边框宽度
- border-side: 边框显示的边
- border-post: 边框位置

#### 文本相关
- text-color: 文本颜色
- text-opa: 文本透明度
- text-font: 文本字体
- text-letter-space: 字母间距
- text-line-space: 行间距
- text-decor: 文本装饰
- text-align: 文本对齐方式

#### 轮廓相关
- outline-width: 轮廓宽度
- outline-color: 轮廓颜色
- outline-opa: 轮廓透明度
- outline-pad: 轮廓内边距

#### 阴影相关
- shadow-width: 阴影宽度
- shadow-color: 阴影颜色
- shadow-opa: 阴影透明度
- shadow-spread: 阴影扩散
- shadow-ofs-x: 阴影X偏移
- shadow-ofs-y: 阴影Y偏移

#### 填充相关
- pad-top: 顶部内边距
- pad-bottom: 底部内边距
- pad-left: 左侧内边距
- pad-right: 右侧内边距
- pad-row: 行间内边距
- pad-column: 列间内边距

#### 其他
- radius: 圆角半径
- clip-corner: 裁剪圆角
- opa: 整体透明度
- color-filter-dsc: 颜色过滤器描述
- color-filter-opa: 颜色过滤器透明度
- anim-time: 动画时间
- anim-speed: 动画速度
- blend-mode: 混合模式
- layout: 布局方式
- base-dir: 基准方向

## 7. 注意事项

1. 组件ID必须在项目中唯一
2. 颜色值使用16进制格式(如"#000000")
3. 坐标和尺寸可以使用数字或字符串类型
4. 动画repeat_count为-1时表示无限循环
5. 所有组件必须指定父组件(除screen外)
6. zindex值决定组件的渲染顺序,值越大越靠前
7. 组件通过嵌套结构表示父子关系
8. 样式使用CSS-like语法定义

## 8. 最佳实践

1. 合理使用zindex管理组件层级
2. 使用有意义的组件ID便于维护
3. 将常用样式抽取为主题
4. 合理组织动画时间线
5. 资源文件建议使用相对路径
6. 组件结构应反映真实的UI层级关系
7. 样式应按组件和部分进行组织
8. 脚本数据应按功能拆分为独立变量