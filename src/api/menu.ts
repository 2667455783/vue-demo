import request from '@/utils/request'

export interface MenuItem {
  id: number
  parentId: number
  name: string
  path: string
  component: string
  icon: string
  type: 'directory' | 'menu' | 'button'
  sort: number
  status: number
  children?: MenuItem[]
}

export function getMenuTreeApi() {
  return request.get<MenuItem[]>('/system/menu/tree')
}

export function getMenuListApi() {
  return request.get<MenuItem[]>('/system/menu/list')
}

export function createMenuApi(data: Partial<MenuItem>) {
  return request.post('/system/menu/create', data)
}

export function updateMenuApi(data: Partial<MenuItem> & { id: number }) {
  return request.post('/system/menu/update', data)
}

export function deleteMenuApi(id: number) {
  return request.post('/system/menu/delete', { id })
}
