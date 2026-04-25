<template>
  <div class="knowledge-page">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">知识库</span>
        <el-button type="primary" size="small" :icon="Plus" @click="showCreate">新建</el-button>
      </div>
      <div class="sidebar-list">
        <div
          v-for="item in list"
          :key="item.id"
          class="list-item"
          :class="{ active: activeId === item.id }"
          @click="selectItem(item.id)"
        >
          <div class="item-title">{{ item.title }}</div>
          <div class="item-meta">
            <el-tag size="small" :type="item.status === 'done' ? 'success' : item.status === 'processing' ? 'warning' : 'danger'" effect="plain">
              {{ statusMap[item.status] }}
            </el-tag>
            <span class="item-source">{{ item.sourceType === 'url' ? 'URL' : '文件' }}</span>
            <span v-if="item.duration" class="item-duration">{{ formatDuration(item.duration) }}</span>
          </div>
        </div>
        <div v-if="list.length === 0" class="sidebar-empty">
          <el-icon :size="32" color="#c0c4cc"><FolderOpened /></el-icon>
          <p>还没有内容</p>
          <p class="sub">点击上方"新建"开始</p>
        </div>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="content">
      <!-- 空状态 -->
      <div v-if="!activeItem && !creating" class="content-empty">
        <el-icon :size="48" color="#c0c4cc"><Reading /></el-icon>
        <p class="empty-title">知识库</p>
        <p class="empty-desc">粘贴视频链接或上传音频文件，AI 帮你总结内容</p>
        <el-button type="primary" @click="showCreate">
          <el-icon><Plus /></el-icon>
          开始使用
        </el-button>
      </div>

      <!-- 新建模式 -->
      <div v-else-if="creating" class="content-create">
        <div class="create-header">
          <h2>添加新内容</h2>
          <el-button text @click="cancelCreate">取消</el-button>
        </div>

        <el-tabs v-model="createTab">
          <el-tab-pane label="视频链接" name="url">
            <div class="create-body">
              <el-input
                v-model="urlInput"
                placeholder="粘贴 B站 / YouTube 视频链接"
                size="large"
                clearable
                :prefix-icon="Link"
              />
              <p class="create-tip">支持 B站、YouTube 等平台的视频链接</p>
              <el-button type="primary" size="large" :loading="submitting" @click="submitUrl" :disabled="!urlInput.trim()">
                提交处理
              </el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="上传文件" name="file">
            <div class="create-body">
              <el-upload
                drag
                :auto-upload="false"
                :limit="1"
                accept=".wav,.mp3,.m4a,.flac,.mp4,.mkv,.avi"
                :on-change="onFileChange"
                :on-remove="onFileRemove"
              >
                <el-icon :size="40" class="upload-icon"><Upload /></el-icon>
                <div class="upload-text">拖拽文件到此处，或<em>点击选择</em></div>
                <template #tip>
                  <div class="upload-tip">支持音频（WAV/MP3/M4A/FLAC）和视频（MP4/MKV/AVI），最大 500MB</div>
                </template>
              </el-upload>
              <el-button type="primary" size="large" :loading="submitting" @click="submitFile" :disabled="!selectedFile" style="margin-top: 16px">
                提交处理
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 查看模式 -->
      <div v-else-if="activeItem" class="content-detail">
        <div class="detail-scroll">
          <!-- 标题区 -->
          <div class="detail-header">
            <h1>{{ activeItem.title }}</h1>
            <div class="detail-meta">
              <el-tag v-if="activeItem.sourceType === 'url'" size="small" effect="plain" type="info">
                <el-icon><Link /></el-icon>&nbsp;{{ activeItem.sourceName }}
              </el-tag>
              <el-tag v-else size="small" effect="plain" type="info">
                <el-icon><Document /></el-icon>&nbsp;本地文件
              </el-tag>
              <span v-if="activeItem.duration" class="meta-duration">{{ formatDuration(activeItem.duration) }}</span>
              <span class="meta-time">{{ activeItem.createdAt }}</span>
              <el-popconfirm title="确定删除？" confirm-button-text="删除" @confirm="handleDelete(activeItem!.id)">
                <template #reference>
                  <el-button text type="danger" size="small" :icon="Delete">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>

          <!-- 处理中状态 -->
          <div v-if="activeItem.status === 'processing'" class="detail-processing">
            <el-icon :size="24" class="is-loading"><Loading /></el-icon>
            <p>正在处理中，请稍候...</p>
          </div>

          <!-- 摘要区 -->
          <template v-if="activeItem.summary">
            <!-- 概述 -->
            <div class="section">
              <div class="section-title">概述</div>
              <div class="overview-text">{{ activeItem.summary.overview }}</div>
            </div>

            <!-- 关键词 -->
            <div v-if="activeItem.keywords?.length" class="section">
              <div class="section-title">关键词</div>
              <div class="keyword-list">
                <el-tag v-for="kw in activeItem.keywords" :key="kw" effect="plain" round>{{ kw }}</el-tag>
              </div>
            </div>

            <!-- 要点 -->
            <div v-if="activeItem.summary.keyPoints?.length" class="section">
              <div class="section-title">核心要点</div>
              <div class="key-points">
                <div v-for="(point, idx) in activeItem.summary.keyPoints" :key="idx" class="point-item">
                  <span class="point-num">{{ idx + 1 }}</span>
                  <span>{{ point }}</span>
                </div>
              </div>
            </div>

            <!-- 章节 -->
            <div v-if="activeItem.summary.chapters?.length" class="section">
              <div class="section-title">章节目录</div>
              <div class="chapter-list">
                <div v-for="ch in activeItem.summary.chapters" :key="ch.timestamp" class="chapter-item">
                  <div class="chapter-left">
                    <span class="chapter-time">{{ ch.timestamp }}</span>
                    <span class="chapter-title">{{ ch.title }}</span>
                  </div>
                  <div class="chapter-summary">{{ ch.summary }}</div>
                </div>
              </div>
            </div>

            <!-- 全文 -->
            <div v-if="activeItem.transcript" class="section">
              <div class="section-title">
                完整文稿
                <el-button text size="small" @click="toggleTranscript">
                  {{ showTranscript ? '收起' : '展开' }}
                </el-button>
              </div>
              <div v-if="showTranscript" class="transcript-content">
                <div v-for="line in activeItem.transcript.split('\n').filter((l: string) => l.trim())" :key="line" class="transcript-line">
                  {{ line }}
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 追问区 -->
        <div class="chat-box">
          <el-input
            v-model="chatInput"
            placeholder="针对这个视频内容提问..."
            @keyup.enter="sendChat"
            clearable
          >
            <template #append>
              <el-button :icon="Promotion" @click="sendChat" :loading="chatLoading" />
            </template>
          </el-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Link, Upload, Delete, Reading, FolderOpened, Document, Promotion, Loading } from '@element-plus/icons-vue'
