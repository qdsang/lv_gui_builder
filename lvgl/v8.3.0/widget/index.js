
import { widgetAttrs } from './widgetAttrs.js';
import { widgetStyleSetter } from './widgetStyles.js';

// ELEMENT.locale(ELEMENT.lang.en) //i18n

export const WidgetsOption = [
  {
    value: 'obj',
    label: 'Object',
  },
  {
    value: 'form',
    label: 'Form',
    children: [
      {
        value: 'btn',
        label: 'Button',
      },
      {
        value: 'img',
        label: 'Image',
      },
      {
        value: 'label',
        label: 'Label',
      },
      {
        value: 'switch',
        label: 'Switch',
      },
      {
        value: 'checkbox',
        label: 'Checkbox',
      },
      {
        value: 'dropdown',
        label: 'Drop-Down List',
      },
      {
        value: 'roller',
        label: 'Roller',
      },
      {
        value: 'slider',
        label: 'Slider',
      },
    ],
  },
  {
    value: 'data',
    label: 'Data',
    children: [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'meter',
        label: 'Meter',
      },
      {
        value: 'led',
        label: 'LED',
      },
      {
        value: 'chart',
        label: 'Chart',
      },
      {
        value: 'arc',
        label: 'Arc',
      },
      {
        value: 'calendar',
        label: 'Calendar',
      },
    ],
  },
  {
    value: 'layer',
    label: 'Layer',
    children: [
      {
        value: 'msgbox',
        label: 'Message box',
      },
    ],
  },
];


let widgetMap = {
  animimg: { group: '', iconUrl: '/icon_404.png' },
  arc: { group: 'basics', parts: ['MAIN', 'INDICATOR', 'KNOB'] },
  bar: { group: 'visualiser' },
  btn: { group: 'basics', img: 'button' },
  btnmatrix: { group: '' },
  button: { group: 'basics' },
  calendar: { group: 'controller' },
  calendar_header_arrow: { group: '' },
  calendar_header_dropdown: { group: '' },
  canvas: { group: '' },
  chart: { group: 'visualiser' },
  checkbox: { group: 'controller' },
  colorwheel: { group: 'controller' },
  dropdown: { group: 'controller' },
  gif: { group: '' },
  image: { group: 'basics' },
  img: { group: 'basics', img: 'image' },
  imgbtn: { group: '' },
  imgbutton: { group: 'controller' },
  keyboard: { group: 'controller' },
  label: { group: 'basics' },
  led: { group: '' },
  line: { group: '' },
  list: { group: '' },
  menu: { group: '' },
  menu_cont: { group: '' },
  menu_page: { group: '' },
  menu_section: { group: '' },
  menu_separator: { group: '' },
  meter: { group: '' },
  msgbox: { group: '' },
  obj: { group: 'basics', img: 'panel' },
  object: { group: 'basics' },
  panel: { group: 'basics' },
  qrcode: { group: '' },
  roller: { group: 'controller' },
  screen: { group: '' },
  slider: { group: 'controller', parts: ['MAIN', 'INDICATOR', 'KNOB'] },
  spangroup: { group: '' },
  spinbox: { group: 'controller' },
  spinner: { group: 'visualiser' },
  switch: { group: 'controller' },
  table: { group: '' },
  tabpage: { group: 'basics' },
  tabview: { group: 'basics' },
  textarea: { group: 'basics' },
  tileview: { group: '' },
  win: { group: '' },
};

let groupMap = {
  basics: {
    value: 'basics',
    label: 'Basics',
    children: [],
  },
  controller: {
    value: 'controller',
    label: 'Controller',
    children: [],
  },
  visualiser: {
    value: 'visualiser',
    label: 'Visualiser',
    children: [],
  },
  other: {
    value: 'other',
    label: 'Other',
    children: [],
  },
};
for (let key in widgetAttrs) {
  let item = widgetMap[key];
  let group = groupMap[item.group];
  if (!group) {
    group = groupMap['other'];
  }

  item.parts = item.parts || ['MAIN'];
  item.attrs = widgetAttrs[key];
  item.styles = widgetStyleSetter[key];

  group.children.push({ value: key, label: item.name || key, img: item.img || item.name || key });
}
WidgetsOption.splice(0, WidgetsOption.length);
for (let key in groupMap) {
  WidgetsOption.push(groupMap[key]);
}

