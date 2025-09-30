# Generate the setter table for objects
# https://github.com/littlevgl/lv_gui_builder/issues/1#issuecomment-528845543
# Parse the lv_mpy.json(example: https://raw.githubusercontent.com/littlevgl/lv_binding_micropython/master/gen/lv_mpy_example.json)

import json

Setter = {}
path = './lv_micropython/lib/lv_bindings/gen/lv_mpy_example.json'  # Path to lv_mpy_example.json

with open(path) as f:
    data = json.load(f)
    objs = data['objects']
    for o in objs:
        # print(o)
        tmp = {}
        for fn in objs[o]['members'].keys():
            if fn.startswith('set_') and fn not in objs['obj']['members'].keys():
                name = fn.replace('set_', '')
                tmp[name] = objs[o]['members'][fn]
                tmp[name]['api'] = fn
                del tmp[name]['args'][0]    # The first argument is about type
        Setter[o] = tmp
    # del Setter['obj']

# We also need to add 'null:{}' in apis.js
f = open('widget_apis.js', 'w')
f.write("const setter = ");
json.dump(Setter, f)
f.close()

# input type: 0:input 1:color_selector 3:options select
# must same as constant.js InputType
def get_style_input_type(func_name):
    dist = {
        "set_style_text_font":3,
        "set_style_text_color":1,
        }
    if func_name not in dist:
        return 0
    for item, value in dist.items():
        if func_name == item:
            return value
    return 0

def get_style_desc(func_name):
    dist = {
        "set_style_bg_color": "background color",
        "set_style_bg_img_src": "background image",
        "set_style_text_font": "text font",
        "set_style_text_color": "text color",
    }
    if func_name not in dist:
        return ""
    for item, value in dist.items():
        if func_name == item:
            return value
    return ""

# categorize: 0:other 1:base
# must same as constant.js Categorize
def get_style_categorize(func_name):
    dist = {
        "set_style_bg_color":1,
        "set_style_bg_img_src":1,
        "set_style_text_font":1,
        "set_style_text_color":1,
        }
    if func_name not in dist:
        return 0
    for item, value in dist.items():
        if func_name == item:
            return value
    return 0

with open(path) as f:
    data = json.load(f)
    objs = data['objects']
    for o in objs:
        # print(o)
        tmp = {}
        for fn in objs[o]['members'].keys():
            if fn.startswith('set_style_'):
                name = fn.replace('set_style_', '')
                tmp[name] = objs[o]['members'][fn]
                tmp[name]['api'] = name
                tmp[name]['categorize'] = get_style_categorize(fn)
                tmp[name]['desc'] = get_style_desc(fn)
                tmp[name]['input_type'] = get_style_input_type(fn)
                del tmp[name]['args'][2]    # The argument is about selector
                del tmp[name]['args'][0]    # The first argument is about type
        Setter[o] = tmp
# We also need to add 'null:{}' in apis.js
f = open('widget_styles.js', 'w')
f.write("const style_setter = ")
json.dump(Setter, f)
f.close()
