
const modules = import.meta.glob('../../../../demo/*.lv', { as: 'raw' });

let demos = {};
for (const path in modules) {
  let name = path.split('/').pop().split('.').shift().replace('.lv', '');
  let module = await modules[path]();
  demos[name] = module;
}

export function initDemo() {
  for (let demo in demos) {
    const key = `lvgl_project_${demo}`;
    localStorage.setItem(key, demos[demo]);
  }
}

export function initDemoProject(id) {
  const key = `lvgl_project_${id}`;
  localStorage.setItem(key, demos[id]);
}

export function getDemoList() {
  return Object.keys(demos);
}