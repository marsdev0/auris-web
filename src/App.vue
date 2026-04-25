<template>
  <!-- 公共页面：全屏显示，不带导航 -->
  <router-view v-if="route.meta.public" />

  <!-- 业务页面：顶部导航 + 内容区 -->
  <div v-else class="app-layout">
    <header class="topnav">
      <div class="tn-logo">Auris</div>

      <nav class="tn-nav">
        <!-- 核心 -->
        <div
          class="tn-item" :class="{ active: route.path === '/avatar' }"
          @click="router.push('/avatar')"
        >
          <el-icon><Avatar /></el-icon><span>分身</span>
        </div>
        <div
          v-if="hasSkill('chat')"
          class="tn-item" :class="{ active: route.path === '/chat' }"
          @click="router.push('/chat')"
        >
          <el-icon><ChatDotRound /></el-icon><span>聊天</span>
        </div>
        <div
          v-if="hasSkill('task')"
          class="tn-item" :class="{ active: route.path === '/task' }"
          @click="router.push('/task')"
        >
          <el-icon><VideoPlay /></el-icon><span>任务</span>
        </div>

        <!-- 工具 -->
        <div
          v-if="hasSkill('asr') || hasSkill('briefing') || hasSkill('knowledge') || hasSkill('house')"
          class="tn-sep"
        ></div>
        <div
          v-if="hasSkill('asr')"
          class="tn-item" :class="{ active: route.path === '/asr' }"
          @click="router.push('/asr')"
        >
          <el-icon><Microphone /></el-icon><span>语音识别</span>
        </div>
        <div
          v-if="hasSkill('briefing')"
          class="tn-item" :class="{ active: route.path === '/briefing' }"
          @click="router.push('/briefing')"
        >
          <el-icon><Notebook /></el-icon><span>早报</span>
        </div>
        <div
          v-if="hasSkill('knowledge')"
          class="tn-item" :class="{ active: route.path === '/knowledge' }"
          @click="router.push('/knowledge')"
        >
          <el-icon><Reading /></el-icon><span>知识库</span>
        </div>
        <div
          v-if="hasSkill('house')"
          class="tn-item" :class="{ active: route.path === '/house' }"
          @click="router.push('/house')"
        >
          <el-icon><OfficeBuilding /></el-icon><span>房产</span>
        </div>

        <!-- 系统 -->
        <div
          v-if="hasSkill('config') || showAdmin"
          class="tn-sep"
        ></div>
        <div
          v-if="hasSkill('config')"
          class="tn-item" :class="{ active: route.path === '/config' }"
          @click="router.push('/config')"
        >
          <el-icon><Setting /></el-icon><span>配置</span>
        </div>

        <!-- 管理员 -->
        <template v-if="showAdmin">
          <div class="tn-sep"></div>
          <div
            class="tn-item" :class="{ active: route.path === '/admin/user' }"
            @click="router.push('/admin/user')"
          >
            <el-icon><UserFilled /></el-icon><span>用户管理</span>
          </div>
          <div
            class="tn-item" :class="{ active: route.path === '/admin/role' }"
            @click="router.push('/admin/role')"
          >
            <el-icon><Lock /></el-icon><span>角色管理</span>
          </div>
        </template>
      </nav>

      <div class="tn-right">
        <div class="tn-user">
          <el-avatar :size="28" :src="profile.avatarUrl">
            <el-icon :size="14"><UserIcon /></el-icon>
          </el-avatar>
          <span class="tn-name">{{ profile.nickname || profile.username }}</span>
        </div>
        <div class="tn-logout" @click="handleLogout">
          <el-icon :size="14"><SwitchButton /></el-icon>
          <span>退出</span>
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotRound, VideoPlay, Microphone, Setting, Notebook, Reading, OfficeBuilding, SwitchButton, UserFilled, Lock, User as UserIcon, Avatar } from '@element-plus/icons-vue'
import { logout, getUserProfile, getUserSkills } from '@/api/auth'
import { clearTokens, isLoggedIn } from '@/utils/token'
import { isAdmin } from '@/api/admin'
import type { UserProfile } from '@/types'

const route = useRoute()
const router = useRouter()

const profile = ref<UserProfile>({ username: '', nickname: '', avatarUrl: '' })
const showAdmin = ref(false)
const userSkills = ref<Set<string>>(new Set())

const hasSkill = (key: string) => userSkills.value.has(key)

const loadProfile = async () => {
  if (!isLoggedIn()) return
  try {
    const res = await getUserProfile() as any
    profile.value = res.data as UserProfile
  } catch {
    // 静默失败，侧边栏显示兜底状态
  }
}

const loadSkills = async () => {
  if (!isLoggedIn()) return
  try {
    const res = await getUserSkills() as any
    userSkills.value = new Set(res.data ?? res)
  } catch {
    // 静默失败，展示空菜单
  }
}

// 初次进入业务页 & 每次路由切换到业务页时加载
watch(() => route.meta.public, (isPublic) => {
  if (!isPublic) {
    loadProfile()
    loadSkills()
    showAdmin.value = isAdmin()
  }
}, { immediate: true })

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  try {
    await logout()
  } catch {
    // logout API 失败也要清除本地状态
  }
  clearTokens()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  background: #0a0a1a;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* ==================== 顶部导航 ==================== */
.topnav {
  height: 56px;
  background: rgba(14, 14, 32, 0.92);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
  z-index: 100;
}

.tn-logo {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: 32px;
  flex-shrink: 0;
}

.tn-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
}

.tn-nav::-webkit-scrollbar { display: none; }

.tn-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 9px;
  font-size: 13px;
  color: #52525b;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  user-select: none;
  position: relative;
}

.tn-item:hover {
  color: #a1a1aa;
  background: rgba(255, 255, 255, 0.03);
}

.tn-item.active {
  color: #e4e4e7;
  background: rgba(139, 92, 246, 0.12);
}

.tn-item.active::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  border-radius: 1px;
  background: #8b5cf6;
}

.tn-item .el-icon {
  font-size: 16px;
  opacity: 0.7;
}

.tn-item.active .el-icon {
  opacity: 1;
}

.tn-sep {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.06);
  margin: 0 6px;
  flex-shrink: 0;
}

/* ==================== 右侧用户区 ==================== */
.tn-right {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
  flex-shrink: 0;
}

.tn-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: default;
  padding: 4px 8px;
  border-radius: 8px;
}

.tn-name {
  font-size: 13px;
  color: #71717a;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tn-logout {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #52525b;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 7px;
  transition: all 0.15s;
}

.tn-logout:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

/* ==================== 内容区 ==================== */
.app-main {
  flex: 1;
  overflow: hidden;
  padding: 0;
}
</style>
