<template>
  <view class="search-bar">
    <wd-input
      v-model="keyword"
      placeholder="搜索地点，例如「西湖」"
      prefix-icon="search"
      clearable
      @input="onInput"
      @clear="onClear"
    />

    <!--
      小程序 <map> 是原生组件，普通 view 盖在它上面并不可靠。
      所以有结果时由父级把地图换成这块列表，而不是做浮层。
    -->
    <view v-if="expanded" class="search-panel">
      <scroll-view class="search-panel__list" scroll-y>
        <view v-if="loading" class="search-panel__hint">搜索中…</view>
        <view v-else-if="error" class="search-panel__hint search-panel__hint--error">
          {{ error }}
        </view>
        <view v-else-if="results.length === 0" class="search-panel__hint">
          没有找到匹配的地点
        </view>
        <view
          v-for="poi in results"
          :key="poi.id || `${poi.lng},${poi.lat}`"
          class="search-panel__item"
          @click="onSelect(poi)"
        >
          <text class="search-panel__name">{{ poi.name }}</text>
          <text class="search-panel__address">{{ poi.district }}{{ poi.address }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { inputTips, type PoiTip } from '@/services/amap'
import { SEARCH_DEBOUNCE_MS } from '@/utils/constants'

const emit = defineEmits<{
  (e: 'select', poi: PoiTip): void
  (e: 'update:expanded', value: boolean): void
}>()

const keyword = ref('')
const results = ref<PoiTip[]>([])
const loading = ref(false)
const error = ref('')
const expanded = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
/** 丢弃过期请求的结果，避免快速输入时结果串台 */
let searchToken = 0

function setExpanded(next: boolean): void {
  if (expanded.value === next) return
  expanded.value = next
  emit('update:expanded', next)
}

function reset(): void {
  results.value = []
  error.value = ''
  loading.value = false
  setExpanded(false)
}

function onInput(): void {
  if (debounceTimer) clearTimeout(debounceTimer)

  const value = keyword.value.trim()
  if (!value) {
    searchToken += 1
    reset()
    return
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void runSearch(value)
  }, SEARCH_DEBOUNCE_MS)
}

async function runSearch(value: string): Promise<void> {
  const token = ++searchToken
  loading.value = true
  error.value = ''
  setExpanded(true)

  try {
    const list = await inputTips(value)
    if (token !== searchToken) return
    results.value = list
  } catch (e) {
    if (token !== searchToken) return
    results.value = []
    error.value = e instanceof Error ? e.message : '搜索失败'
  } finally {
    if (token === searchToken) loading.value = false
  }
}

function onClear(): void {
  keyword.value = ''
  searchToken += 1
  reset()
}

function onSelect(poi: PoiTip): void {
  emit('select', poi)
  keyword.value = ''
  reset()
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = null
  searchToken += 1
})
</script>

<style lang="scss" scoped>
.search-bar {
  background: $mb-bg-white;
  border-bottom: 1rpx solid $mb-border-light;
}

.search-panel {
  border-top: 1rpx solid $mb-border-light;
}

.search-panel__list {
  max-height: 60vh;
}

.search-panel__hint {
  padding: $mb-gap-lg $mb-gap-md;
  text-align: center;
  font-size: 26rpx;
  color: $mb-text-disabled;

  &--error {
    color: $mb-danger;
  }
}

.search-panel__item {
  display: flex;
  flex-direction: column;
  padding: $mb-gap-md;
  border-bottom: 1rpx solid $mb-border-light;

  &:active {
    background: $mb-bg-lighter;
  }
}

.search-panel__name {
  font-size: 30rpx;
  color: $mb-text-primary;
}

.search-panel__address {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: $mb-text-disabled;
}
</style>
