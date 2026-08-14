<template>
  <div class="icon-select">
    <el-input
      v-model="searchText"
      placeholder="搜索图标"
      clearable
      @focus="showPanel = true"
      @input="filterIcons"
    >
      <template #prefix>
        <el-icon v-if="modelValue"><component :is="modelValue" /></el-icon>
      </template>
    </el-input>
    <div v-if="showPanel" class="icon-panel">
      <div class="icon-list">
        <div
          v-for="icon in filteredIcons"
          :key="icon"
          class="icon-item"
          :class="{ active: modelValue === icon }"
          @click="selectIcon(icon)"
        >
          <el-icon :size="20"><component :is="icon" /></el-icon>
          <span class="icon-name">{{ icon }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as Icons from '@element-plus/icons-vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const allIcons = Object.keys(Icons)
const searchText = ref('')
const showPanel = ref(false)

const filteredIcons = computed(() => {
  if (!searchText.value) return allIcons
  return allIcons.filter((name) => name.toLowerCase().includes(searchText.value.toLowerCase()))
})

function filterIcons() {
  // computed handles filtering
}

function selectIcon(icon: string) {
  emit('update:modelValue', icon)
  showPanel.value = false
}

function handleClickOutside(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest('.icon-select')
  if (!el) showPanel.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.icon-select {
  position: relative;
  width: 100%;
}

.icon-panel {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 9999;
  width: 360px;
  max-height: 300px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 8px;
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #f5f7fa;
  }

  &.active {
    background: #ecf5ff;
    color: $primary-color;
  }
}

.icon-name {
  font-size: 10px;
  margin-top: 2px;
  text-align: center;
  word-break: break-all;
  color: #909399;
  line-height: 1.2;
}
</style>
