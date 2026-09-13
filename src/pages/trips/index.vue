<template>
  <view class="trips">
    <view class="trips__header">
      <text class="trips__title">我的路书</text>
      <wd-button type="primary" size="small" @click="goCreate">新建</wd-button>
    </view>

    <scroll-view class="trips__list" scroll-y>
      <view v-if="loading" class="trips__hint">
        <text class="trips__hint-text">加载中…</text>
      </view>

      <EmptyState
        v-else-if="error"
        icon="⚠️"
        :message="error"
      />

      <EmptyState
        v-else-if="trips.length === 0"
        icon="🗺️"
        message="还没有路书，点右上角「新建」创建第一条吧"
      />

      <view v-else class="trips__cards">
        <TripCard
          v-for="trip in trips"
          :key="trip.id"
          :trip="trip"
          @click="goEdit"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import EmptyState from '@/components/common/EmptyState.vue'
import TripCard from '@/components/trip/TripCard.vue'
import { getBackend } from '@/services/backend'
import { useUserStore } from '@/stores/userStore'
import type { Trip } from '@/types/trip'

const userStore = useUserStore()

const trips = ref<Trip[]>([])
const loading = ref(false)
const error = ref('')

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    trips.value = await getBackend().listTrips()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '读取路书列表失败'
    trips.value = []
  } finally {
    loading.value = false
  }
}

// 用 onShow 而不是 onLoad：从编辑器返回时也要刷新，才能看到刚改的标题
onShow(async () => {
  const canContinue = await userStore.requireLogin()
  if (!canContinue) return
  await load()
})

onPullDownRefresh(async () => {
  await load()
  uni.stopPullDownRefresh()
})

function goCreate(): void {
  uni.navigateTo({ url: '/pages/editor/index' })
}

function goEdit(id: string): void {
  uni.navigateTo({ url: `/pages/editor/index?id=${id}` })
}
</script>

<style lang="scss" scoped>
.trips {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--window-top, 0px) - var(--window-bottom, 0px));
  background: $mb-bg-light;
}

.trips__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $mb-gap-md;
  background: $mb-bg-white;
  border-bottom: 1rpx solid $mb-border-light;
}

.trips__title {
  font-size: 34rpx;
  font-weight: 600;
  color: $mb-text-primary;
}

.trips__list {
  flex: 1;
  overflow: hidden;
}

.trips__cards {
  padding: $mb-gap-md;
}

.trips__hint {
  padding: 96rpx 0;
  text-align: center;
}

.trips__hint-text {
  font-size: 28rpx;
  color: $mb-text-disabled;
}
</style>
