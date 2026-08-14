import request from '@/utils/request'

export interface RoleItem {
  id: number
  name: string
  code: string
  menuIds: number[]
  status: number
}

export interface RoleListParams {
  page?: number
  pageSize?: number
}

export interface RoleListResult {
  list: RoleItem[]
  total: number
  page: number
  pageSize: number
}

export function getRoleListApi(params: RoleListParams) {
  return request.get<RoleListResult>('/system/role/list', { params: params as Record<string, unknown> })
}

export function getAllRolesApi() {
  return request.get<RoleItem[]>('/system/role/all')
}

export function createRoleApi(data: Partial<RoleItem>) {
  return request.post('/system/role/create', data)
}

export function updateRoleApi(data: Partial<RoleItem> & { id: number }) {
  return request.post('/system/role/update', data)
}

export function deleteRoleApi(id: number) {
  return request.post('/system/role/delete', { id })
}
