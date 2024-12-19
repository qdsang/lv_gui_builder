
import * as api from './widgetApis.js';
import { style_setter } from './widgetStyles.js';

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
  animimg: { group: '' },
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
for (let key in api.setter) {
  let item = widgetMap[key];
  let group = groupMap[item.group];
  if (!group) {
    group = groupMap['other'];
  }

  item.parts = item.parts || ['MAIN'];
  item.attrs = api.setter[key];
  item.styles = style_setter[key];

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

//get Base/Other categorize obj's apis
for (let objKey in style_setter) {
  let styleApis = style_setter[objKey];
  let groupMap = {arc: [], bg: []};
  let baseApiObjArray = [];
  let otherApiObjArray = [];
  for (let apiKey in styleApis) {
    let inFilterOut = filterOutStyle.indexOf(apiKey) != -1;
    if (inFilterOut) {
      continue;
    }
    let apiObj = styleApis[apiKey];
    if (apiObj.api.indexOf('arc_') == 0) {
      groupMap['arc'].push(apiObj);
    } else if (apiObj.api.indexOf('bg_') == 0) {
        groupMap['bg'].push(apiObj);
    } else if (apiObj.categorize == Categorize.Base) {
      baseApiObjArray.push(apiObj);
    } else if (apiObj.categorize == Categorize.Other) {
      otherApiObjArray.push(apiObj);
    }
  }
  let node = widgetMap[objKey];
  baseApiObjArray.sort((a, b) => a.api - b.api);

  node.styleGroups = [
    {
      id: 'base',
      title: 'Base',
      list: baseApiObjArray,
    },
    {
      id: 'bg',
      title: 'Background',
      list: groupMap['bg'],
    },
    {
      id: 'arc',
      title: 'ARC',
      list: groupMap['arc'],
    },
    {
      id: 'other',
      title: 'Other',
      list: otherApiObjArray,
    },
  ];
}

export function getWidget(type) {
  return widgetMap[type];
}

export let fonts = [
  { label: '14', value: 'lv.font_montserrat_14' },
  { label: '16', value: 'lv.font_montserrat_16' },
  { label: '20', value: 'lv.font_montserrat_20' },
  { label: '32', value: 'lv.font_montserrat_32' },
  { label: '40', value: 'lv.font_montserrat_40' },
  { label: '48', value: 'lv.font_montserrat_48' },
]

export let predefineColors = [
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

export let imageLibrary = [
  { imageid: 'demo-arctic-code.jpg', title: 'arctic code', path: 'https://qdsang.github.io/lv_gui_builder/demo-arctic-code.jpg', size: 1000, width: 800, height: 800, data: '' },
  { imageid: 'demo-pull-shark.jpg', title: 'pull shark', path: 'https://qdsang.github.io/lv_gui_builder/demo-pull-shark.jpg', size: 1000, width: 800, height: 800, data: '' },
  { imageid: 'demo-starstruck.jpg', title: 'starstruck', path: 'https://qdsang.github.io/lv_gui_builder/demo-starstruck.jpg', size: 1000, width: 800, height: 800, data: '' },
]

let imageJson = localStorage.getItem("lvgl_image");
if (imageJson) {
  imageLibrary = JSON.parse(imageJson);
}

export function imageLibrarySave() {
  localStorage.setItem("lvgl_image", JSON.stringify(imageLibrary));
}

export function imageLibraryOption() {
  return imageLibrary;
}

export function imageLibraryGet(id) {
  for (let i = 0; i < imageLibrary.length; i++) {
    if (imageLibrary[i].imageid == id) {
      return imageLibrary[i];
    }
  }
  return null;
}



export let timeline_anim_def = { objs: [], start_time: 0, valueMin: 0, valueMax: 100, time: 1000, playback_delay: 100, playback_time: 300, repeat_delay: 500, repeat_count: -1, path_cb: '', custom_exec_cb: '' };
export let timeline_obj_def = { id: 'arc_0', attr: 'value' };
export let timeline_def = { id: 'timeline1', title: '', anims: [ timeline_anim_def ]};









//The Python code to Initialize the environment
export const EnvInitCode = (width, height) => [
  `
import ujson
import lvgl as lv
lv.init()
import SDL


print('boot init')
WIDTH = ${width}
HEIGHT = ${height}
ZOOM = 0
FULLSCREEN = False

SDL.init(w=WIDTH, h=HEIGHT,fullscreen=FULLSCREEN, auto_refresh=False)
# Register SDL display driver.
disp_buf1 = lv.disp_draw_buf_t()
print('SDL init')

buf1_1 = bytes(WIDTH*10)
disp_buf1.init(buf1_1, None, len(buf1_1)//4)
disp_drv = lv.disp_drv_t()
disp_drv.init()
disp_drv.draw_buf = disp_buf1
disp_drv.flush_cb = SDL.monitor_flush
disp_drv.hor_res = WIDTH
disp_drv.ver_res = HEIGHT
disp_drv.register()
print('disp_drv init')

# Regsiter SDL mouse driver
indev_drv = lv.indev_drv_t()
indev_drv.init()
indev_drv.type = lv.INDEV_TYPE.POINTER
indev_drv.read_cb = SDL.mouse_read
indev_drv.register()
print('indev_drv init')

# Create a screen with a button and a label
screen = lv.obj()

screen.set_scrollbar_mode(lv.SCROLLBAR_MODE.OFF)  # 禁用滚动条
screen.clear_flag(lv.obj.FLAG.SCROLLABLE)         # 禁用滚动功能

# Load the screen
lv.scr_load(screen)
baseAttr = dir(lv.obj)

print('boot ok')
`,
];

/* Define special function for python*/

// old getobjattr() function:
// "def getobjattr(obj,id,type_s):",
// "    d={}",
// "    d['id']=id",
// "    for i in dir(obj):",
// "        if 'get_' in i:",
// "            try:",
// "                ret = eval(id + '.' + i + '()')",
// "                if isinstance(ret, (int,float,str,bool)):",
// "                    d[i] = ret",
// "            except:",
// "                pass",
// "    for i in ATTR:",
// "        d[i]=eval(id+'.'+ATTR[i]+'()')",
// "    print('\x06'+ujson.dumps(d)+'\x15')",

export const QueryCode = [
  //Get and send JSON format text
  'def query_attr(obj,id,type_s):',
  "    d={}",
  "    for i in ATTR['obj']:",
  "        d[i]=eval(id+'.'+ATTR['obj'][i]+'()')",
  "    d2 = {'action':'query_attr', 'id': id, 'data': d}",
  "    print('\x06'+ujson.dumps(d2)+'\x15')",
  "",
  'def query_xy(obj,id):',
  "    d={'x': obj.get_x(),'y': obj.get_y()}",
  '    indev = lv.indev_get_act()',
  '    vect = lv.point_t()',
  '    indev.get_vect(vect)',
  '    x = obj.get_x() + vect.x',
  '    y = obj.get_y() + vect.y',
  '    obj.set_pos(x, y)',
  "    d2 = {'action':'query_xy', 'id': id, 'data': d}",
  "    print('\x06'+ujson.dumps(d2)+'\x15')",
  "",
  //Callback: only for the lv.EVENT.DRAG_END
  'def walv_callback(event,obj,id):',
  '    code = event.get_code()',
  '    query_xy(obj, id)',
  '    if(code == lv.EVENT.PRESSED):',
  '       query_attr(obj,id,0)',
];

export const Getter = {
  obj: {
    x: 'get_x',
    y: 'get_y',
    width: 'get_width',
    height: 'get_height',
  },

  label: {
    label: 'get_text',
  },
  img: {
    label: 'get_src',
  },
};

export const Setter = {
  obj: {
    x: 'set_x',
    y: 'set_y',
    width: 'set_width',
    height: 'set_height',
    drag: 'set_drag',
    click: 'set_click',
    hidden: 'set_hidden',
    top: 'set_top',
  },
  btn: {
    state: 'set_state',
    toggle: 'set_toggle',
    ink_wait_time: 'set_ink_wait_time',
    ink_in_time: 'set_ink_in_time',
  },
  label: {
    text: 'set_text',
  },
  led: {},
};
