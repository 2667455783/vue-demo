import request from '@/utils/request'

export interface DashboardEntry {
  title: string
  value: number
  icon: string
  color: string
}

export function getHomeEntriesApi() {
  return request.get<DashboardEntry[]>('/dashboard/entries')
}
