/* wrapper: generate the related code, then use `mp_js_do_str` to excute them. */
import { mp_js_do_str } from './micropython.js';

import { template_py_create, template_py_cb, 
    template_py_setter_simple, template_py_api_simple, 
    template_py_styles, template_py_attrs, } from './runtimeTemplatePython.js';

import { template_py_timeline, template_py_timeline_delete_all } from './runtimeTemplatePython.js';

// id = expr
export const wrap_equal = (id, expr) => {
    mp_js_do_str(`${id}=${expr}`);
}

export const wrap_create_v2 = (node, query_attr = true) => {
    wrap_create(node.id, node.parent, node.type, query_attr);
}

export const wrap_create = (id, parent_id, type_s, query_attr = true) => {

    //     id + "=lv." + type_s + "(" + parent_id + ")",
    //     id + ".set_drag(1)",
    //     id + ".set_protect(lv.PROTECT.PRESS_LOST)",
    //     "query_attr(" + id + ",\'" + id + "\',\'" + type_s + "\')",
    //     id + ".set_event_cb(lambda obj=" + id + ",event=-1,name=\'" + id + "\':walv_callback(obj,name,event))",

    let init_w = 80
    let init_h = 60
    let code = '';
    if(type_s == 'msgbox') {
        code = [
            `btns = ["Apply", "Close", ""]`,
            `${id}=lv.${type_s}(${parent_id},"Hello", "This is a message box with two buttons.", btns, True)`,
            `${id}.add_flag(lv.obj.FLAG.CLICKABLE)`,
            `${id}.add_event_cb(lambda e: walv_callback(e,${id},"${id}"),lv.EVENT.PRESSING, None)`,
            `${id}.add_event_cb(lambda e: walv_callback(e,${id},"${id}"),lv.EVENT.PRESSED, None)`,
        ];
    } else if (type_s == 'img') {
        code = [
            `${id}=lv.${type_s}(${parent_id})`,
            `style = lv.style_t()`,
            `style.init()`,
            `style.set_width(${init_w})`,
            `style.set_height(${init_h})`,
            `style.set_outline_width(1)`,
            `style.set_outline_color(lv.palette_main(lv.PALETTE.BLUE))`,
            `${id}.add_style(style, 0)`,
            `${id}.add_flag(lv.obj.FLAG.CLICKABLE)`,
            `${id}.add_event_cb(lambda e: walv_callback(e,${id},"${id}"),lv.EVENT.PRESSING, None)`,
            `${id}.add_event_cb(lambda e: walv_callback(e,${id},"${id}"),lv.EVENT.PRESSED, None)`,
        ];
    } else {
        code = [
            `${id}=lv.${type_s}(${parent_id})`,
            `${id}.add_flag(lv.obj.FLAG.CLICKABLE)`,
            // `${id}.set_width(${init_w})`,
            // `${id}.set_height(${init_h})`,
            `${id}.add_event_cb(lambda e: walv_callback(e,${id},"${id}"),lv.EVENT.PRESSING, None)`,
            `${id}.add_event_cb(lambda e: walv_callback(e,${id},"${id}"),lv.EVENT.PRESSED, None)`,
        ];
    }

    const ComplexWidgets = ['ddlist', 'page', 'roller'];
    if (ComplexWidgets.indexOf(type_s) != -1) {
        code.push(`${id}.get_child(None).set_drag_parent(True)`);
    }

    // console.log('mp_js_do_str', code.join('\n'));
    mp_js_do_str(code.join('\n'));
    // mp_js_do_str("print('ssss', lv.spinner)");
    // mp_js_do_str("print('ssss2', lv.spinner(objb))");


    if (query_attr) {
        setTimeout(() => {
            mp_js_do_str(`query_attr(${id},"${id}","${type_s}")`);
        }, 200);
    }
}

export const wrap_delete = (id) => {
    mp_js_do_str(`${id}.delete()`);
}

export const wrap_show = (id) => {
    mp_js_do_str(`${id}.clear_flag(1)`);
}

export const wrap_set_index = (id, index) => {
    mp_js_do_str(`${id}.move_to_index(${index})`);
}

export const wrap_hide = (id) => {
    mp_js_do_str(`${id}.add_flag(1)`);
}

export const wrap_query_attr = (id, type_s) => {
    mp_js_do_str(`query_attr(${id},"${id}","${type_s}")`);
}

export const wrap_simple_setter = (id, attr, param) => {
    mp_js_do_str(`${id}.set_${attr}(${param})`);
}

