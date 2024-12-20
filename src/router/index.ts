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
    path: '/lv/font',
    component: () => import('@/pages/font/index.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(), // history 模式则使用 createWebHistory()
  // history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes,
});
export default router;
