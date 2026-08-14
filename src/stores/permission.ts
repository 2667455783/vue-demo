import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMenuTreeApi } from '@/api/menu'
import type { MenuItem } from '@/api/menu'
import { filterSidebarMenus, collectAccessPaths, collectButtonIds } from '@/utils/menu'

export const usePermissionStore = defineStore('permission', () => {
  const sidebarMenus = ref<MenuItem[]>([])
  const accessPaths = ref<string[]>([])
  const buttonIds = ref<number[]>([])
  const loaded = ref(false)

  async function fetchMenus() {
    const res = await getMenuTreeApi()
    sidebarMenus.value = filterSidebarMenus(res)
    accessPaths.value = collectAccessPaths(res)
    buttonIds.value = collectButtonIds(res)
    loaded.value = true
    return res
  }

  function hasPerm(menuId: number) {
    return buttonIds.value.includes(menuId)
  }

  function canAccessPath(path: string) {
    return accessPaths.value.includes(path)
  }

  function resetMenus() {
    sidebarMenus.value = []
    accessPaths.value = []
    buttonIds.value = []
    loaded.value = false
  }

  return {
    sidebarMenus,
    accessPaths,
    buttonIds,
    loaded,
    fetchMenus,
    hasPerm,
    canAccessPath,
    resetMenus,
  }
})
