import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'defaultLayout',
      component: () => import('./components/defaultLayout/index.vue'),
      redirect: '/home',
      children: [
        {
          path: '/home',
          name: 'home',
          component: () => import('./pages/home.vue')
        },
        {
          path: '/noteEditor/:id',
          name: 'noteEditor',
          component: () => import('./pages/noteEditor.vue')
        },
        {
          path: '/recycleBin',
          name: 'recycleBinView',
          component: () => import('./pages/recycleBin.vue')
        },
        {
          path: '/drawBoard',
          name: 'drawBoard',
          component: () => import('./pages/drawBoard.vue')
        }
      ]
    }
  ]
})

export default router
