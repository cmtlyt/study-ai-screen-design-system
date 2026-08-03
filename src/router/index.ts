import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/editor' },
    { path: '/editor', component: () => import('@/editor/index.vue') },
    { path: '/preview', component: () => import('@/pages/preview/index.vue') },
  ],
});

export default router;
