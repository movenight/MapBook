<template>
  <aside class="trip-sidebar" :style="{ width: sidebarWidth + 'px' }">
    <div class="sidebar-header">
      <el-input
        v-model="tripStore.currentTrip.title"
        placeholder="路书标题"
        size="large"
        class="title-input"
        @blur="tripStore.saveCurrent()"
      />
      <el-input
        v-model="tripStore.currentTrip.description"
        placeholder="描述（可选）"
        type="textarea"
        :rows="2"
        resize="none"
        class="desc-input"
        @blur="tripStore.saveCurrent()"
      />
    </div>
    <div class="sidebar-body">
      <TripDayPanel
        v-for="day in dayCount"
        :key="day"
        :day-index="day"
      />
    </div>
    <div class="sidebar-footer">
      <el-button class="add-day-btn" @click="tripStore.addDay()">
        + 添加新的一天
      </el-button>
    </div>
    <div class="sidebar-resizer" @mousedown="onResizeStart" />
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTripStore } from '@/stores/tripStore'
import TripDayPanel from './TripDayPanel.vue'

const tripStore = useTripStore()
const sidebarWidth = ref(360)

const dayCount = computed(() => tripStore.currentTrip.dayCount || 1)

function onResizeStart(e: MouseEvent) {
  const startX = e.clientX
  const startWidth = sidebarWidth.value
  const onMove = (ev: MouseEvent) => {
    const w = startWidth + (ev.clientX - startX)
    sidebarWidth.value = Math.max(280, Math.min(480, w))
  }
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
</script>

<style lang="less" scoped>
.trip-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.title-input {
  :deep(.el-input__inner) {
    font-size: 18px;
    font-weight: 600;
  }
}

.desc-input {
  margin-top: 8px;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.add-day-btn {
  width: 100%;
  border-style: dashed;
}

.sidebar-resizer {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;

  &:hover {
    background: #1677ff33;
  }
}
</style>
