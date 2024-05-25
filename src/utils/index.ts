export * from './storage';
export * from './util';
export * from './geo';


let generateUniqueIdCounter = 1;
export function generateUniqueId() {
    // 根据自己的需求生成唯一ID
    // 例如组合时间戳、随机数和计数器
    const timestamp = Date.now().toString(36);
    const randomNumber = Math.random().toString(36).substr(2, 5);
    const counter = ++generateUniqueIdCounter;
    return `${timestamp}-${randomNumber}-${counter}`;
}
