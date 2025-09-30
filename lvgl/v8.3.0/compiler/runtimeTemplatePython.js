/* template: generate the related code and return as string */
import { color_convert } from './runtimeWrapper.js';
// import * as WidgetData from "./widgetData.js";
import assets from '../assets.js';

export const template_py_create = (id, parent_id, type) => {
    return `${id} = lv.${type}(${parent_id})`;
}

export const template_py_setter_number = (id, attr, param) => {
    return `${id}.set_${attr}(${param})`;
}

export const template_py_setter_boolean = (id, attr, param) => {
    let value = "True";
    if (param == false) {
        value = "False";
    }
    return `${id}.set_${attr}(${value})`;
}

export const template_py_setter_text = (id, attr, param) => {
    return `${id}.set_${attr}("${param}")`;
}

export const template_py_setter_simple = (id, attr, param) => {
    return `${id}.set_${attr}(${param})`;
}

export const template_py_api_simple = (id, api, param) => {
    if (api === "set_src") {
        return template_py_img_api(id, api, param);
    } else if (api.includes('_color')) {
        let hexColor = color_convert(param);
        param = `lv.color_hex(${hexColor})`;
    }
    return `${id}.${api}(${param})`;
}

export const template_py_style_simple = (id, styleApi, param) => {
    let paramCode = '';
    if (styleApi.includes('_color')) {
        let hexColor = color_convert(param);
        paramCode = `lv.color_hex(${hexColor})`;
    } else {
        paramCode = param;
    }
    return `${id}_style.set_${styleApi}(${paramCode})`;
}

function GenNonDuplicateID(){
    let idStr = Date.now().toString(36)
    idStr += Math.random().toString(36).substring(2)
    return idStr
}

function removeBase64Prefix(base64Str) {
    if (base64Str.startsWith('data:')) {
        const base64Index = base64Str.indexOf('base64,');
        if (base64Index !== -1) {
            return base64Str.substring(base64Index + 7);
        }
    }
    return base64Str;
}
function GenImageCode(url){
    let imgId = 'i' + GenNonDuplicateID().substring(0, 10);
    let code = [
`
#print("img start")
img_data = None
${imgId} = None
`];

    let img = assets.get(url);
    if (img) {
        let base64 = removeBase64Prefix(img.content)
        // let base64str = 'bytes([' + base64.join(', ') + '])'
code.push(`
import ubinascii

try:
    img_str = "${base64}"
    img_data = ubinascii.a2b_base64(img_str)
except:
    print("Could not img base64 ${url}")
`);
    } else {
code.push(`
try:
    with open('${url}','rb') as f:
        img_data = f.read()
        #print(type(img_data))
except:
    print("Could not find ${url}")
    # sys.exit()
`);
    }

code.push(`
#print("img ${url} size: " + str(len(img_data)))

if img_data:
    ${imgId} = lv.img_dsc_t({
        'data_size': len(img_data),
        'data': img_data
    })

#print("img ok")
`);
// console.log(code.join('\n'));
    return {imgId, code: code.join('\n')};
}

export const template_py_img_api = (id, api, param)=>{
    let code = [];
    let img = GenImageCode(param);
    code.push(img.code);
    code.push(`${id}.set_src(${img.imgId})`);
    return code.join('\n');
}


export const template_py_styles = (node)=>{
    let id = node.id;
    
    var partGroup = {};
    for (let api of node.styles) {
        let api2 = api.split('.');
        let part = 'MAIN';
        let key = api;
        if (api2.length == 2) {
            part = api2[0];
            key = api2[1];
        }
        if (!partGroup[part]) {
            partGroup[part] = [];
        }
        partGroup[part].push(key);
    }

    let code = [];
    // code.push(`${id}.remove_style_all()`);

    for (let part in partGroup) {
        let styleid = `${id}_style_${part}`;
        code.push(``);
        code.push(`${styleid} = lv.style_t()`);
        code.push(`${styleid}.init()`);

        let styles = partGroup[part];
        for (let api of styles) {
            let param = node.data[part+ '.' + api];
            if (param) {
                let paramCode = `${param}`;
                if (api.includes('_color')) {
                    let hexColor = color_convert(param);
                    paramCode = `lv.color_hex(${hexColor})`;
                } else if (api.includes('_src')) {
                    let img = GenImageCode(param);
                    code.push(img.code);
                    paramCode = img.imgId;
                }
                code.push(`${styleid}.set_${api}(${paramCode})`);
            }
        }
        
        let partStr = 'lv.PART.' + part;
        code.push(`${id}.add_style(${styleid}, ${partStr})`);
    }

    return code.join('\n');
}


