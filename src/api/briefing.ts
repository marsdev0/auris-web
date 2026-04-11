import http from './request'
import type { BriefingItem } from '@/types'

export function getDailyBriefing() {
  return http.get<{ data: BriefingItem }>('/v1/briefing/daily')
}
