<template>
  <div class="waypoint-item" :class="{ active: isActive }">
    <div class="wp-icon">
      <span v-if="waypoint.type === 'departure'">🚩</span>
      <span v-else-if="waypoint.type === 'destination'">🎯</span>
      <span v-else-if="waypoint.type === 'lodgment'">🏨</span>
      <span v-else>📍</span>
    </div>
    <div class="wp-info">
      <div class="wp-name">{{ waypoint.name || '未命名地点' }}</div>
      <div v-if="waypoint.notes" class="wp-notes">{{ waypoint.notes }}</div>
    </div>
    <el-button
      link
      size="small"
      type="danger"
      class="wp-delete"
      @click="tripStore.removeWaypoint(waypoint.id)"
    >
      <el-icon><Delete /></el-icon>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import type { Waypoint } from '@/types/waypoint'
import { useTripStore } from '@/stores/tripStore'

const props = defineProps<{
  waypoint: Waypoint
}>()

const tripStore = useTripStore()

const isActive = computed(() => tripStore.activeWaypointId === props.waypoint.id)
</script>

<style lang="less" scoped>
.waypoint-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
  gap: 10px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f5f7fa;
  }

  &.active {
    background: #e6f0ff;
  }
}

.wp-icon {
  font-size: 16px;
  line-height: 22px;
}

.wp-info {
  flex: 1;
  min-width: 0;
}

.wp-name {
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wp-notes {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.wp-delete {
  opacity: 0;
  transition: opacity 0.2s;

  .waypoint-item:hover & {
    opacity: 1;
  }
}
</style>
