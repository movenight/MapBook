<template>
  <view class="meta">
    <view class="meta__row">
      <wd-input
        v-model="title"
        placeholder="给这次旅行起个名字"
        no-border
        custom-class="meta__title"
        @blur="commit"
      />
    </view>

    <view class="meta__row">
      <wd-textarea
        v-model="description"
        placeholder="描述（可选）"
        :maxlength="200"
        :auto-height="true"
        custom-class="meta__desc"
        @blur="commit"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTripStore } from '@/stores/tripStore'

const tripStore = useTripStore()

/*
 * 用本地副本 + blur 时提交，而不是直接 v-model 到 store：
 * 原 Web 版直接双向绑定 store 状态，每敲一个字都会触发一次防抖保存重排。
 */
const title = ref(tripStore.currentTrip.title)
const description = ref(tripStore.currentTrip.description)

// 切换/加载路书时把本地副本同步过来
watch(
  () => tripStore.currentTrip.id,
  () => {
    title.value = tripStore.currentTrip.title
    description.value = tripStore.currentTrip.description
  }
)

function commit(): void {
  const changed =
    title.value !== tripStore.currentTrip.title ||
    description.value !== tripStore.currentTrip.description

  if (changed) {
    tripStore.updateTrip({ title: title.value, description: description.value })
  }
}
</script>

<style lang="scss" scoped>
.meta {
  padding: 0 $mb-gap-md $mb-gap-md;
}

.meta__row {
  border-bottom: 1rpx solid $mb-border-light;
}

:deep(.meta__title) {
  font-size: 32rpx;
  font-weight: 600;
  padding: $mb-gap-md 0;
}

:deep(.meta__desc) {
  padding: $mb-gap-sm 0;
}
</style>
