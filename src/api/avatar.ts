import http from './request'
import type { AvatarProfile, CommonResponse } from '@/types'
import { getAccessToken } from '@/utils/token'

/** 获取分身画像标签列表 */
export function getAvatarProfile(status?: number) {
  return http.get<any, CommonResponse<AvatarProfile[]>>(
    '/v1/avatar/profile',
    { params: status !== undefined ? { status } : {} }
  )
}

/** 手动添加标签 */
export function addAvatarProfile(data: { category: string; tagKey: string; tagValue: string }) {
  return http.post<any, CommonResponse<void>>('/v1/avatar/profile', data)
}

/** 更新标签 */
export function updateAvatarProfile(tagId: string, data: { tagValue: string }) {
  return http.put<any, CommonResponse<void>>(`/v1/avatar/profile/${tagId}`, data)
}

/** 删除标签 */
export function deleteAvatarProfile(tagId: string) {
  return http.delete<any, CommonResponse<void>>(`/v1/avatar/profile/${tagId}`)
}

/** 确认标签 */
export function confirmAvatarProfile(tagId: string) {
  return http.post<any, CommonResponse<void>>(`/v1/avatar/profile/${tagId}/confirm`)
}

/** 拒绝标签 */
export function rejectAvatarProfile(tagId: string) {
  return http.post<any, CommonResponse<void>>(`/v1/avatar/profile/${tagId}/reject`)
}

/**
 * SSE 流式聊天
 * 用 fetch + ReadableStream 实现 POST SSE
 */
export async function chatStream(
  content: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
) {
  const token = getAccessToken()
  try {
    const response = await fetch('/api/v1/avatar/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ content })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const data = line.startsWith('data: ') ? line.slice(6) : line.slice(5)
        if (data === '[DONE]') {
          onDone()
          return
        }
        try {
          const parsed = JSON.parse(data)
          if (parsed.error) {
            onError(new Error(parsed.error))
            return
          }
          if (parsed.content) {
            onChunk(parsed.content)
          }
        } catch {
          // 非 JSON 行忽略
        }
      }
    }
    onDone()
  } catch (e) {
    onError(e instanceof Error ? e : new Error(String(e)))
  }
}

/** 同步聊天（备用） */
export function chatSync(content: string) {
  return http.post<any, CommonResponse<{ reply: string }>>('/v1/avatar/chat', { content })
}
