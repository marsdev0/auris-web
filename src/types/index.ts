/** 后端通用响应结构 */
export interface CommonResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

/** 注册请求 */
export interface RegisterRequest {
  username: string
  password: string
}

/** 登录请求 */
export interface LoginRequest {
  username: string
  password: string
}

/** Token 响应 */
export interface TokenData {
  accessToken: string
  refreshToken: string
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

/** 文章 */
export interface Article {
  title: string
  link: string
  source: string
  category: string
  summary: string
  published: string
}

/** ASR 识别结果 */
export interface ASRData {
  text: string
  duration: number
}

/** 用户资料 */
export interface UserProfile {
  username: string
  nickname: string
  avatarUrl: string
}

/** 每日早报 */
export interface BriefingItem {
  briefing_id: string
  created_at: string
  headline: string
  overview: string
  article_count: number
  articles: Article[]
}
