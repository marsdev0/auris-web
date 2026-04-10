import http from './request'
import type { ChatRequest, ChatData, CommonResponse } from '@/types'

export function sendMessage(data: ChatRequest) {
  return http.post<any, CommonResponse<ChatData>>('/v1/agent/chat', data)
}

export function deleteSession(sessionId: string) {
  return http.delete<any, CommonResponse>(`/v1/agent/chat/session/${sessionId}`)
}
