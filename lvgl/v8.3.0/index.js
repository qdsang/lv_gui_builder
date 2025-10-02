
import {
    MicroPython,
    mp_js_init,
    mp_js_do_str,
    mp_js_init_repl,
    mp_js_process_char,
  } from './micropython.js';
import * as Widget from "./widget/index.js";

import { generateCode } from "./compiler/runtimeCompiler.js";
import {
  wrap_delete,
  wrap_rename,

  wrap_create_v2,
  wrap_update_v2,
  wrap_timeline_load,
  wrap_timeline_stop_all,
  wrap_timeline_start,
  wrap_timeline_pause,
  wrap_timeline_progress,

  wrap_font_load,
} from './compiler/runtimeWrapper.js';

import * as wasm_file_api from './wasm_file_api.js';
wasm_file_api;

import envCode from "./envCode.js";
import { registerAssetServer } from './assets.js';
import stdio from './stdio.js';

let runTime;
let isInit = false;

export function init() {
  runTime = +new Date();
  MicroPython.run();
}


export function on(event, callback) {
  if (event == 'stdout') {
    stdio.register(callback);
    window.addEventListener(
      'python:stdout_print',
      (e) => {
        callback(e);
      },
      false
    )
  }
}

export { Widget };

export async function simulatorInitWait() {
  while (!mp_js_do_str) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export function simulatorStdioInput(str) {
  mp_js_process_char(str);
}

export async function simulatorInit(ele) {
  await simulatorInitWait();
  console.log('simulator Init');

  if (isInit) {
    return;
  }
  isInit = true;
  console.log('VM init:', (+new Date() - runTime)+'ms');

  MicroPython.canvas = ele;

  /*Initialize MicroPython itself*/
  mp_js_init(20 * 1024 * 1024);

  /* Add function */
  mp_js_do_str(envCode.QueryCode);

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

export async function simulatorScreenSize({ width, height }) {
  await simulatorInitWait();
  // console.log('ScreenSize');
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // TODO: 临时处理
  if (width < 1024) width = 1024;
  if (height < 900) height = 900;

  /* Run init script */
  mp_js_do_str(envCode.EnvInitCode(width, height).join('\n'));

  MicroPython.canvas.style.width = width+'px';
  MicroPython.canvas.style.height = height+'px';

  await new Promise(resolve => setTimeout(resolve, 100));
}

export let simulatorWidget = {
  create: async (widget) => wrap_create_v2(widget, false),
  delete: async (id) => wrap_delete(id),
  updateAttr: async (widget, action) => wrap_update_v2(widget, action),
};

export let simulatorTimeline = {
  load: (timelines) => wrap_timeline_load(timelines),
  start: (id) => wrap_timeline_start(id),
  stopAll: () => wrap_timeline_stop_all(),
  pause: (id) => wrap_timeline_pause(id),
  progress: (id, v) => wrap_timeline_progress(id, v),
}


export { generateCode, registerAssetServer }
