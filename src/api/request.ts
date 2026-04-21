import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { CommonResponse } from '@/types'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/utils/token'
import router from '@/router'

const ERROR_MSG_MAP: Record<number, string> = {
  10000: '请求参数错误',
  10001: '服务器开小差了，请稍后重试',
  20001: 'AI 服务异常，请稍后重试',
  30001: '用户名已存在',
  30002: '用户不存在',
  30003: '用户名或密码错误',
  30004: '账号已被禁用',
}

function getErrorMessage(code: number, msg: string): string {
  return ERROR_MSG_MAP[code] || msg || '请求失败'
}

const http = axios.create({
  baseURL: '/api',
  timeout: 60000
})

// 请求拦截：注入 Token
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一错误处理 + 401 自动刷新
let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

http.interceptors.response.use(
  (res: AxiosResponse) => {
    const body = res.data as CommonResponse
    if (body.code !== 0) {
      ElMessage.error(getErrorMessage(body.code, body.msg))
      return Promise.reject(new Error(body.msg))
    }
    return body as any
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshTokenValue = getRefreshToken()
      if (!refreshTokenValue) {
        clearTokens()
        router.push('/login')
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(http(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await axios.post('/api/v1/auth/refresh', {
          refreshToken: refreshTokenValue
        })
        const { accessToken, refreshToken: newRefresh } = res.data.data
        setTokens(accessToken, newRefresh)

        pendingRequests.forEach(cb => cb(accessToken))
        pendingRequests = []

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return http(originalRequest)
      } catch {
        clearTokens()
        router.push('/login')
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default http
