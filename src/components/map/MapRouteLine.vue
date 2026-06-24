<template>
  <div class="map-route-line" />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useTripStore } from '@/stores/tripStore'
import { useMapStore } from '@/stores/mapStore'
import { loadAMap } from '@/services/amap'
import { ROUTE_COLORS } from '@/utils/constants'

const tripStore = useTripStore()
const mapStore = useMapStore()

watch(
  () => tripStore.waypointsByDay,
  async () => {
    const map = mapStore.mapInstance
    if (!map) return

    map.clearMap()

    for (const [day, waypoints] of tripStore.waypointsByDay.entries()) {
      if (waypoints.length < 2) continue

      const AMap = await loadAMap()
      const color = ROUTE_COLORS[day % ROUTE_COLORS.length]

      const path = waypoints.map((wp) => new AMap.LngLat(wp.lng, wp.lat))

      const polyline = new AMap.Polyline({
        path,
        strokeColor: color,
        strokeWeight: 6,
        strokeOpacity: 0.8,
        lineJoin: 'round',
      })
      map.add(polyline)
    }
  },
  { deep: true }
)
</script>
