/** 后端通用响应结构 */
export interface CommonResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

/** 聊天请求 */
export interface ChatRequest {
  content: string
  sessionId?: string
}

/** 聊天响应 */
export interface ChatData {
  reply: string
}

/** 启动任务请求 */
export interface StartTaskReq {
  task: string
}

/** 启动任务响应 */
export interface TaskData {
  result: string
}

/** Agent 配置请求 */
export interface AgentConfigReq {
  maxIterations: number
  maxTokens: number
}

/** Agent 配置响应 */
export interface AgentConfigData {
  max_iterations: number
  max_tokens: number
}
