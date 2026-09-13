<template>
  <view class="trip-card" @click="emit('click', trip.id)">
    <view class="trip-card__cover">
      <text class="trip-card__cover-text">MapBook</text>
    </view>

    <view class="trip-card__body">
      <text class="trip-card__title">{{ trip.title || '未命名路书' }}</text>
      <text v-if="trip.description" class="trip-card__desc">{{ trip.description }}</text>

      <view class="trip-card__meta">
        <text class="trip-card__meta-item">{{ trip.dayCount }} 天</text>
        <text class="trip-card__meta-item">{{ updatedLabel }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Trip } from '@/types/trip'
import { formatDate } from '@/utils/format'

const props = defineProps<{ trip: Trip }>()

const emit = defineEmits<{
  (e: 'click', id: string): void
}>()

const updatedLabel = computed(() => {
  const label = formatDate(props.trip.updatedAt)
  return label ? `更新于 ${label}` : '尚未保存'
})
</script>

<style lang="scss" scoped>
.trip-card {
  margin-bottom: $mb-gap-md;
  background: $mb-bg-white;
  border-radius: $mb-radius-md;
  overflow: hidden;

  &:active {
    background: $mb-bg-lighter;
  }
}

.trip-card__cover {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.trip-card__cover-text {
  font-size: 36rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  color: rgba(255, 255, 255, 0.9);
}

.trip-card__body {
  padding: $mb-gap-md;
}

.trip-card__title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: $mb-text-primary;
}

.trip-card__desc {
  display: block;
  margin-top: $mb-gap-xs;
  font-size: 26rpx;
  color: $mb-text-secondary;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.trip-card__meta {
  display: flex;
  justify-content: space-between;
  margin-top: $mb-gap-md;
}

.trip-card__meta-item {
  font-size: 24rpx;
  color: $mb-text-disabled;
}
</style>
