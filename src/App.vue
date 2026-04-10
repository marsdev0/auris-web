<template>
  <el-container class="app-container">
    <el-aside width="200px" class="app-aside">
      <div class="logo">Auris</div>
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
        <el-menu-item index="/config">
          <el-icon><Setting /></el-icon>
          <span>配置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ChatDotRound, VideoPlay, Setting } from '@element-plus/icons-vue'

const route = useRoute()
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

.nav-menu {
  border-right: none;
}

.nav-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  font-size: 15px;
}

.nav-menu .el-menu-item.is-active {
  background-color: #3a3b50 !important;
}

.app-main {
  background-color: #f5f7fa;
  padding: 0;
  overflow: hidden;
}
</style>
