<template>
  <view class="day" :class="{ 'day--active': active }">
    <view class="day__header" @click="emit('toggle', dayIndex)">
      <wd-icon :name="collapsed ? 'arrow-right' : 'arrow-down'" size="14px" color="#666666" />
      <text class="day__title">Day {{ dayIndex }}</text>
      <text class="day__count">{{ waypoints.length }} 个地点</text>

      <view v-if="dayIndex > 1" class="day__remove" @click.stop="emit('remove', dayIndex)">
        <text class="day__remove-text">删除</text>
      </view>
    </view>

    <view v-if="!collapsed" class="day__body">
      <WaypointItem
        v-for="waypoint in waypoints"
        :key="waypoint.id"
        :waypoint="waypoint"
        :active="waypoint.id === activeWaypointId"
        @select="emit('select-waypoint', $event)"
        @remove="emit('remove-waypoint', $event)"
      />

      <view class="day__add" @click="emit('add-place', dayIndex)">
        <text class="day__add-text">点击地图添加地点</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Waypoint } from '@/types/waypoint'
import WaypointItem from './WaypointItem.vue'

defineProps<{
  dayIndex: number
  waypoints: Waypoint[]
  active?: boolean
  collapsed?: boolean
  activeWaypointId?: string | null
}>()

const emit = defineEmits<{
  (e: 'toggle', dayIndex: number): void
  (e: 'remove', dayIndex: number): void
  (e: 'select-waypoint', id: string): void
  (e: 'remove-waypoint', id: string): void
  (e: 'add-place', dayIndex: number): void
}>()
</script>

<style lang="scss" scoped>
.day {
  margin-bottom: $mb-gap-md;
  border: 1rpx solid $mb-border-light;
  border-radius: $mb-radius-md;
  overflow: hidden;

  &--active {
    border-color: rgba(22, 119, 255, 0.5);
  }
}

.day__header {
  display: flex;
  align-items: center;
  gap: $mb-gap-sm;
  padding: $mb-gap-md;
  background: $mb-bg-lighter;
}

.day__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $mb-text-primary;
}

.day__count {
  margin-left: auto;
  font-size: 24rpx;
  color: $mb-text-disabled;
}

.day__remove {
  padding: 4rpx $mb-gap-sm;
}

.day__remove-text {
  font-size: 24rpx;
  color: $mb-danger;
}

.day__body {
  padding: $mb-gap-xs 0;
}

.day__add {
  margin: $mb-gap-sm $mb-gap-md;
  padding: $mb-gap-md;
  border: 1rpx dashed $mb-border;
  border-radius: $mb-radius-sm;
  text-align: center;
}

.day__add-text {
  font-size: 24rpx;
  color: $mb-text-disabled;
}
</style>
