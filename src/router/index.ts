import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/lv/editor/demo1',
  },
  {
    path: '/home',
    component: () => import('@/pages/home.vue'),
  },
  {
    path: '/lv/editor',
    component: () => import('@/pages/editor/index.vue'),
  },
  {
    path: '/lv/editor/:id',
    component: () => import('@/pages/editor/index.vue'),
  },
  {
    path: '/lv/simulator',
    component: () => import('@/pages/simulator/index.vue'),
  },
  {
    path: '/lv/font',
    component: () => import('@/pages/font/index.vue'),
  },
  {
    path: '/lv/image',
    name: 'Image',
    component: () => import('../pages/image/index.vue'),
    meta: {
      title: 'Image Converter'
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(), // history 模式则使用 createWebHistory()
  // history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes,
});

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  const title = to.meta.title
  const appTitle = process.env.VITE_APP_TITLE || 'LVGL GUI Builder'
  if (title) {
    document.title = `${title} - ${appTitle}` // 你可以根据需要修改格式
  } else {
    document.title = `${appTitle}`
  }
  next()
})

export default router;