import type { KnowledgeItem } from '@/types'
import { getKnowledgeList, getKnowledgeDetail, submitKnowledge, deleteKnowledge, chatKnowledge } from '@/api/knowledge'

const statusMap: Record<string, string> = {
  processing: '处理中',
  done: '已完成',
  failed: '失败'
}

const list = ref<KnowledgeItem[]>([])
const activeId = ref<number | null>(null)
const activeItem = ref<KnowledgeItem | null>(null)
const creating = ref(false)
const createTab = ref('url')
const showTranscript = ref(false)

// 新建表单
const urlInput = ref('')
const selectedFile = ref<File | null>(null)
const submitting = ref(false)

// 追问
const chatInput = ref('')
const chatLoading = ref(false)

onMounted(async () => {
  const res = await getKnowledgeList()
  list.value = res.data
})

const showCreate = () => {
  creating.value = true
  activeId.value = null
  activeItem.value = null
}

const cancelCreate = () => {
  creating.value = false
  urlInput.value = ''
  selectedFile.value = null
}

const selectItem = async (id: number) => {
  creating.value = false
  activeId.value = id
  showTranscript.value = false
  const res = await getKnowledgeDetail(id)
  activeItem.value = res.data ?? null
}

const onFileChange = (file: any) => {
  selectedFile.value = file.raw
}

