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
      path: '/avatar',
      name: 'Avatar',
      component: () => import('@/views/AvatarView.vue')
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
    },
    {
      path: '/knowledge',
      name: 'Knowledge',
      component: () => import('@/views/KnowledgeView.vue')
    },
    {
      path: '/house',
      name: 'House',
      component: () => import('@/views/HouseView.vue')
    },
    {
      path: '/admin/user',
      name: 'UserManage',
      component: () => import('@/views/UserManageView.vue'),
      meta: { admin: true }
    },
    {
      path: '/admin/role',
      name: 'RoleManage',
      component: () => import('@/views/RoleManageView.vue'),
      meta: { admin: true }
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
