import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { parseBody } from '@/utils/mock'
import {
  mockUsers,
  mockRoles,
  mockMenus,
  counters,
} from './data'
import type { MockUser, MockRole, MockMenu } from './data'

/** 开发体感延迟；过大时菜单跳转后内容区会空等，显得「点了没反应」 */
const delay = (ms = 30) => new Promise((r) => setTimeout(r, ms))

type MockHandler = (config: AxiosRequestConfig) => Promise<{ data: unknown }>

function ok(data: unknown, code = 0) {
  return { code, data, message: 'success' }
}

function fail(message: string, code = 400) {
  return { code, data: null, message }
}

function paginate<T>(list: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  const items = list.slice(start, start + pageSize)
  return { list: items, total: list.length, page, pageSize }
}

function buildMenuTree(menus: MockMenu[], parentId = 0): MockMenu[] {
  return menus
    .filter((m) => m.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .map((m) => {
      const children = buildMenuTree(menus, m.id)
      return children.length > 0 ? { ...m, children } : { ...m }
    })
}

function getUserByToken(authHeader?: string): MockUser | undefined {
  if (!authHeader) return undefined
  const token = authHeader.replace('Bearer ', '')
  const match = token.match(/^mock-token-(\d+)$/)
  if (!match) return undefined
  return mockUsers.find((u) => u.id === Number(match[1]))
}

function requireUser(config: AxiosRequestConfig): MockUser | ReturnType<typeof fail> {
  const user = getUserByToken(config.headers?.Authorization as string)
  if (!user) return fail('无效token', 401)
  return user
}

function getUserMenuIds(user: MockUser): number[] {
  const ids = new Set<number>()
  for (const roleId of user.roleIds) {
    const role = mockRoles.find((r) => r.id === roleId)
    if (role) role.menuIds.forEach((id) => ids.add(id))
  }
  return [...ids]
}

/** 按角色菜单 id 过滤，并补齐祖先目录，避免子菜单有权限但整支丢失 */
function filterFlatMenusByUser(menus: MockMenu[], menuIds: number[]): MockMenu[] {
  const idSet = new Set(menuIds)
  let changed = true
  while (changed) {
    changed = false
    for (const m of menus) {
      if (idSet.has(m.id) && m.parentId !== 0 && !idSet.has(m.parentId)) {
        idSet.add(m.parentId)
        changed = true
      }
    }
  }
  return menus.filter((m) => idSet.has(m.id))
}

const handlers: Record<string, MockHandler> = {
  'POST /auth/login': async (config) => {
    const body = parseBody<{ username: string; password: string }>(config.data)
    const user = mockUsers.find((u) => u.username === body.username)
    if (!user) return fail('用户不存在', 401)
    if (user.password !== body.password) return fail('密码错误', 401)
    if (user.status !== 1) return fail('用户已禁用', 403)
    return ok({ token: `mock-token-${user.id}` })
  },

  'GET /auth/userinfo': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    return ok({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      roleIds: user.roleIds,
    })
  },

  'GET /dashboard/entries': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    return ok([
      { title: '用户总数', value: mockUsers.length, icon: 'User', color: '#409eff' },
      { title: '角色总数', value: mockRoles.length, icon: 'UserFilled', color: '#67c23a' },
      { title: '菜单总数', value: mockMenus.length, icon: 'Menu', color: '#e6a23c' },
      { title: '在线用户', value: 1, icon: 'Monitor', color: '#f56c6c' },
    ])
  },

  'GET /system/menu/tree': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const menuIds = getUserMenuIds(user)
    const tree = buildMenuTree(filterFlatMenusByUser(mockMenus, menuIds))
    return ok(tree)
  },

  'GET /system/menu/list': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    return ok(buildMenuTree(mockMenus))
  },

  'POST /system/menu/create': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const body = parseBody<Omit<MockMenu, 'id' | 'children'>>(config.data)
    const newMenu: MockMenu = { ...body, id: counters.nextMenuId++ }
    mockMenus.push(newMenu)
    return ok(newMenu)
  },

  'POST /system/menu/update': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const body = parseBody<MockMenu>(config.data)
    const idx = mockMenus.findIndex((m) => m.id === body.id)
    if (idx === -1) return fail('菜单不存在')
    const { children: _c, ...rest } = body
    mockMenus[idx] = { ...mockMenus[idx], ...rest }
    delete mockMenus[idx].children
    return ok(mockMenus[idx])
  },

  'POST /system/menu/delete': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const body = parseBody<{ id: number }>(config.data)
    const idx = mockMenus.findIndex((m) => m.id === body.id)
    if (idx === -1) return fail('菜单不存在')
    const removeIds = new Set<number>([body.id])
    let changed = true
    while (changed) {
      changed = false
      for (const m of mockMenus) {
        if (removeIds.has(m.parentId) && !removeIds.has(m.id)) {
          removeIds.add(m.id)
          changed = true
        }
      }
    }
    for (let i = mockMenus.length - 1; i >= 0; i--) {
      if (removeIds.has(mockMenus[i].id)) mockMenus.splice(i, 1)
    }
    return ok(null)
  },

  'GET /system/user/list': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const page = Number(config.params?.page || 1)
    const pageSize = Number(config.params?.pageSize || 10)
    const username = (config.params?.username as string) || ''
    let filtered = [...mockUsers]
    if (username) filtered = filtered.filter((u) => u.username.includes(username))
    const safeList = filtered.map(({ password: _p, ...rest }) => rest)
    return ok(paginate(safeList, page, pageSize))
  },

  'POST /system/user/create': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const body = parseBody<Omit<MockUser, 'id'>>(config.data)
    if (mockUsers.find((u) => u.username === body.username)) return fail('用户名已存在')
    const newUser: MockUser = { ...body, id: counters.nextUserId++ }
    mockUsers.push(newUser)
    const { password: _p, ...rest } = newUser
    return ok(rest)
  },

  'POST /system/user/update': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const body = parseBody<Partial<MockUser> & { id: number }>(config.data)
    const idx = mockUsers.findIndex((u) => u.id === body.id)
    if (idx === -1) return fail('用户不存在')
    mockUsers[idx] = { ...mockUsers[idx], ...body }
    const { password: _p, ...rest } = mockUsers[idx]
    return ok(rest)
  },

  'POST /system/user/delete': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const body = parseBody<{ id: number }>(config.data)
    const idx = mockUsers.findIndex((u) => u.id === body.id)
    if (idx === -1) return fail('用户不存在')
    mockUsers.splice(idx, 1)
    return ok(null)
  },

  'GET /system/role/list': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const page = Number(config.params?.page || 1)
    const pageSize = Number(config.params?.pageSize || 10)
    return ok(paginate(mockRoles, page, pageSize))
  },

  'GET /system/role/all': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    return ok(mockRoles)
  },

  'POST /system/role/create': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const body = parseBody<Omit<MockRole, 'id'>>(config.data)
    if (mockRoles.find((r) => r.code === body.code)) return fail('角色编码已存在')
    const newRole: MockRole = { ...body, id: counters.nextRoleId++ }
    mockRoles.push(newRole)
    return ok(newRole)
  },

  'POST /system/role/update': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const body = parseBody<Partial<MockRole> & { id: number }>(config.data)
    const idx = mockRoles.findIndex((r) => r.id === body.id)
    if (idx === -1) return fail('角色不存在')
    mockRoles[idx] = { ...mockRoles[idx], ...body }
    return ok(mockRoles[idx])
  },

  'POST /system/role/delete': async (config) => {
    const user = requireUser(config)
    if ('code' in user) return user
    const body = parseBody<{ id: number }>(config.data)
    const idx = mockRoles.findIndex((r) => r.id === body.id)
    if (idx === -1) return fail('角色不存在')
    mockRoles.splice(idx, 1)
    return ok(null)
  },
}

export async function mockRequest(config: AxiosRequestConfig): Promise<AxiosResponse | null> {
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  if (!useMock) return null

  const method = (config.method || 'GET').toUpperCase()
  const url = config.url || ''
  const key = `${method} ${url}`

  const handler = handlers[key]
  if (!handler) return null

  await delay()
  const result = await handler(config)

  return {
    data: result,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  } as AxiosResponse
}