const onFileRemove = () => {
  selectedFile.value = null
}

const submitUrl = async () => {
  if (!urlInput.value.trim()) return
  submitting.value = true
  try {
    await submitKnowledge({ url: urlInput.value.trim() })
    ElMessage.success('已提交，正在处理中')
    creating.value = false
    urlInput.value = ''
  } finally {
    submitting.value = false
  }
}

const submitFile = async () => {
  if (!selectedFile.value) return
  submitting.value = true
  try {
    await submitKnowledge({ file: selectedFile.value })
    ElMessage.success('已提交，正在处理中')
    creating.value = false
    selectedFile.value = null
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  await deleteKnowledge(id)
  list.value = list.value.filter(i => i.id !== id)
  if (activeId.value === id) {
    activeId.value = null
    activeItem.value = null
  }
  ElMessage.success('已删除')
}

const toggleTranscript = () => {
  showTranscript.value = !showTranscript.value
}

const sendChat = async () => {
  if (!chatInput.value.trim() || !activeId.value) return
  chatLoading.value = true
  try {
    const res = await chatKnowledge(activeId.value, chatInput.value.trim())
    ElMessage.success(res.data.reply)
    chatInput.value = ''
  } finally {
    chatLoading.value = false
  }
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}h${m % 60}m`
  }
  return `${m}m${s.toString().padStart(2, '0')}s`
}
</script>

<style scoped>
.knowledge-page {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

/* ===== 侧边栏 ===== */
.sidebar {
  width: 300px;
  background: #fff;
  border-right: 1px solid #e8ecf1;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e8ecf1;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.list-item {
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.list-item:hover {
  background: #f5f7fa;
}

.list-item.active {
  background: #ecf5ff;
  border: 1px solid #d9ecff;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 6px;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: #909399;
  text-align: center;
}

.sidebar-empty p {
  margin: 8px 0 0;
  font-size: 14px;
}

.sidebar-empty .sub {
  font-size: 12px;
  color: #c0c4cc;
}

/* ===== 内容区 ===== */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 空状态 */
.content-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 16px 0 8px;
}

.empty-desc {
  font-size: 14px;
  margin-bottom: 24px;
}

/* 新建模式 */
.content-create {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.create-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.create-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
}

.create-tip {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.upload-icon {
  color: #c0c4cc;
}

.upload-text {
  color: #606266;
  font-size: 14px;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

/* 查看模式 */
.content-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.detail-header h1 {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
  line-height: 1.4;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #909399;
  flex-wrap: wrap;
}

.meta-time {
  font-size: 13px;
}

.detail-processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  color: #909399;
  font-size: 14px;
  gap: 12px;
}

/* 摘要区 */
.section {
  margin-top: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.overview-text {
  font-size: 14px;
  line-height: 1.7;
  color: #606266;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.key-points {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.point-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.point-num {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chapter-item {
  padding: 12px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.chapter-item:hover {
  background: #f5f7fa;
}

.chapter-left {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.chapter-time {
  font-size: 13px;
  color: #409eff;
  font-family: monospace;
  flex-shrink: 0;
}

.chapter-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.chapter-summary {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  padding-left: 72px;
}

.transcript-content {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.transcript-line {
  font-size: 13px;
  line-height: 1.8;
  color: #606266;
  padding: 2px 0;
}

/* 追问区 */
.chat-box {
  padding: 16px 32px;
  background: #fff;
  border-top: 1px solid #e8ecf1;
}
</style>
