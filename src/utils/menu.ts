import type { MenuItem } from '@/api/menu'

/** 过滤侧栏菜单：status===1 且 type!=='button'，空目录剔除，按 sort 排序 */
export function filterSidebarMenus(menus: MenuItem[]): MenuItem[] {
  return menus
    .filter((m) => m.status === 1 && m.type !== 'button')
    .map((m) => {
      if (m.children && m.children.length > 0) {
        const children = filterSidebarMenus(m.children)
        return { ...m, children }
      }
      return { ...m, children: undefined }
    })
    .filter((m) => {
      if (m.type === 'directory') {
        return m.children && m.children.length > 0
      }
      return true
    })
    .sort((a, b) => a.sort - b.sort)
}

/** 收集可访问的菜单 path（type=menu） */
export function collectAccessPaths(menus: MenuItem[], out: string[] = []): string[] {
  for (const m of menus) {
    if (m.type === 'menu' && m.path) out.push(m.path)
    if (m.children?.length) collectAccessPaths(m.children, out)
  }
  return out
}

/** 收集按钮权限 id */
export function collectButtonIds(menus: MenuItem[], out: number[] = []): number[] {
  for (const m of menus) {
    if (m.type === 'button') out.push(m.id)
    if (m.children?.length) collectButtonIds(m.children, out)
  }
  return out
}

/** 在菜单树中查找路径 */
export function findMenuPath(menus: MenuItem[], path: string): MenuItem[] {
  for (const menu of menus) {
    if (menu.path === path) return [menu]
    if (menu.children) {
      const found = findMenuPath(menu.children, path)
      if (found.length > 0) return [menu, ...found]
    }
  }
  return []
}
