<template>
  <view class="day-list">
    <TripDayItem
      v-for="[dayIndex, list] in days"
      :key="dayIndex"
      :day-index="dayIndex"
      :waypoints="list"
      :active="dayIndex === tripStore.activeDayIndex"
      :collapsed="collapsedDays.includes(dayIndex)"
      :active-waypoint-id="tripStore.activeWaypointId"
      @toggle="toggleDay"
      @remove="onRemoveDay"
      @select-waypoint="onSelectWaypoint"
      @remove-waypoint="onRemoveWaypoint"
      @add-place="onAddPlace"
    />

    <wd-button block plain custom-class="day-list__add" @click="onAddDay">
      + 添加新的一天
    </wd-button>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTripStore } from '@/stores/tripStore'
import TripDayItem from './TripDayItem.vue'

const emit = defineEmits<{
  (e: 'add-place', dayIndex: number): void
}>()

const tripStore = useTripStore()

/** 用数组而不是 Set/Map，读改都直观，也不依赖集合类型的响应式细节 */
const collapsedDays = ref<number[]>([])

const days = computed(() => Array.from(tripStore.waypointsByDay.entries()))

function toggleDay(dayIndex: number): void {
  collapsedDays.value = collapsedDays.value.includes(dayIndex)
    ? collapsedDays.value.filter((d) => d !== dayIndex)
    : [...collapsedDays.value, dayIndex]
}

function onAddDay(): void {
  tripStore.addDay()
}

function onRemoveDay(dayIndex: number): void {
  tripStore.removeDay(dayIndex)
  collapsedDays.value = collapsedDays.value.filter((d) => d !== dayIndex)
}

function onSelectWaypoint(id: string): void {
  tripStore.activeWaypointId = tripStore.activeWaypointId === id ? null : id
}

function onRemoveWaypoint(id: string): void {
  tripStore.removeWaypoint(id)
}

/** 选定某天后把地图露出来，用户接着点地图即可落点 */
function onAddPlace(dayIndex: number): void {
  tripStore.setActiveDay(dayIndex)
  emit('add-place', dayIndex)
}
</script>

<style lang="scss" scoped>
.day-list {
  padding: $mb-gap-md;
}

:deep(.day-list__add) {
  margin-top: $mb-gap-sm;
}
</style>
