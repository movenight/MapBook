<template>
  <div class="trip-list-view">
    <div class="list-header">
      <h2>我的路书</h2>
      <el-button type="primary" @click="$router.push('/trips/new')">
        创建路书
      </el-button>
    </div>
    <EmptyState v-if="trips.length === 0" message="还没有路书，点击上方按钮创建第一条吧" />
    <div v-else class="trip-grid">
      <TripCard
        v-for="trip in trips"
        :key="trip.id"
        :trip="trip"
        @click="$router.push(`/trips/${trip.id}`)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import type { Trip } from '@/types/trip'
import TripCard from '@/components/trip/TripCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const trips = ref<Trip[]>([])

onMounted(async () => {
  const { data } = await supabase
    .from('trips')
    .select('*')
    .order('updated_at', { ascending: false })

  if (data) trips.value = data
})
</script>

<style lang="less" scoped>
.trip-list-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 24px;
  }
}

.trip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
</style>
