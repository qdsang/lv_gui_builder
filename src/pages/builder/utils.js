
import { Data_Changed_Event } from  './common/constant.js';

export const pool_delete = (pool, list) => {
    for (const i of list) {
        delete pool[i];
    }
}

export const dispatch_data_changed_event = () => {
    let event = new Event(Data_Changed_Event)
    window.dispatchEvent(event);
}

let timeoutID;
export const debounceFun = function (delay, callback) {
  function wrapper() {
    const self = this;
    const args = arguments;

    function exec() {
      callback.apply(self, args);
    }

    clearTimeout(timeoutID);
    timeoutID = setTimeout(exec, delay);
  }

  return wrapper();
};

// arguments
export const setArgvs = (args) => {
    let args_list = [];
    for (const i of args) {
        args_list.push(i["name"])
    }
    return args_list.toString();
}

export function saveAs(blob, fileName) {
    // 创建a标签
    var elementA = document.createElement('a');
    
    //文件的名称为时间戳加文件名后缀
    elementA.download = fileName;
    elementA.style.display = 'none';
    
    //生成一个blob二进制数据，内容为json数据
    // var blob = new Blob([JSON.stringify(jsonObj)]);
    
    //生成一个指向blob的URL地址，并赋值给a标签的href属性
    elementA.href = URL.createObjectURL(blob);
    document.body.appendChild(elementA);
    elementA.click();
    document.body.removeChild(elementA);
}
