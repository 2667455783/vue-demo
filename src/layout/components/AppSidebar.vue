<template>
  <div class="sidebar-wrapper">
    <div class="sidebar-title" v-show="!appStore.sidebarCollapsed">
      {{ appTitle }}
    </div>
    <div class="sidebar-title sidebar-title-collapsed" v-show="appStore.sidebarCollapsed">
      管
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="appStore.sidebarCollapsed"
      :collapse-transition="false"
      router
      background-color="#1f2d3d"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      class="sidebar-menu"
    >
      <template v-for="menu in permissionStore.sidebarMenus" :key="menu.id">
        <!-- 目录 -->
        <el-sub-menu
          v-if="menu.children && menu.children.length > 0"
          :index="String(menu.id)"
        >
          <template #title>
            <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
            <span>{{ menu.name }}</span>
          </template>
          <el-menu-item
            v-for="child in menu.children"
            :key="child.id"
            :index="child.path"
          >
            <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
            <span>{{ child.name }}</span>
          </el-menu-item>
        </el-sub-menu>
        <!-- 单个菜单 -->
        <el-menu-item v-else :index="menu.path">
          <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
          <span>{{ menu.name }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const appTitle = computed(() => import.meta.env.VITE_APP_TITLE || '通用后台管理系统')
const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.sidebar-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-title-collapsed {
  font-size: 14px;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  &:not(.el-menu--collapse) {
    width: $sidebar-width;
  }
}
</style>
