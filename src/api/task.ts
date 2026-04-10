import http from './request'
import type { StartTaskReq, TaskData, CommonResponse } from '@/types'

export function startTask(data: StartTaskReq) {
  return http.post<any, CommonResponse<TaskData>>('/v1/agent/task/start', data)
}
