/* eslint-disable @typescript-eslint/no-explicit-any */
import { storage } from './storage';

// MODE，即env[MODE]文件的环境名称(应用运行的模式)
const { MODE, VITE_BUILD_VCONSOLE } = import.meta.env;

// 传入debug参数，将debug存入/移除localStorage
const config = (debug: any) => {
  if (debug === '1') {
    storage.setItem('debug', debug);
  } else {
    storage.removeItem('debug');
  }
  init();
};

// 初始化 vconsole，控制隐藏/显示
const init = () => {
  const vc = <HTMLElement>document.querySelector('#__vconsole');
  const debug = storage.getItem('debug');
  if (VITE_BUILD_VCONSOLE === 'true' && MODE === 'test' && vc) {
    vc.style.display = debug === '1' ? '' : 'none';
  }
};

export default { init, config };
