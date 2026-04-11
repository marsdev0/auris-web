import http from './request'
import type { ASRData, CommonResponse } from '@/types'

export function transcribeAudio(file: File) {
  const formData = new FormData()
  formData.append('audio', file)
  return http.post<any, CommonResponse<ASRData>>('/v1/asr/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  })
}
