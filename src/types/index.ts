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

/** 知识库条目 */
export interface KnowledgeItem {
  id: number
  title: string
  sourceType: 'url' | 'file'
  sourceUrl?: string
  sourceName?: string
  status: 'processing' | 'done' | 'failed'
  duration?: number
  summary?: KnowledgeSummary
  keywords?: string[]
  transcript?: string
  createdAt: string
}

/** 知识库 AI 摘要 */
export interface KnowledgeSummary {
  title: string
  overview: string
  chapters: KnowledgeChapter[]
  keyPoints: string[]
}

/** 知识库章节 */
export interface KnowledgeChapter {
  title: string
  timestamp: string
  summary: string
}

/** 楼盘信息 */
export interface HouseProperty {
  id: number
  name: string
  city: string
  district: string
  avgPrice: number
  totalPriceRange: string
  area: string
  tags: string[]
  score: number
  school: string
  schoolLevel: string
  metro: string
  developer: string
  imageUrl: string
}

/** 楼盘对比项 */
export interface HouseCompareRow {
  dimension: string
  values: string[]
}

/** Skill 定义 */
export interface Skill {
  key: string
  name: string
}

/** 角色 */
export interface Role {
  id: number
  name: string
  description: string
  skills: string[]
  userCount: number
}

/** 管理视角的用户 */
export interface AdminUser {
  id: string
  username: string
  nickname: string
  roleName: string
  status: number
  createdAt: string
}
