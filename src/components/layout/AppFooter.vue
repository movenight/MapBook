<template>
  <footer class="app-footer">
    <span>总距离：{{ formattedDistance }} | 总时长：{{ formattedDuration }}</span>
    <span class="save-status">{{ saveStatus }}</span>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTripStore } from '@/stores/tripStore'

const tripStore = useTripStore()

const formattedDistance = computed(() => {
  const m = tripStore.totalDistance
  if (m < 1000) return `${m}m`
  return `${(m / 1000).toFixed(1)}km`
})

const formattedDuration = computed(() => {
  const s = tripStore.totalDuration
  const h = Math.floor(s / 3600)
  const min = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h${min}min`
  return `${min}min`
})

const saveStatus = computed(() => tripStore.saveStatus)
</script>

<style lang="less" scoped>
.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 16px;
  background: #fafafa;
  border-top: 1px solid #e8e8e8;
  font-size: 12px;
  color: #999;
}

.save-status {
  color: #52c41a;
}
</style>
