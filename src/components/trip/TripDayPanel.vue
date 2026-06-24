<template>
  <div class="trip-day-panel">
    <div class="day-header" @click="collapsed = !collapsed">
      <el-icon class="collapse-icon">
        <ArrowRight v-if="collapsed" />
        <ArrowDown v-else />
      </el-icon>
      <span class="day-label">Day {{ dayIndex }}</span>
      <span class="day-count">{{ waypoints.length }} 个地点</span>
      <el-button
        v-if="dayIndex > 1"
        link
        size="small"
        type="danger"
        class="day-delete"
        @click.stop="tripStore.removeDay(dayIndex)"
      >
        删除
      </el-button>
    </div>
    <div v-show="!collapsed" class="day-body">
      <TripWaypointItem
        v-for="wp in waypoints"
        :key="wp.id"
        :waypoint="wp"
      />
      <div
        class="add-waypoint"
        @click="tripStore.setActiveDay(dayIndex)"
      >
        点击地图添加地点
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowRight, ArrowDown } from '@element-plus/icons-vue'
import { useTripStore } from '@/stores/tripStore'
import TripWaypointItem from './TripWaypointItem.vue'

const props = defineProps<{
  dayIndex: number
}>()

const tripStore = useTripStore()
const collapsed = ref(false)

const waypoints = computed(() =>
  tripStore.currentTrip.waypoints
    .filter((wp) => wp.dayIndex === props.dayIndex)
    .sort((a, b) => a.orderIndex - b.orderIndex)
)
</script>

<style lang="less" scoped>
.trip-day-panel {
  margin: 0 8px 4px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.day-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #fafafa;
  cursor: pointer;
  user-select: none;
  gap: 6px;
}

.collapse-icon {
  font-size: 14px;
  color: #999;
}

.day-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.day-count {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

.day-delete {
  margin-left: 8px;
}

.day-body {
  padding: 4px 0;
}

.add-waypoint {
  margin: 8px 12px;
  padding: 8px;
  text-align: center;
  font-size: 12px;
  color: #1677ff;
  border: 1px dashed #1677ff33;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #f0f5ff;
  }
}
</style>
