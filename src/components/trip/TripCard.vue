<template>
  <div class="trip-card" @click="$emit('click')">
    <div class="card-cover">
      <span class="card-placeholder">MapBook</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ trip.title || '未命名路书' }}</h3>
      <p v-if="trip.description" class="card-desc">{{ trip.description }}</p>
      <div class="card-meta">
        <span>{{ trip.dayCount || 1 }} 天</span>
        <span>{{ formattedDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Trip } from '@/types/trip'
import dayjs from 'dayjs'

const props = defineProps<{
  trip: Trip
}>()

defineEmits<{
  click: []
}>()

const formattedDate = computed(() => {
  if (props.trip.updated_at) {
    return dayjs(props.trip.updated_at).format('YYYY-MM-DD')
  }
  return ''
})
</script>

<style lang="less" scoped>
.trip-card {
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

.card-cover {
  height: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-placeholder {
  font-size: 24px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.card-body {
  padding: 16px;
}

.card-title {
  margin: 0 0 6px;
  font-size: 16px;
  color: #333;
}

.card-desc {
  margin: 0 0 10px;
  font-size: 13px;
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #bbb;
}
</style>
