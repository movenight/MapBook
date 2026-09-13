<template>
  <view class="empty-state">
    <text class="empty-state__icon">{{ icon }}</text>
    <text class="empty-state__message">{{ message }}</text>
    <view v-if="$slots.default" class="empty-state__extra">
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string
    icon?: string
  }>(),
  { icon: '📭' }
)
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96rpx $mb-gap-lg;
}

.empty-state__icon {
  font-size: 80rpx;
  line-height: 1;
}

.empty-state__message {
  margin-top: $mb-gap-md;
  font-size: 28rpx;
  color: $mb-text-disabled;
  text-align: center;
}

.empty-state__extra {
  margin-top: $mb-gap-lg;
}
</style>
