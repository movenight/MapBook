<template>
  <div class="trip-editor-view">
    <div class="editor-layout">
      <TripSidebar />
      <MapContainer class="editor-map" />
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTripStore } from '@/stores/tripStore'
import TripSidebar from '@/components/trip/TripSidebar.vue'
import MapContainer from '@/components/map/MapContainer.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const route = useRoute()
const tripStore = useTripStore()

onMounted(async () => {
  const id = route.params.id as string | undefined
  if (id) {
    await tripStore.loadTrip(id)
  } else {
    tripStore.initNew()
  }
})
</script>

<style lang="less" scoped>
.trip-editor-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-map {
  flex: 1;
}
</style>
