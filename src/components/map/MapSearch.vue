<template>
  <div class="map-search">
    <el-input
      v-model="keyword"
      placeholder="搜索地点..."
      :prefix-icon="Search"
      size="default"
      clearable
      @input="onSearch"
    />
    <div v-if="results.length > 0" class="search-results">
      <div
        v-for="item in results"
        :key="item.id"
        class="search-item"
        @click="selectResult(item)"
      >
        <div class="item-name">{{ item.name }}</div>
        <div class="item-addr">{{ item.address }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useMapStore } from '@/stores/mapStore'
import { loadAMap } from '@/services/amap'

const emit = defineEmits<{
  select: [poi: { lng: number; lat: number; name: string; address: string }]
}>()

const keyword = ref('')
const results = ref<{ id: string; name: string; address: string; lng: number; lat: number }[]>([])
let timer: ReturnType<typeof setTimeout> | null = null

async function onSearch() {
  if (timer) clearTimeout(timer)
  if (!keyword.value.trim()) {
    results.value = []
    return
  }
  timer = setTimeout(async () => {
    const AMap = await loadAMap()
    const auto = new AMap.AutoComplete({ city: '全国' })
    auto.search(keyword.value, (_status: string, result: { tips: AMap.AutoComplete.Tip[] }) => {
      results.value = (result.tips || [])
        .filter((t) => t.location)
        .map((t) => ({
          id: t.id,
          name: t.name,
          address: t.district + t.address,
          lng: t.location!.lng,
          lat: t.location!.lat,
        }))
    })
  }, 500)
}

function selectResult(item: { lng: number; lat: number; name: string; address: string }) {
  emit('select', item)
  results.value = []
  keyword.value = ''
}
</script>

<style lang="less" scoped>
.map-search {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  width: 320px;
}

.search-results {
  margin-top: 4px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  max-height: 300px;
  overflow-y: auto;
}

.search-item {
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background: #f5f7fa;
  }

  .item-name {
    font-size: 14px;
    color: #333;
  }

  .item-addr {
    font-size: 12px;
    color: #999;
    margin-top: 2px;
  }
}
</style>
