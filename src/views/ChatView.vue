<template>
  <div class="chat-page">
    <!-- 顶栏 -->
    <div class="chat-header">
      <span class="session-tag" v-if="sessionId">
        Session: {{ sessionId.slice(0, 8) }}...
      </span>
      <div class="header-actions">
        <el-button type="primary" size="small" @click="newSession" :icon="Plus">新建对话</el-button>
        <el-button type="danger" size="small" @click="handleDelete" :disabled="!sessionId" :icon="Delete">删除会话</el-button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="chat-messages" ref="messagesRef">
      <div v-if="messages.length === 0" class="empty-tip">
        开始和 Auris AI 助手对话吧
      </div>
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['msg-row', msg.role]"
      >
        <div class="avatar">
          {{ msg.role === 'user' ? 'U' : 'A' }}
        </div>
        <div class="bubble">{{ msg.content }}</div>
      </div>
      <div v-if="loading" class="msg-row assistant">
        <div class="avatar">A</div>
        <div class="bubble typing">思考中...</div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="chat-input">
      <el-input
        v-model="input"
        @keyup.enter="send"
        placeholder="输入消息..."
        :disabled="loading"
        size="large"
        clearable
      />
      <el-button
        type="primary"
        size="large"
        @click="send"
        :disabled="loading || !input.trim()"
        :loading="loading"
      >
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { sendMessage, deleteSession } from '@/api/chat'

interface Msg {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Msg[]>([])
const input = ref('')
const loading = ref(false)
const messagesRef = ref<HTMLElement | null>(null)
const sessionId = ref<string | null>(localStorage.getItem('auris_session_id'))

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

function newSession() {
  sessionId.value = null
  localStorage.removeItem('auris_session_id')
  messages.value = []
}

async function handleDelete() {
  if (!sessionId.value) return
  try {
    await ElMessageBox.confirm('确定删除当前会话？', '提示', { type: 'warning' })
    await deleteSession(sessionId.value)
    ElMessage.success('会话已删除')
    newSession()
  } catch {
    // 用户取消
  }
}

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return

  messages.value.push({ id: Date.now(), role: 'user', content: text })
  input.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const res = await sendMessage({
      content: text,
      sessionId: sessionId.value || undefined
    })
    if (res.data?.reply) {
      messages.value.push({ id: Date.now() + 1, role: 'assistant', content: res.data.reply })
    }
  } catch {
    messages.value.push({ id: Date.now() + 1, role: 'assistant', content: '请求失败，请重试' })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e8ecf1;
}

.session-tag {
  font-size: 13px;
  color: #909399;
  background: #f4f4f5;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: monospace;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-tip {
  text-align: center;
  color: #c0c4cc;
  font-size: 15px;
  margin-top: 120px;
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
  background: #409eff;
  color: #fff;
}

.msg-row.assistant .avatar {
  background: #e6e8eb;
  color: #606266;
}

.bubble {
  max-width: 65%;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.msg-row.user .bubble {
  background: #409eff;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.msg-row.assistant .bubble {
  background: #fff;
  color: #303133;
  border: 1px solid #e8ecf1;
  border-bottom-left-radius: 4px;
}

.typing {
  color: #909399;
  font-style: italic;
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #e8ecf1;
}

.chat-input .el-input {
  flex: 1;
}
</style>
