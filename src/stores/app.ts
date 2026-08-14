import { defineStore } from 'pinia'
import { ref } from 'vue'
import { layoutSettings } from '@/config/layout'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(layoutSettings.sidebarCollapsed)
  const sidebarCollapseEnabled = ref(layoutSettings.sidebarCollapseEnabled)

  function toggleSidebar() {
    if (!sidebarCollapseEnabled.value) return
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    sidebarCollapsed,
    sidebarCollapseEnabled,
    toggleSidebar,
  }
})
