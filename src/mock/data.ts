export interface MockUser {
  id: number
  username: string
  password: string
  nickname: string
  roleIds: number[]
  status: number
}

export interface MockRole {
  id: number
  name: string
  code: string
  menuIds: number[]
  status: number
}

export interface MockMenu {
  id: number
  parentId: number
  name: string
  path: string
  component: string
  icon: string
  type: 'directory' | 'menu' | 'button'
  sort: number
  status: number
  children?: MockMenu[]
}

export const mockUsers: MockUser[] = [
  { id: 1, username: 'admin', password: 'admin123', nickname: '管理员', roleIds: [1], status: 1 },
  { id: 2, username: 'editor', password: 'editor123', nickname: '编辑员', roleIds: [2], status: 1 },
  { id: 3, username: 'test', password: 'test123', nickname: '测试用户', roleIds: [2], status: 0 },
]

export const mockRoles: MockRole[] = [
  { id: 1, name: '管理员', code: 'admin', menuIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], status: 1 },
  { id: 2, name: '编辑员', code: 'editor', menuIds: [1, 2, 3, 4, 5, 6, 7, 8], status: 1 },
]

/** 种子一律扁平 parentId，禁止嵌套 children（否则 CRUD 按顶层 findIndex 会失败） */
export const mockMenus: MockMenu[] = [
  { id: 1, parentId: 0, name: '首页', path: '/home', component: 'home', icon: 'HomeFilled', type: 'menu', sort: 1, status: 1 },
  { id: 2, parentId: 0, name: '系统管理', path: '/system', component: '', icon: 'Setting', type: 'directory', sort: 2, status: 1 },
  { id: 3, parentId: 2, name: '用户管理', path: '/system/user', component: 'system/user', icon: 'User', type: 'menu', sort: 1, status: 1 },
  { id: 4, parentId: 2, name: '菜单管理', path: '/system/menu', component: 'system/menu', icon: 'Menu', type: 'menu', sort: 2, status: 1 },
  { id: 5, parentId: 2, name: '角色管理', path: '/system/role', component: 'system/role', icon: 'UserFilled', type: 'menu', sort: 3, status: 1 },
  { id: 6, parentId: 3, name: '用户新增', path: '', component: '', icon: '', type: 'button', sort: 1, status: 1 },
  { id: 7, parentId: 3, name: '用户编辑', path: '', component: '', icon: '', type: 'button', sort: 2, status: 1 },
  { id: 8, parentId: 3, name: '用户删除', path: '', component: '', icon: '', type: 'button', sort: 3, status: 1 },
  { id: 9, parentId: 4, name: '菜单新增', path: '', component: '', icon: '', type: 'button', sort: 1, status: 1 },
  { id: 10, parentId: 4, name: '菜单编辑', path: '', component: '', icon: '', type: 'button', sort: 2, status: 1 },
  { id: 11, parentId: 4, name: '菜单删除', path: '', component: '', icon: '', type: 'button', sort: 3, status: 1 },
  { id: 12, parentId: 5, name: '角色新增', path: '', component: '', icon: '', type: 'button', sort: 1, status: 1 },
  { id: 13, parentId: 5, name: '角色编辑', path: '', component: '', icon: '', type: 'button', sort: 2, status: 1 },
  { id: 14, parentId: 5, name: '角色删除', path: '', component: '', icon: '', type: 'button', sort: 3, status: 1 },
]

export const counters = { nextUserId: 4, nextMenuId: 15, nextRoleId: 3 }