export const template_py_attrs = (node)=>{
    let id = node.id;
    
    let code = [];
    for (const api of node.attributes) {
        let value = node.data[api];
        if (value === true) {
            value = "True";
        } else if (value === false) {
            value = "False";
        }
        code.push(template_py_api_simple(id, 'set_' + api, value));
    }

    for (const api of node.apis) {
        let value = node.data[api];
        if (value === true) {
            value = "True";
        } else if (value === false) {
            value = "False";
        }
        code.push(template_py_api_simple(id, api, value));
    }

    return code.join('\n');
}

export const template_py_cb = (id) => {
    return `${id}.set_event_cb(lambda : ) #Put your code here`
}

let timelines = [];
export const template_py_timeline = (timeline)=>{
    let code = [];
    let timelineid = `${timeline.id}_anim_timeline`;
code.push(`${timelineid} = lv.anim_timeline_create()`);

for (let i in timeline.anims) {
    let v = timeline.anims[i];
    let id = timeline.id + '_' + (i);

code.push(`def anim_${id}_cb(v):`);
for (let obj of v.objs) {
    code.push(`    ${obj.id}.set_${obj.attr}(v)`);
}
code.push(``);

// a1.set_repeat_count(lv.ANIM_REPEAT.INFINITE)
let path_cb = 'lv.anim_t.path_ease_in_out';
code.push(`
${id} = lv.anim_t()
${id}.init()
#${id}.set_var(objid)
${id}.set_values(${v.valueMin}, ${v.valueMax})
${id}.set_time(${v.time})
${id}.set_playback_delay(${v.playback_delay})
${id}.set_playback_time(${v.playback_time})
${id}.set_repeat_delay(${v.repeat_delay})
${id}.set_repeat_count(${v.repeat_count})
${id}.set_path_cb(${path_cb})
${id}.set_custom_exec_cb(lambda ${id},val: anim_${id}_cb(val))

lv.anim_timeline_add(${timelineid}, ${v.start_time}, ${id})

`);
}

code.push(`#lv.anim_timeline_start(${timelineid})`);

timelines.push(timelineid);

    return code.join('\n');
}

export const template_py_timeline_delete_all = ()=>{
let code = [];
for (let i=0; i<timelines.length; i++) {
    let v = timelines[i];
code.push(`
try:
    lv.anim_timeline_pause(${v})
    lv.anim_timeline_delete(${v})
except Exception as err:
    pass
    #print(f"Unexpected {err=}, {type(err)=}")
`);
}
timelines = [];
return code.join('\n');
}

// if (id.indexOf('arc_') == 0) {
// code.push(`

// def anim_size_cb(obj, v):
//     obj.set_value(v)

// a1 = lv.anim_t()
// a1.init()
// a1.set_var(${id})
// a1.set_values(10, 80)
// a1.set_time(1000)
// a1.set_playback_delay(100)
// a1.set_playback_time(300)
// a1.set_repeat_delay(300)
// a1.set_repeat_count(lv.ANIM_REPEAT.INFINITE)
// a1.set_repeat_count(999)
// a1.set_path_cb(lv.anim_t.path_overshoot)
// a1.set_custom_exec_cb(lambda a1,val: anim_size_cb(${id}, val))
// # lv.anim_t.start(a1)

// anim_timeline = lv.anim_timeline_create()
// lv.anim_timeline_add(anim_timeline, 0, a1)

// lv.anim_timeline_start(anim_timeline)

// try:
//     pass
// except Exception as err:
//     print(f"Unexpected {err=}, {type(err)=}")


// `);
// }
