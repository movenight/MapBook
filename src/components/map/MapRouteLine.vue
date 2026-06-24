<template>
  <div class="map-route-line" />
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useTripStore } from '@/stores/tripStore'
import { useMapStore } from '@/stores/mapStore'
import { loadAMap } from '@/services/amap'
import { drivingRoute } from '@/services/amapHttp'
import { ROUTE_COLORS, WAYPOINT_TYPE_ICONS } from '@/utils/constants'

const tripStore = useTripStore()
const mapStore = useMapStore()

const polylines = ref<any[]>([])
const markers = ref<any[]>([])
let routeTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => tripStore.waypointsByDay,
  () => {
    if (routeTimer) clearTimeout(routeTimer)
    routeTimer = setTimeout(() => drawRoutesAndMarkers(), 600)
  },
  { deep: true }
)

async function drawRoutesAndMarkers() {
  const map = mapStore.mapInstance
  if (!map) return

  const AMap = await loadAMap()

  clearOverlays()

  let totalDistance = 0
  let totalDuration = 0

  for (const [day, waypoints] of tripStore.waypointsByDay.entries()) {
    const color = ROUTE_COLORS[day % ROUTE_COLORS.length]
    const sorted = waypoints.sort((a, b) => a.orderIndex - b.orderIndex)

    for (const wp of sorted) {
      const icon = WAYPOINT_TYPE_ICONS[wp.type] || '📍'
      const markerEl = new AMap.Marker({
        position: [wp.lng, wp.lat],
        label: { content: icon, offset: new AMap.Pixel(-10, -10) },
        anchor: 'center',
      })
      markerEl.on('click', () => {
        tripStore.activeWaypointId = wp.id
      })
      map.add(markerEl)
      markers.value.push(markerEl)
    }

    if (sorted.length >= 2) {
      const origin = { lng: sorted[0].lng, lat: sorted[0].lat }
      const dest = { lng: sorted[sorted.length - 1].lng, lat: sorted[sorted.length - 1].lat }
      const via = sorted.slice(1, -1).map((wp) => ({ lng: wp.lng, lat: wp.lat }))

      try {
        const route = await drivingRoute(origin, dest, via)
        totalDistance += route.distance
        totalDuration += route.duration

        const path = route.polyline.map(([lng, lat]) => new AMap.LngLat(lng, lat))
        const polylineEl = new AMap.Polyline({
          path,
          strokeColor: color,
          strokeWeight: 6,
          strokeOpacity: 0.85,
          lineJoin: 'round',
        })
        map.add(polylineEl)
        polylines.value.push(polylineEl)
      } catch {
        const fallbackPath = sorted.map((wp) => new AMap.LngLat(wp.lng, wp.lat))
        const polylineEl = new AMap.Polyline({
          path: fallbackPath,
          strokeColor: color,
          strokeWeight: 2,
          strokeOpacity: 0.5,
          strokeStyle: 'dashed',
        })
        map.add(polylineEl)
        polylines.value.push(polylineEl)
      }
    }
  }

  tripStore.totalDistance = totalDistance
  tripStore.totalDuration = totalDuration
}

function clearOverlays() {
  const map = mapStore.mapInstance
  if (!map) return
  for (const p of polylines.value) {
    map.remove(p)
  }
  for (const m of markers.value) {
    map.remove(m)
  }
  polylines.value = []
  markers.value = []
}
</script>
