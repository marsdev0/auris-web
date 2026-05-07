<template>
  <div :class="['agent-page', messages.length === 0 ? 'no-messages' : 'has-messages']">
    <!-- 顶栏 -->
    <div class="agent-header">
      <div class="header-left">
        <span class="status-dot" :class="{ online: connected }"></span>
        <span class="status-text">{{ connected ? '已连接' : '未连接' }}</span>
      </div>
      <div class="header-actions">
        <el-button
          size="small"
          @click="handleReset"
          :disabled="!connected || wsLoading"
        >
          重置对话
        </el-button>
        <el-button
          size="small"
          :type="connected ? 'danger' : 'primary'"
          @click="connected ? handleDisconnect() : handleConnect()"
        >
          {{ connected ? '断开' : '连接' }}
        </el-button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="agent-messages" ref="messagesRef">
      <div v-if="messages.length === 0" class="empty-tip">
        连接后开始和 Auris Agent 对话
      </div>
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['msg-row', msg.role]"
      >
        <div class="avatar">
          {{ msg.role === 'user' ? 'U' : 'A' }}
        </div>
        <div class="bubble">
          <pre class="bubble-text">{{ msg.content }}</pre>
        </div>
      </div>
      <div v-if="wsLoading" class="msg-row assistant">
        <div class="avatar">A</div>
        <div class="bubble typing">执行中...</div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="agent-input-wrap">
      <div class="agent-input">
        <el-input
          v-model="input"
          @keyup.enter="handleSend"
          placeholder="输入消息..."
          :disabled="!connected || wsLoading"
          size="large"
          clearable
        />
        <el-button
          type="primary"
          size="large"
          @click="handleSend"
          :disabled="!connected || wsLoading || !input.trim()"
          :loading="wsLoading"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAgentWs } from '@/composables/useAgentWs'

interface Msg {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Msg[]>([])
const input = ref('')
const messagesRef = ref<HTMLElement | null>(null)

const { connected, loading: wsLoading, lastReply, connect, send, reset, disconnect } = useAgentWs()

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

// 监听回复
watch(lastReply, (val) => {
  if (val) {
    messages.value.push({ id: Date.now() + 1, role: 'assistant', content: val })
    scrollToBottom()
  }
})

function handleConnect() {
  connect()
  ElMessage.info('正在连接...')
}

function handleDisconnect() {
  disconnect()
  messages.value = []
  ElMessage.info('已断开')
}

function handleSend() {
  const text = input.value.trim()
  if (!text || !connected.value || wsLoading.value) return

  messages.value.push({ id: Date.now(), role: 'user', content: text })
  input.value = ''
  scrollToBottom()
  send(text)
}

function handleReset() {
  reset()
  messages.value = []
  ElMessage.success('对话已重置')
}

onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.agent-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0a0a1a;
}

.agent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(14, 14, 32, 0.92);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52525b;
}

.status-dot.online {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
}

.status-text {
  font-size: 13px;
  color: #a1a1aa;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.agent-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 24px 0;
}

.empty-tip {
  text-align: center;
  color: #52525b;
  font-size: 15px;
  margin-top: 120px;
}

/* 无消息时：输入框居中 */
.agent-page.no-messages .agent-messages {
  display: none;
}

.agent-page.no-messages .agent-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 有消息时：输入框固定底部 */
.agent-page.has-messages .agent-input-wrap {
  flex-shrink: 0;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 10px;
}

.msg-row.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.msg-row.user .avatar {
  background: #8b5cf6;
  color: #fff;
}

.msg-row.assistant .avatar {
  background: rgba(255, 255, 255, 0.08);
  color: #a1a1aa;
}

.bubble {
  max-width: 70%;
  padding: 10px 16px;
  border-radius: 12px;
}

.msg-row.user .bubble {
  background: #8b5cf6;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.msg-row.assistant .bubble {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e4e4e7;
  border-bottom-left-radius: 4px;
}

.bubble-text {
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.typing {
  color: #71717a;
  font-style: italic;
}

.agent-input {
  display: flex;
  gap: 10px;
  width: 680px;
  max-width: 90vw;
}

.agent-input .el-input {
  flex: 1;
}
</style>
