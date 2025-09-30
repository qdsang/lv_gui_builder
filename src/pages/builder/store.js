let screenJson = {
  version: '1.0.0',
  versionCode: 1,
  widgets: {
    screen: {
      uuid: '',
      id: 'screen',
      type: 'screen',
      parent: '',
      cb: false,
      attributes: ['x', 'y', 'width', 'height'],
      apis: [],
      styles: ['bg_color'],
      attrs: {},
    },
    arc4: {
      uuid: '',
      id: 'arc4',
      type: 'arc',
      parent: 'screen',
      index: 0,
      cb: false,
      attributes: ['x', 'y', 'width', 'height'],
      apis: [
        'set_start_angle',
        'set_end_angle',
        'set_angles',
        'set_bg_start_angle',
        'set_bg_end_angle',
      ],
      styles: [],
      attrs: {
        x: 358,
        y: 113,
        width: 130,
        height: 130,
        set_start_angle: '90',
        set_end_angle: '180',
        set_angles: '90,180',
        set_bg_start_angle: '90',
        set_bg_end_angle: '180',
      },
    },
  },
  term_visible: false,
  mask: false,
  is_c_mode: true,
};

export function getTreeList() {
  let map = {};
  let widgetTree = [];
  map[''] = widgetTree;
  for (let key of Object.keys(screenJson.widgets)) {
    let node = screenJson.widgets[key];
    let children = {
      id: node.id,
      label: node.id,
      children: [],
    }
    map[node.parent].push(children);
    map[node.id] = children.children;
  }
  return widgetTree;
}

// console.log(getTreeList());
