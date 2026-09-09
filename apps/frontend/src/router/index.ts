import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/editor' },
    { path: '/editor', component: () => import('@/pages/editor/index.vue') },
    { path: '/preview', component: () => import('@/pages/preview/index.vue') },
    { path: '/screen', component: () => import('@/pages/screen/index.vue') },
  ],
});

export default router;
