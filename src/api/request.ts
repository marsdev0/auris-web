import axios, { type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { CommonResponse } from '@/types'

const http = axios.create({
  baseURL: '/api',
  timeout: 60000
})

http.interceptors.response.use(
  (res: AxiosResponse) => {
    const body = res.data as CommonResponse
    if (body.code !== 0) {
      ElMessage.error(body.msg || '请求失败')
      return Promise.reject(new Error(body.msg))
    }
    return body as any
  },
  (err) => {
    ElMessage.error(err.message || '网络错误')
    return Promise.reject(err)
  }
)

export default http
