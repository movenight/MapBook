import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'MapBook' },
    },
    {
      path: '/trips',
      name: 'trip-list',
      component: () => import('@/views/TripListView.vue'),
      meta: { title: '我的路书', requiresAuth: true },
    },
    {
      path: '/trips/new',
      name: 'trip-new',
      component: () => import('@/views/TripEditorView.vue'),
      meta: { title: '新建路书', requiresAuth: true },
    },
    {
      path: '/trips/:id',
      name: 'trip-edit',
      component: () => import('@/views/TripEditorView.vue'),
      meta: { title: '编辑路书', requiresAuth: true },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
      meta: { title: '登录' },
    },
  ],
})

export default router
