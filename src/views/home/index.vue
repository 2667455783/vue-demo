<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6" v-for="entry in entries" :key="entry.title">
        <el-card shadow="hover" class="entry-card">
          <div class="entry-content">
            <div class="entry-icon" :style="{ backgroundColor: entry.color }">
              <el-icon :size="28" color="#fff"><component :is="entry.icon" /></el-icon>
            </div>
            <div class="entry-info">
              <div class="entry-value">{{ entry.value }}</div>
              <div class="entry-title">{{ entry.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getHomeEntriesApi } from '@/api/dashboard'
import type { DashboardEntry } from '@/api/dashboard'

const entries = ref<DashboardEntry[]>([])

onMounted(async () => {
  entries.value = await getHomeEntriesApi()
})
</script>

<style scoped lang="scss">
.entry-card {
  margin-bottom: 20px;
}

.entry-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.entry-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.entry-info {
  flex: 1;
}

.entry-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.entry-title {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
</style>
