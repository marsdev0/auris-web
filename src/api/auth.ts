import http from './request'
import type { RegisterRequest } from '@/types'

export function register(data: RegisterRequest) {
  return http.post('/v1/auth/register', data)
}
