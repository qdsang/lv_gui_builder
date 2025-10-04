const modules = import.meta.glob('../../../../demo/*.lv', { as: 'raw' });

let demos = {};

// 将顶级await改为异步函数
export async function initDemo() {
  // 等待所有模块加载完成
  await Promise.all(
    Object.keys(modules).map(async (path) => {
      let name = path.split('/').pop().split('.').shift().replace('.lv', '');
      let module = await modules[path]();
      demos[name] = module;
    })
  );
  
  // 原有的初始化逻辑
  for (let demo in demos) {
    const key = `lvgl_project_${demo}`;
    try {
      localStorage.setItem(key, demos[demo]);
    } catch (e) {
      console.error(e);
    }
  }
}

export async function initDemoProject(id) {
  // 确保在使用前已加载demos
  if (Object.keys(demos).length === 0) {
    await initDemo();
  }
  
  const key = `lvgl_project_${id}`;
  try {
    localStorage.setItem(key, demos[id]);
  } catch (e) {
    console.error(e);
  }
}

export async function getDemoList() {
  // 确保在使用前已加载demos
  if (Object.keys(demos).length === 0) {
    await initDemo();
  }
  
  return Object.keys(demos).sort();
}