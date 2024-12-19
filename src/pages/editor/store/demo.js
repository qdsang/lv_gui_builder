
import demo1 from '../../../../demo/demo1.lv?raw';
import demo2 from '../../../../demo/demo2.lv?raw';

export function initDemo() {
  let demos = {
    demo1: demo1,
    demo2: demo2
  }
  for (let demo in demos) {
    const key = `lvgl_project_${demo}`;
    localStorage.setItem(key, demos[demo]);
  }
}

export function initDemoProject(id) {
  const key = `lvgl_project_${id}`;
  localStorage.setItem(key, demo1);
}