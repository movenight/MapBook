<template>
  <view
    class="waypoint"
    :class="{ 'waypoint--active': active }"
    @click="emit('select', waypoint.id)"
  >
    <text class="waypoint__icon">{{ icon }}</text>

    <view class="waypoint__body">
      <text class="waypoint__name">{{ waypoint.name || '未命名地点' }}</text>
      <text v-if="waypoint.address" class="waypoint__address">{{ waypoint.address }}</text>
    </view>

    <!--
      原 Web 版把删除按钮藏在 :hover 里，触屏没有 hover，
      小程序端改为常显。
    -->
    <view class="waypoint__action" @click.stop="emit('remove', waypoint.id)">
      <wd-icon name="delete" size="18px" color="#ff4d4f" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Waypoint } from '@/types/waypoint'
import { WAYPOINT_TYPE_ICONS, WAYPOINT_TYPE_LABELS } from '@/types/waypoint'

const props = defineProps<{
  waypoint: Waypoint
  active?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'remove', id: string): void
}>()

/** 统一走常量表。原 Web 版侧边栏自己写了一套 v-if 分支，漏掉了 dining */
const icon = computed(() => WAYPOINT_TYPE_ICONS[props.waypoint.type] ?? '📍')
const typeLabel = computed(() => WAYPOINT_TYPE_LABELS[props.waypoint.type] ?? '')
</script>

<style lang="scss" scoped>
.waypoint {
  display: flex;
  align-items: center;
  padding: $mb-gap-sm $mb-gap-md;
  border-radius: $mb-radius-sm;

  &--active {
    background: rgba(22, 119, 255, 0.08);
  }
}

.waypoint__icon {
  flex-shrink: 0;
  width: 40rpx;
  font-size: 30rpx;
  line-height: 1;
}

.waypoint__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  margin-left: $mb-gap-sm;
}

.waypoint__name {
  font-size: 28rpx;
  color: $mb-text-primary;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.waypoint__address {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: $mb-text-disabled;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.waypoint__action {
  flex-shrink: 0;
  padding: $mb-gap-xs $mb-gap-sm;
}
</style>
