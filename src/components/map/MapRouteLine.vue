<template>
  <div class="map-route-line" />
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useTripStore } from '@/stores/tripStore'
import { useMapStore } from '@/stores/mapStore'
import { loadAMap } from '@/services/amap'
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
    routeTimer = setTimeout(() => drawRoutesAndMarkers(), 800)
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
      const path = await getRoutePath(AMap, sorted)
      if (path) {
        const polylineEl = new AMap.Polyline({
          path,
          strokeColor: color,
          strokeWeight: 6,
          strokeOpacity: 0.85,
          lineJoin: 'round',
        })
        map.add(polylineEl)
        polylines.value.push(polylineEl)
      } else {
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

function getRoutePath(
  AMap: any,
  sorted: { lng: number; lat: number }[]
): Promise<any[] | null> {
  return new Promise((resolve) => {
    const origin = new AMap.LngLat(sorted[0].lng, sorted[0].lat)
    const dest = new AMap.LngLat(sorted[sorted.length - 1].lng, sorted[sorted.length - 1].lat)
    const via = sorted.slice(1, -1).map((wp) => new AMap.LngLat(wp.lng, wp.lat))

    const driving = new AMap.Driving({ policy: 0 })

    const opts = via.length > 0 ? { waypoints: via } : {}

    driving.search(origin, dest, opts, (status: string, result: any) => {
      if (status === 'complete' && result?.routes?.length > 0) {
        const route = result.routes[0]
        const path: any[] = []
        for (const step of route.steps || []) {
          const stepPath = step.path || []
          for (const p of stepPath) {
            path.push(new AMap.LngLat(p.lng, p.lat))
          }
        }
        tripStore.totalDistance = route.distance || 0
        tripStore.totalDuration = route.time || 0
        resolve(path)
      } else {
        resolve(null)
      }
    })
  })
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
