<template>
  <!-- 公共页面：全屏显示，不带侧边栏 -->
  <router-view v-if="route.meta.public" />

  <!-- 业务页面：侧边栏 + 内容区 -->
  <el-container v-else class="app-container">
    <el-aside width="200px" class="app-aside">
      <div class="logo">Auris</div>
      <div class="nav-wrapper">
        <el-menu
          :default-active="route.path"
          router
          class="nav-menu"
          background-color="#1d1e2c"
          text-color="#a0a4b8"
          active-text-color="#ffffff"
        >
          <el-menu-item index="/chat">
            <el-icon><ChatDotRound /></el-icon>
            <span>聊天</span>
          </el-menu-item>
          <el-menu-item index="/task">
            <el-icon><VideoPlay /></el-icon>
            <span>任务</span>
          </el-menu-item>
          <el-menu-item index="/asr">
            <el-icon><Microphone /></el-icon>
            <span>语音识别</span>
          </el-menu-item>
          <el-menu-item index="/config">
            <el-icon><Setting /></el-icon>
            <span>配置</span>
          </el-menu-item>
          <el-menu-item index="/briefing">
            <el-icon><Notebook /></el-icon>
            <span>早报</span>
          </el-menu-item>
        </el-menu>

        <div class="nav-footer">
          <div class="user-info">
            <el-avatar :size="32" :src="profile.avatarUrl">
              <el-icon :size="18"><UserIcon /></el-icon>
            </el-avatar>
            <span class="user-name">{{ profile.nickname || profile.username }}</span>
          </div>
          <div class="logout-btn" @click="handleLogout">
            <el-icon :size="16"><SwitchButton /></el-icon>
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </el-aside>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotRound, VideoPlay, Microphone, Setting, Notebook, SwitchButton, User as UserIcon } from '@element-plus/icons-vue'
import { logout, getUserProfile } from '@/api/auth'
import { clearTokens, isLoggedIn } from '@/utils/token'
import type { UserProfile } from '@/types'

const route = useRoute()
const router = useRouter()

const profile = ref<UserProfile>({ username: '', nickname: '', avatarUrl: '' })

const loadProfile = async () => {
  if (!isLoggedIn()) return
  try {
    const res = await getUserProfile() as any
    profile.value = res.data as UserProfile
  } catch {
    // 静默失败，侧边栏显示兜底状态
  }
}

// 初次进入业务页 & 每次路由切换到业务页时加载
watch(() => route.meta.public, (isPublic) => {
  if (!isPublic) loadProfile()
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
}

.app-container {
  height: 100vh;
}

.app-aside {
  background-color: #1d1e2c;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.nav-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
}

.nav-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  font-size: 15px;
}

.nav-menu .el-menu-item.is-active {
  background-color: #3a3b50 !important;
}

.nav-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 12px 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a0a4b8;
  margin-bottom: 8px;
  padding: 0 8px;
}

.user-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b6d80;
  font-size: 13px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #f56c6c;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.app-main {
  background-color: #f5f7fa;
  padding: 0;
  overflow: hidden;
}
</style>
