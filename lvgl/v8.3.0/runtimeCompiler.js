/* generate the C or Python code to a file */
import { template_py_create, template_py_cb, template_py_setter_simple, template_py_api_simple, template_py_style_simple, template_py_styles, template_py_timeline } from './runtimeTemplatePython.js';
import { template_c_create, template_c_setter_simple, template_c_cb, template_c_style_simple, template_c_api_simple, template_c_all, template_c_styles } from './runtimeTemplateC.js';

export function generateCode(lang, screen, actFileName) {
    let code = '';
    if (lang == 'c') {
        code = c_generator(screen, actFileName);
    } else {
        code = python_generator(screen, actFileName);
    }

    return {
        code: code,
        fileName: '',
    }
}

export function python_generator(screen, actFileName) {
    let code = [];
    let info = screen.info;
    code.push('# LVGL Version: v8.3.0');
    code.push(`
# https://sim.lvgl.io/v8.3/micropython/ports/javascript/index.html
#import display_driver
#import lvgl as lv
#screen = lv.obj()
#lv.scr_load(screen)

`);


    for (const key in info) {
        let id = key;
        let data = info[id].data;

        let par_id = info[key].parent;

        let type = info[key].type;

        //screen no need generate create code
        if (type !== 'screen') {
            code.push(template_py_create(id, par_id, type));    //code: create, EX: btn0 = lv.btn(scr)
        }

        if (info[id].cb) {
            code.push(template_py_cb(id));
        }

        //attributes
        const attributes = info[key].attributes;
        for (const attr of attributes) {
            let value = data[attr];
            if (value == true) {
                value = "True";
            } else if (value == false) {
                value = "False";
            }
            code.push(template_py_setter_simple(id, attr, value));
        }

        //apis
        const apis = info[key].apis;
        for (const api of apis) {
            let value = data[api];
            if (value == true) {
                value = "True";
            } else if (value == false) {
                value = "False";
            }
            if (value) {
                code.push(template_py_api_simple(id, api, value));
            }
        }

        //styles
        let codeStyle = template_py_styles(info[key]);
        code.push(codeStyle);
        
        code.push('');
    }


    for (let timeline of screen.timelines) {
        let codeTimeline = template_py_timeline(timeline);
        code.push(codeTimeline);
    }
    
    code.push('');
    return code.join("\n");
}


export function c_generator(screen, actFileName) {
    let info = screen.info;
    let body = [], cb = [];

    // method end
    let methodBeginCode = [
        `void lvgl_lv_${actFileName}(lv_obj_t *screen)`,
        `{`,
        `   if (screen == NULL)`,
        `   {`,
                `       screen = lv_scr_act();`,
                `       lv_obj_remove_style_all(screen);`,
                `       lv_obj_set_style_bg_opa(screen, LV_OPA_COVER, 0);`,
        `   }`,
        ``,
    ]
    body.push(methodBeginCode.join('\n'))

    for (const key in info) {
        let id = key;
        let data = info[id].data;

        let par_id = info[key].parent;

        let type = info[key].type;

        if(info[key].cb) {
            cb.push(id);
        }

        //screen no need generate create code
        if (type !== 'screen') {
            body.push(template_c_create(id, par_id, type));    //code: create, EX: btn0 = lv.btn(scr)
        }

        //attributes
        const attributes = info[key].attributes;
        for (const attr of attributes) {
            let value = data[attr];

            body.push(template_c_setter_simple(id, "obj", attr, value));
        }

        //apis
        const apis = info[key].apis;
        for (const api of apis) {
            let value = data[api];
            if (value) {
                body.push(template_c_api_simple(id, type, api, value, par_id));
            }
        }

        //styles
        let codeStyle = template_c_styles(info[key]);
        body.push(codeStyle);

        body.push("");

    }
    // method end
    body.push(`}`)
    let cb_s = [];
    for (const id of cb) {
        cb_s.push(template_c_cb(id));
        cb_s.push("");
    }

    return template_c_all(body.join("\n"), cb_s.join("\n"), actFileName);
}