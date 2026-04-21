import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/chat'
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { public: true }
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
    },
    {
      path: '/asr',
      name: 'ASR',
      component: () => import('@/views/ASRView.vue')
    },
    {
      path: '/briefing',
      name: 'Briefing',
      component: () => import('@/views/BriefingView.vue')
    }
  ]
})

export default router
