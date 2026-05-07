import { ref, readonly } from 'vue'

export interface WsMessage {
  type: 'message' | 'reset'
  content: string
}

export interface WsResponse {
  type: 'result' | 'system'
  content: string
}

const ws = ref<WebSocket | null>(null)
const connected = ref(false)
const loading = ref(false)
const lastReply = ref('')

// 发送队列：连接未就绪时缓存消息
let pendingQueue: string[] = []

function getWsUrl() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${location.host}/ws/v1/api/agent/ws`
}

function flushQueue() {
  while (pendingQueue.length > 0) {
    const msg = pendingQueue.shift()!
    ws.value!.send(msg)
  }
}

export function useAgentWs() {
  function connect() {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) return
    if (ws.value) ws.value.close()

    ws.value = new WebSocket(getWsUrl())

    ws.value.onopen = () => {
      connected.value = true
      console.log('[WS] connected')
      flushQueue()
    }

    ws.value.onclose = () => {
      connected.value = false
      loading.value = false
      console.log('[WS] disconnected')
    }

    ws.value.onerror = (e) => {
      console.error('[WS] error', e)
    }

    ws.value.onmessage = (event) => {
      const data: WsResponse = JSON.parse(event.data)
      if (data.type === 'result') {
        lastReply.value = data.content
      }
      loading.value = false
    }
  }

  function send(content: string) {
    const msg = JSON.stringify({ type: 'message', content } as WsMessage)

    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      // 连接未就绪，先缓存，等 onopen 后自动发送
      pendingQueue.push(msg)
      loading.value = true
      connect()
      return
    }

    loading.value = true
    ws.value.send(msg)
  }

  function reset() {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) return
    const msg: WsMessage = { type: 'reset', content: '' }
    ws.value.send(JSON.stringify(msg))
  }

  function disconnect() {
    pendingQueue = []
    ws.value?.close()
    ws.value = null
  }

  return {
    connected: readonly(connected),
    loading: readonly(loading),
    lastReply,
    connect,
    send,
    reset,
    disconnect
  }
}
