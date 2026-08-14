<template>
  <div class="layout-container">
    <div class="layout-sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
      <AppSidebar />
    </div>
    <div class="layout-main">
      <AppHeader />
      <div class="layout-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'

const appStore = useAppStore()
</script>