// Convert '#ffffff' to '0xffffff'
export const color_convert = (color) => {
    return color.replace("#", "0x")
}

export const wrap_rename = (id, newid) => {
    mp_js_do_str(`${newid} = ${id}`);
}

export const wrap_setter = (id, type, name, params, database) => {
    // params is a list
    let api = database[type][name]['api']; // "fit": {"return_type": "NoneType", "args": [{"type": "object", "name": "cont"}, {"type": "int", "name": "fit"}], "type": "function", "api": "set_fit"}
    let args = database[type][name]['args'];
    let code = `${id}.${api}(${params.toString()})`;
    mp_js_do_str(code);
}

export const wrap_align = (id, ref_id, offset_x, offset_y) => {
    mp_js_do_str(`${id}.align(${ref_id}, ${offset_x}, ${offset_y})`);
}

export const wrap_setter_str = (id, api, params) => {
    // params is a string
    let code = template_py_api_simple(id, api, params);
    // let code = `${id}.${api}(${params})`;
    mp_js_do_str(code);
}

export const wrap_style_setter_str = (id, infpool, widgpool) => {
    // params is a string
    let code = [
        `${id}_style = lv.style_t()`,
        `${id}_style.init()`
    ];

    for (let api of infpool[id].styles) {
        let param = widgpool[id][api];
        if (param) {
            let paramCode = `${param}`;
            if (api.includes('_color')) {
                let hexColor = color_convert(param);
                paramCode = `lv.color_hex(${hexColor})`;
            }
            code.push(`${id}_style.set_${api}(${paramCode})`);
        }
    }
    code.push(`${id}.add_style(${id}_style, 0)`);
    mp_js_do_str(code.join('\n'));
}

export const wrap_style_setter_v2 = (node) => {
    let code = template_py_styles(node);
    // console.log('wrap_style_setter_v2', code);
    return mp_js_do_str(code);
}

export const wrap_attr_setter_v2 = (node) => {
    let code = template_py_attrs(node);
    // console.log('wrap_attr_setter_v2', code);
    mp_js_do_str(code);
}

export const wrap_attributes_setter_str = (id, infpool, widgpool) => {
    let code = [];
    for (const attr of infpool[id].attributes) {
        if (!widgpool[id]) {
            continue;
        }
        let value = widgpool[id][attr];
        if (value === true) {
            value = "True";
        } else if (value === false) {
            value = "False";
        }
        code.push(template_py_setter_simple(id, attr, value));
    }
    mp_js_do_str(code.join('\n'));
}

export const wrap_apis_setter_str = (id, infpool, widgpool) => {
    let code = [];
    for (const api of infpool[id].apis) {
        let value = widgpool[id][api];
        if (value === true) {
            value = "True";
        } else if (value === false) {
            value = "False";
        }
        code.push(template_py_api_simple(id, api, value));
    }
    mp_js_do_str(code.join('\n'));
}

export const wrap_simple_style = (id, style) => {
    let s = style.text;
    let code = [
        "s=lv.style_t(lv.style_plain)"
    ];
    let c = color_convert(s.color);
    code.push(`s.text.font=lv.${s.font}`);
    code.push(`s.text.color=lv.color_hex(${c})`);
    code.push(`${id}.set_style(lv.label.STYLE.MAIN,s)`);
    mp_js_do_str(code.join('\n'));
}

export const wrap_timeline_load = (timelines) => {
    for (let timeline of timelines) {
        let code = template_py_timeline(timeline);
        // console.log('wrap_timeline_load', code);
        mp_js_do_str(code);
    }
}

export const wrap_timeline_stop_all = () => {
    let code = template_py_timeline_delete_all();
    mp_js_do_str(code);
}

export const wrap_timeline_start = (id) => {
    let code = [];
    let timelineid = `${id}_anim_timeline`;
    code.push(`lv.anim_timeline_start(${timelineid})`);
    mp_js_do_str(code.join('\n'));
}
export const wrap_timeline_pause = (id) => {
    let code = [];
    let timelineid = `${id}_anim_timeline`;
    code.push(`lv.anim_timeline_stop(${timelineid})`);
    mp_js_do_str(code.join('\n'));
}
export const wrap_timeline_progress = (id, v) => {
    let code = [];
    let timelineid = `${id}_anim_timeline`;
    code.push(`lv.anim_timeline_set_progress(${timelineid}, ${v})`);
    mp_js_do_str(code.join('\n'));
}
