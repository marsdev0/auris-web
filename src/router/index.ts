import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '@/utils/token'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/chat'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true }
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

router.beforeEach((to, _from, next) => {
  if (to.meta.public || isLoggedIn()) {
    next()
  } else {
    next('/login')
  }
})

export default router
