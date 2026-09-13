<template>
  <view class="home">
    <view class="home__hero">
      <text class="home__title">MapBook</text>
      <text class="home__subtitle">在地图上规划你的旅程</text>
    </view>

    <view class="home__actions">
      <wd-button type="primary" size="large" block custom-class="home__btn" @click="goCreate">
        创建路书
      </wd-button>
      <wd-button size="large" block plain custom-class="home__btn" @click="goTrips">
        我的路书
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

async function goCreate(): Promise<void> {
  const canContinue = await userStore.requireLogin()
  if (canContinue) {
    uni.navigateTo({ url: '/pages/editor/index' })
  }
}

async function goTrips(): Promise<void> {
  const canContinue = await userStore.requireLogin()
  if (canContinue) {
    uni.navigateTo({ url: '/pages/trips/index' })
  }
}
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - var(--window-top, 0px) - var(--window-bottom, 0px));
  padding: 0 $mb-gap-xl;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.home__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 96rpx;
}

.home__title {
  font-size: 96rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  color: $mb-text-inverse;
}

.home__subtitle {
  margin-top: $mb-gap-md;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.85);
}

.home__actions {
  width: 100%;
  max-width: 560rpx;
}

:deep(.home__btn) {
  margin-bottom: $mb-gap-md;
}
</style>
