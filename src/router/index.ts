import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/chat'
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('@/views/ChatView.vue')
    },
    {
      path: '/task',
      name: 'Task',
      component: () => import('@/views/TaskView.vue')
    },
    {
      path: '/config',
      name: 'Config',
      component: () => import('@/views/ConfigView.vue')
    }
  ]
})

export default router
