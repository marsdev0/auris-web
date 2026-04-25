import http from './request'
import type { AdminUser, Role, Skill } from '@/types'

export const ALL_SKILLS: Skill[] = [
  { key: 'chat', name: '聊天' },
  { key: 'task', name: '任务' },
  { key: 'asr', name: '语音识别' },
  { key: 'config', name: '配置' },
  { key: 'briefing', name: '早报' },
  { key: 'knowledge', name: '知识库' },
  { key: 'house', name: '房产' }
]

export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 获取用户列表（分页） */
export function getUserList(pageNo = 1, pageSize = 20) {
  return http.get<unknown, PageResponse<AdminUser>>('/v1/admin/users', { params: { pageNo, pageSize } })
}

/** 修改用户角色 */
export function updateUserRole(userId: string, roleName: string) {
  return http.put(`/v1/admin/users/${userId}/role`, { roleName })
}

/** 修改用户状态 */
export function updateUserStatus(userId: string, status: number) {
  return http.put(`/v1/admin/users/${userId}/status`, { status })
}

/** 获取角色列表 */
export function getRoleList() {
  return http.get<unknown, Role[]>('/v1/admin/roles')
}

/** 创建角色 */
export function createRole(role: { name: string; description: string; skills: string[] }) {
  return http.post('/v1/admin/roles', role)
}

/** 编辑角色 */
export function updateRole(roleId: number, role: { name: string; description: string; skills: string[] }) {
  return http.put(`/v1/admin/roles/${roleId}`, role)
}

/** 删除角色 */
export function deleteRole(roleId: number) {
  return http.delete(`/v1/admin/roles/${roleId}`)
}

/** 判断当前用户是否为 admin（mock） */
export function isAdmin(): boolean {
  try {
    const token = localStorage.getItem('auris_access_token')
    if (!token) return false
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.username === 'admin'
  } catch {
    return false
  }
}
