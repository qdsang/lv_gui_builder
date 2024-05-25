import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/pages/home.vue'),
  },
  {
    path: '/editor2',
    component: () => import('@/pages/editor2/index.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(), // history 模式则使用 createWebHistory()
  // history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes,
});
export default router;
