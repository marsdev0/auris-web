import http from './request'
import type { AgentConfigReq, AgentConfigData, CommonResponse } from '@/types'

export function updateConfig(data: AgentConfigReq) {
  return http.post<any, CommonResponse<AgentConfigData>>('/v1/agent/updateConfig', data)
}
