import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/pages/home.vue'),
  },
  {
    path: '/lv/editor',
    component: () => import('@/pages/editor/index.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(), // history 模式则使用 createWebHistory()
  // history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes,
});
export default router;
