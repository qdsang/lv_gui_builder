
import * as wasm_file_api from './wasm_file_api.js';
wasm_file_api;


import {
  MicroPython,
  mp_js_init,
  mp_js_do_str,
  mp_js_init_repl,
  mp_js_process_char,
} from './micropython.js';

window.api = {
  isLoad: false,
};

async function init() {
  while (!mp_js_do_str) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  initVM();
}

function initVM() {
  MicroPython.canvas = document.getElementById('canvas');

  /* Bind mp_js_stdout */
  // let mp_js_stdout = document.getElementById('mp_js_stdout');
  // mp_js_stdout.value = '';


  /*Initialize MicroPython itself*/
  mp_js_init(20 * 1024 * 1024);

  /* Add function querry_attr() & walv_callback() */
  // mp_js_do_str(WidgetData.QueryCode.join('\n'));
  // wrap_equal('ATTR', JSON.stringify(WidgetData.Getter)); //Add ATTR to mpy, ATTR is common getter

  /*Setup lv_task_handler loop*/
  var the_mp_handle_pending = MicroPython.cwrap('mp_handle_pending', null, [], { async: true });
  function handle_pending() {
    the_mp_handle_pending();
    setTimeout(handle_pending, 10); // should call lv_task_handler()
  }

  /*Initialize the REPL.*/
  mp_js_init_repl();

  handle_pending();
  
  window.api.isLoad = true;
  window.api.mp_js_do_str = mp_js_do_str;
  console.log(';;;');
}


MicroPython.run();
init();
