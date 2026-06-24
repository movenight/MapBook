<template>
  <div class="map-route-line" />
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useTripStore } from '@/stores/tripStore'
import { useMapStore } from '@/stores/mapStore'
import { loadAMap } from '@/services/amap'
import type { Waypoint } from '@/types/waypoint'
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
    routeTimer = setTimeout(() => drawRoutesAndMarkers(), 500)
  },
  { deep: true }
)

async function drawRoutesAndMarkers() {
  const map = mapStore.mapInstance
  if (!map) return

  const AMap = await loadAMap()

  clearOverlays()

  const allWaypoints: { wp: Waypoint; color: string }[] = []

  for (const [day, waypoints] of tripStore.waypointsByDay.entries()) {
    const color = ROUTE_COLORS[day % ROUTE_COLORS.length]

    for (const wp of waypoints) {
      allWaypoints.push({ wp, color })
    }

    if (waypoints.length < 2) continue

    const sorted = waypoints.sort((a, b) => a.orderIndex - b.orderIndex)
    const origin = new AMap.LngLat(sorted[0].lng, sorted[0].lat)
    const destination = new AMap.LngLat(sorted[sorted.length - 1].lng, sorted[sorted.length - 1].lat)
    const viaWaypoints = sorted.slice(1, -1).map((wp) => new AMap.LngLat(wp.lng, wp.lat))

    try {
      const routePath = await getDrivingRoute(AMap, origin, destination, viaWaypoints)
      const polyline = new AMap.Polyline({
        path: routePath,
        strokeColor: color,
        strokeWeight: 6,
        strokeOpacity: 0.8,
        lineJoin: 'round',
      })
      map.add(polyline)
      polylines.value.push(polyline)
    } catch {
      const path = sorted.map((wp) => new AMap.LngLat(wp.lng, wp.lat))
      const polyline = new AMap.Polyline({
        path,
        strokeColor: color,
        strokeWeight: 3,
        strokeOpacity: 0.5,
        lineJoin: 'round',
        strokeStyle: 'dashed',
        isOutline: true,
      })
      map.add(polyline)
      polylines.value.push(polyline)
    }
  }

  for (const { wp, color } of allWaypoints) {
    const icon = WAYPOINT_TYPE_ICONS[wp.type] || '📍'
    const marker = new AMap.Marker({
      position: [wp.lng, wp.lat],
      label: {
        content: icon,
        offset: new AMap.Pixel(-10, -10),
      },
      anchor: 'center',
    })
    marker.on('click', () => {
      tripStore.activeWaypointId = wp.id
    })
    map.add(marker)
    markers.value.push(marker)
  }
}

function getDrivingRoute(
  AMap: any,
  origin: any,
  destination: any,
  waypoints: any[]
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const driving = new AMap.Driving({ policy: 0 })
    const via = waypoints.map((wp: any) => ({
      keyword: '',
      coordinate: [wp.lng, wp.lat],
    }))

    driving.search(origin, destination, { waypoints: via }, (status: string, result: any) => {
      if (status === 'complete' && result.routes?.length > 0) {
        const steps = result.routes[0].steps || []
        const path: any[] = []
        for (const step of steps) {
          const stepPath = step.path || []
          for (const p of stepPath) {
            path.push(new AMap.LngLat(p.lng, p.lat))
          }
        }
        const distance = result.routes[0].distance || 0
        const duration = result.routes[0].time || 0
        tripStore.totalDistance = distance
        tripStore.totalDuration = duration
        resolve(path)
      } else {
        reject(new Error('Route planning failed'))
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