const Categorize = {
  Other: 0,
  Base: 1,
};

let filterOutStyle = ['x', 'y', 'width', 'height'];
let baseApi = ['min_width', 'min_height', 'max_width', 'max_height', 'align'];

//get Base/Other categorize obj's apis
for (let objKey in widgetStyleSetter) {
  let styleApis = widgetStyleSetter[objKey];
  let groupMap = {base:[], bg: [], border: [], pad: [], arc: [], other: []};

  for (let apiKey in styleApis) {
    let inFilterOut = filterOutStyle.indexOf(apiKey) != -1;
    if (inFilterOut) {
      continue;
    }
    let apiObj = styleApis[apiKey];
    if (apiObj.categorize == Categorize.Base || baseApi.indexOf(apiObj.api) !== -1) {
      groupMap.base.push(apiObj);
    } else if (apiObj.api.indexOf('bg_') == 0) {
      groupMap.bg.push(apiObj);
    } else if (apiObj.api.indexOf('border_') == 0) {
      groupMap.border.push(apiObj);
    } else if (apiObj.api.indexOf('pad_') == 0) {
      groupMap.pad.push(apiObj);
    } else if (apiObj.api.indexOf('arc_') == 0) {
      groupMap.arc.push(apiObj);
    } else if (apiObj.categorize == Categorize.Other) {
      groupMap.other.push(apiObj);
    }
  }
  let node = widgetMap[objKey];
  groupMap.base.sort((a, b) => b.api - a.api);

  node.styleGroups = [
    {
      id: 'base',
      title: 'Base',
      list: groupMap.base,
    },
    {
      id: 'bg',
      title: 'Background',
      list: groupMap.bg,
    },
    {
      id: 'border',
      title: 'Border',
      list: groupMap.border,
    },
    {
      id: 'pad',
      title: 'Pad',
      list: groupMap.pad,
    },
    {
      id: 'arc',
      title: 'ARC',
      list: groupMap.arc,
    },
    {
      id: 'other',
      title: 'Other',
      list: groupMap.other,
    },
  ];
}

export function getWidget(type) {
  return widgetMap[type];
}

export function getWidgetSetter(type) {
  return widgetAttrs[type];
}

export let fonts = [
  { label: '14', value: 'lv.font_montserrat_14' },
  { label: '16', value: 'lv.font_montserrat_16' },
  { label: '20', value: 'lv.font_montserrat_20' },
  { label: '32', value: 'lv.font_montserrat_32' },
  { label: '40', value: 'lv.font_montserrat_40' },
  { label: '48', value: 'lv.font_montserrat_48' },
]

let timeline_anim_def = { objs: [], start_time: 0, valueMin: 0, valueMax: 100, time: 1000, playback_delay: 100, playback_time: 300, repeat_delay: 500, repeat_count: -1, path_cb: '', custom_exec_cb: '' };
let timeline_obj_def = { id: 'arc_0', attr: 'value' };
let timeline_def = { id: 'timeline1', title: '', anims: [ timeline_anim_def ]};

export function createTimeline() {
  return JSON.parse(JSON.stringify(timeline_def));
}

export function createTimelineObj() {
  return JSON.parse(JSON.stringify(timeline_obj_def));
}

export function createTimelineAnim() {
  return JSON.parse(JSON.stringify(timeline_anim_def));
}




// BUG: tmp icon 
export function updateIcon(iconMap) {
  for (let key in widgetMap) {
    let icon = iconMap[key];
    if (icon) {
      widgetMap[key].iconUrl = icon;
    } else {
      widgetMap[key].iconUrl = '/icon_404.png';
      // console.log('updateIcon widgetMap[key]', key)
    }
  }
}

