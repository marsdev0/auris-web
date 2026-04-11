<template>
  <div class="briefing-page">
    <!-- 顶栏 -->
    <div class="briefing-header">
      <h2 class="title">每日早报</h2>
      <el-button size="small" @click="load" :loading="loading">刷新</el-button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading && !briefing" class="loading-tip">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!briefing" class="empty-tip">
      今日早报尚未生成，请稍后再试
    </div>

    <!-- 早报内容 -->
    <div v-else class="briefing-content">
      <!-- 头条 + 概述 -->
      <el-card class="overview-card" shadow="never">
        <div class="headline">{{ briefing.headline }}</div>
        <div class="overview">{{ briefing.overview }}</div>
        <div class="meta">
          <span>{{ briefing.created_at }}</span>
          <span>共 {{ briefing.article_count }} 篇文章</span>
        </div>
      </el-card>

      <!-- 文章列表 -->
      <div class="article-list">
        <el-card
          v-for="article in briefing.articles"
          :key="article.link"
          class="article-card"
          shadow="never"
        >
          <div class="article-header">
            <el-tag size="small" type="info">{{ article.category }}</el-tag>
            <a :href="article.link" target="_blank" class="article-title">
              {{ article.title }}
            </a>
          </div>
          <div class="article-summary">{{ article.summary }}</div>
          <div class="article-meta">
            <span>{{ article.source }}</span>
            <span>{{ article.published }}</span>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { getDailyBriefing } from '@/api/briefing'
import type { BriefingItem } from '@/types'

const briefing = ref<BriefingItem | null>(null)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await getDailyBriefing()
    briefing.value = res.data
  } catch {
    briefing.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.briefing-page {
  height: 100vh;
  overflow-y: auto;
  padding: 0 24px 24px;
}

.briefing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  position: sticky;
  top: 0;
  background: #f5f7fa;
  z-index: 1;
}

.briefing-header .title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.loading-tip,
.empty-tip {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-top: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 概述卡片 */
.overview-card {
  margin-bottom: 16px;
}

.headline {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.overview {
  font-size: 14px;
  color: #606266;
  line-height: 1.7;
  margin-bottom: 12px;
}

.meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

/* 文章卡片 */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-card {
  transition: box-shadow 0.2s;
}

.article-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.article-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.article-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  text-decoration: none;
  flex: 1;
}

.article-title:hover {
  color: #409eff;
}

.article-summary {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.article-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}
</style>
