<template>
  <div class="chat-container">
    <div class="header">Auris AI 助手</div>
    <div class="messages" ref="messagesRef">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message', msg.role === 'user' ? 'user' : 'assistant']"
      >
        <div class="bubble">{{ msg.content }}</div>
      </div>
      <div v-if="loading" class="message assistant">
        <div class="bubble typing">思考中...</div>
      </div>
    </div>
    <div class="input-area">
      <input
        v-model="input"
        @keyup.enter="send"
        placeholder="输入消息..."
        :disabled="loading"
      />
      <button @click="send" :disabled="loading || !input.trim()">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { sendMessage } from './api/chat.js'

const messages = ref([])
const input = ref('')
const loading = ref(false)
const messagesRef = ref(null)

function getSessionId() {
  return localStorage.getItem('auris_session_id')
}

function setSessionId(id) {
  localStorage.setItem('auris_session_id', id)
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return

  messages.value.push({ id: Date.now(), role: 'user', content: text })
  input.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const data = await sendMessage(text, getSessionId())
    if (data.session_id) {
      setSessionId(data.session_id)
    }
    messages.value.push({ id: Date.now() + 1, role: 'assistant', content: data.reply })
  } catch (e) {
    messages.value.push({ id: Date.now() + 1, role: 'assistant', content: `出错了: ${e.message}` })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f5f5f5;
}

.chat-container {
  max-width: 700px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.header {
  padding: 16px 20px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #e8e8e8;
  text-align: center;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 16px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.message.user .bubble {
  background: #4a90d9;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message.assistant .bubble {
  background: #f0f0f0;
  color: #333;
  border-bottom-left-radius: 4px;
}

.typing {
  color: #999;
  font-style: italic;
}

.input-area {
  display: flex;
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
  gap: 10px;
}

.input-area input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.input-area input:focus {
  border-color: #4a90d9;
}

.input-area button {
  padding: 10px 20px;
  background: #4a90d9;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.input-area button:disabled {
  background: #b0b0b0;
  cursor: not-allowed;
}
</style>
