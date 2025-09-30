
import {
    MicroPython,
    mp_js_init,
    mp_js_do_str,
    mp_js_init_repl,
    mp_js_process_char,
  } from './micropython.js';
import * as WidgetData from "./widgetData.js";

import * as wasm_file_api from './wasm_file_api.js';
wasm_file_api;

let runTime;
let isInit = false;

export function init() {
  runTime = +new Date();
  MicroPython.run();
}

export function on(event, callback) {
  if (event == 'stdout') {
    window.addEventListener(
      'python:stdout_print',
      (e) => {
        callback(e);
      },
      false
    )
  }
}

let Widget = WidgetData;
export { Widget };

export async function simulatorInitWait() {
  while (!mp_js_do_str) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export { mp_js_do_str };

export function simulatorStdioInput(str) {
  mp_js_process_char(str);
}

export async function simulatorInit(ele) {
  await simulatorInitWait();
  console.log('simulatorInit');

  if (isInit) {
    return;
  }
  isInit = true;
  console.log('VM init:', (+new Date() - runTime)+'ms');

  MicroPython.canvas = ele;

  /* Bind mp_js_stdout */
  // let mp_js_stdout = document.getElementById('mp_js_stdout');
  // mp_js_stdout.value = '';

  /*Initialize MicroPython itself*/
  mp_js_init(20 * 1024 * 1024);

  /* Add function querry_attr() & walv_callback() */
  mp_js_do_str(WidgetData.QueryCode.join('\n'));
  mp_js_do_str(`ATTR=` + JSON.stringify(WidgetData.Getter));
  // wrap_equal('ATTR', JSON.stringify(WidgetData.Getter)); //Add ATTR to mpy, ATTR is common getter

  /*Setup lv_task_handler loop*/
  var the_mp_handle_pending = MicroPython.cwrap('mp_handle_pending', null, [], { async: true });
  function handle_pending() {
    the_mp_handle_pending();
    setTimeout(handle_pending, 10); // should call lv_task_handler()
  }

  /*Initialize the REPL.*/
  mp_js_init_repl();

  /*Start the main loop, asynchronously.*/
  handle_pending();

  await simulatorInitWait();
}

export async function ScreenSize(width, height) {
  await simulatorInitWait();
  // console.log('ScreenSize');
  await new Promise(resolve => setTimeout(resolve, 100));
  
  /* Run init script */
  mp_js_do_str(WidgetData.EnvInitCode(width, height).join('\n'));

  MicroPython.canvas.style.width = width+'px';
  MicroPython.canvas.style.height = height+'px';

  await new Promise(resolve => setTimeout(resolve, 100));
}


export function simulatorUpdate(event) {
    if (event.type == "element") {
        // console.log(event.data)
    } else if (event.type == "timeline") {
        // console.log(event.data)
    }
}


export function generateCode(lang) {

}

