import request from '@/utils/request'

export interface UserItem {
  id: number
  username: string
  nickname: string
  roleIds: number[]
  status: number
}

export interface UserListParams {
  page?: number
  pageSize?: number
  username?: string
}

export interface UserListResult {
  list: UserItem[]
  total: number
  page: number
  pageSize: number
}

export function getUserListApi(params: UserListParams) {
  return request.get<UserListResult>('/system/user/list', { params: params as Record<string, unknown> })
}

export function createUserApi(data: Partial<UserItem> & { username: string; password: string }) {
  return request.post('/system/user/create', data)
}

export function updateUserApi(data: Partial<UserItem> & { id: number }) {
  return request.post('/system/user/update', data)
}

export function deleteUserApi(id: number) {
  return request.post('/system/user/delete', { id })
}
