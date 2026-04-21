import http from './request'
import type { RegisterRequest, LoginRequest } from '@/types'

export function register(data: RegisterRequest) {
  return http.post('/v1/auth/register', data)
}

export function login(data: LoginRequest) {
  return http.post('/v1/auth/login', data)
}

export function refreshToken(refreshToken: string) {
  return http.post('/v1/auth/refresh', { refreshToken })
}

export function logout() {
  return http.post('/v1/auth/logout')
}
