<template>
  <div class="house-page">
    <!-- 顶栏 -->
    <div class="header">
      <div class="header-left">
        <el-icon :size="20" color="#409eff"><OfficeBuilding /></el-icon>
        <span class="header-title">房产助手</span>
      </div>
      <el-button text size="small" @click="clearChat">清除对话</el-button>
    </div>

    <!-- 消息区 -->
    <div ref="msgBox" class="message-area">
      <template v-for="(msg, idx) in messages" :key="idx">
        <!-- 用户消息 -->
        <div v-if="msg.role === 'user'" class="msg-row user">
          <div class="avatar user-avatar">U</div>
          <div class="bubble user-bubble">{{ msg.content }}</div>
        </div>

        <!-- AI 消息 -->
        <div v-else class="msg-row ai">
          <div class="avatar ai-avatar">
            <el-icon :size="16"><OfficeBuilding /></el-icon>
          </div>
          <div class="bubble ai-bubble">
            <!-- 文字内容 -->
            <div v-if="msg.text" class="msg-text">{{ msg.text }}</div>

            <!-- 楼盘卡片 -->
            <div v-if="msg.properties?.length" class="property-grid">
              <div v-for="prop in msg.properties" :key="prop.id" class="property-card">
                <div class="prop-header">
                  <div class="prop-name">{{ prop.name }}</div>
                  <div class="prop-score">{{ prop.score }}</div>
                </div>
                <div class="prop-location">{{ prop.district }}</div>
                <div class="prop-price">
                  <span class="price-avg">{{ (prop.avgPrice / 10000).toFixed(1) }}万/㎡</span>
                  <span class="price-total">总价 {{ prop.totalPriceRange }}</span>
                </div>
                <div class="prop-detail">
                  <span>面积 {{ prop.area }}</span>
                </div>
                <div class="prop-school">
                  <el-icon :size="12"><School /></el-icon>
                  {{ prop.school }}（{{ prop.schoolLevel }}）
                </div>
                <div class="prop-metro">
                  <el-icon :size="12"><Location /></el-icon>
                  {{ prop.metro }}
                </div>
                <div class="prop-tags">
                  <el-tag v-for="tag in prop.tags" :key="tag" size="small" effect="plain" round>{{ tag }}</el-tag>
                </div>
              </div>
            </div>

            <!-- 对比表格 -->
            <div v-if="msg.compare" class="compare-section">
              <div class="compare-names">
                <span v-for="(name, i) in msg.compare.names" :key="i" class="compare-name">
                  {{ name }}
                </span>
              </div>
              <table class="compare-table">
                <tbody>
                  <tr v-for="row in msg.compare.rows" :key="row.dimension">
                    <td class="compare-dim">{{ row.dimension }}</td>
                    <td v-for="(val, i) in row.values" :key="i">{{ val }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="compare-conclusion">
                综合来看，如果<strong>重视品牌和居住品质</strong>，绿城·晓月澄庐更优；如果<strong>考虑性价比和通勤便利</strong>，万科·天空之城更合适。
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- AI 思考中 -->
      <div v-if="loading" class="msg-row ai">
        <div class="avatar ai-avatar">
          <el-icon :size="16"><OfficeBuilding /></el-icon>
        </div>
        <div class="bubble ai-bubble thinking">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- 快捷标签 -->
    <div v-if="messages.length <= 1" class="quick-tags">
      <el-tag
        v-for="tag in quickTags"
        :key="tag"
        effect="plain"
        class="quick-tag"
        @click="sendMessage(tag)"
      >
        {{ tag }}
      </el-tag>
    </div>

    <!-- 输入区 -->
    <div class="input-area">
      <el-input
        v-model="input"
        placeholder="描述你的购房需求，如：杭州未来科技城，200-300万，学区优先"
        size="large"
        clearable
        @keyup.enter="sendMessage(input)"
        :disabled="loading"
      >
        <template #append>
          <el-button :icon="Promotion" @click="sendMessage(input)" :loading="loading" />
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { OfficeBuilding, Promotion, School, Location } from '@element-plus/icons-vue'
import type { HouseProperty, HouseCompareRow } from '@/types'
import { chatHouse } from '@/api/house'

interface AiMessage {
  role: 'ai'
  text?: string
  properties?: HouseProperty[]
  compare?: { names: string[]; rows: HouseCompareRow[] }
}

type Message = { role: 'user'; content: string } | AiMessage

const messages = ref<Message[]>([
  {
    role: 'ai',
    text: '你好！我是房产助手，告诉我你的需求：\n\n· 想买哪个城市/区域\n· 预算范围\n· 关注点（学区、交通、性价比、环境）\n\n例如："杭州未来科技城，200-300万，学区优先"'
  }
])

const input = ref('')
const loading = ref(false)
const msgBox = ref<HTMLDivElement>()

const quickTags = [
  '杭州未来科技城 200-300万 学区优先',
  '杭州 300万以内 地铁房',
  '帮我对比前两个楼盘',
  '刚需上车，预算250万以内'
]

const scrollToBottom = () => {
  nextTick(() => {
    if (msgBox.value) {
      msgBox.value.scrollTop = msgBox.value.scrollHeight
    }
  })
}

const sendMessage = async (text: string) => {
  if (!text.trim() || loading.value) return

  messages.value.push({ role: 'user', content: text.trim() })
  input.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const res = await chatHouse(text.trim())
    messages.value.push({
      role: 'ai',
      text: res.data.reply,
      properties: res.data.properties,
      compare: res.data.compare
    })
  } catch {
    messages.value.push({ role: 'ai', text: '抱歉，出了点问题，请重试。' })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const clearChat = () => {
  messages.value = [
    { role: 'ai', text: '对话已清除。有什么新的购房需求？' }
  ]
}
</script>

<style scoped>
.house-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

/* 顶栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e8ecf1;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 消息区 */
.message-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.msg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.msg-row.user {
  justify-content: flex-end;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.user-avatar {
  background: #409eff;
  color: #fff;
}

.ai-avatar {
  background: #f0f2f5;
  color: #606266;
}

.bubble {
  max-width: 720px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.user-bubble {
  background: #409eff;
  color: #fff;
  border-top-right-radius: 4px;
}

.ai-bubble {
  background: #fff;
  color: #303133;
  border: 1px solid #e8ecf1;
  border-top-left-radius: 4px;
}

.msg-text {
  white-space: pre-line;
}

/* 思考动画 */
.thinking {
  display: flex;
  gap: 4px;
  padding: 16px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
  animation: bounce 1.2s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

/* 快捷标签 */
.quick-tags {
  display: flex;
  gap: 8px;
  padding: 0 24px 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.quick-tag:hover {
  color: #409eff;
  border-color: #409eff;
}

/* 输入区 */
.input-area {
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #e8ecf1;
  flex-shrink: 0;
}

/* ===== 楼盘卡片 ===== */
.property-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.property-card {
  background: #f9fafb;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 14px;
  transition: all 0.2s;
  cursor: pointer;
}

.property-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-color: #d9ecff;
}

.prop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.prop-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.prop-score {
  background: linear-gradient(135deg, #f7ba2a, #f59b1e);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.prop-location {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.prop-price {
  margin-bottom: 6px;
}

.price-avg {
  font-size: 18px;
  font-weight: 700;
  color: #f56c6c;
  margin-right: 8px;
}

.price-total {
  font-size: 13px;
  color: #606266;
}

.prop-detail {
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
}

.prop-school,
.prop-metro {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.prop-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.prop-tags :deep(.el-tag) {
  font-size: 11px;
}

/* ===== 对比表格 ===== */
.compare-section {
  margin-top: 12px;
}

.compare-names {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}

.compare-name {
  flex: 1;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  padding: 8px;
  background: #ecf5ff;
  border-radius: 6px;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.compare-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  text-align: center;
}

.compare-table .compare-dim {
  text-align: left;
  font-weight: 500;
  color: #606266;
  background: #fafafa;
  width: 80px;
}

.compare-table tr:last-child td {
  border-bottom: none;
}

.compare-conclusion {
  margin-top: 12px;
  padding: 12px;
  background: #f0f9eb;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
}

.compare-conclusion strong {
  color: #303133;
}
</style>
