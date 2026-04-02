const API_BASE = '/api'

export async function sendMessage(content, sessionId) {
  const body = { content }
  if (sessionId) {
    body.sessionId = sessionId
  }

  const res = await fetch(`${API_BASE}/v1/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const data = await res.json()
  if (data.code !== 0) {
    throw new Error(data.msg || '请求失败')
  }
  return data.data
}
