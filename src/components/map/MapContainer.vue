<template>
  <div ref="mapRef" class="map-container">
    <MapSearch @select="onSearchSelect" />
    <MapContextMenu :visible="contextMenu.visible" :x="contextMenu.x" :y="contextMenu.y" @select="onContextMenuSelect" @close="contextMenu.visible = false" />
    <MapRouteLine />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { useTripStore } from '@/stores/tripStore'
import { loadAMap } from '@/services/amap'
import type { WaypointType } from '@/types/waypoint'
import MapSearch from './MapSearch.vue'
import MapContextMenu from './MapContextMenu.vue'
import MapRouteLine from './MapRouteLine.vue'

const mapRef = ref<HTMLDivElement>()
const mapStore = useMapStore()
const tripStore = useTripStore()
const contextMenu = ref({ visible: false, x: 0, y: 0 })
let mapInstance: AMap.Map | null = null
let lastClickLnglat: [number, number] | null = null

onMounted(async () => {
  const AMap = await loadAMap()
  if (!mapRef.value) return

  mapInstance = new AMap.Map(mapRef.value, {
    zoom: 11,
    center: [116.397428, 39.90923],
    viewMode: '3D',
  })

  mapStore.setMapInstance(mapInstance)

  mapInstance!.on('rightclick', (e: any) => {
    lastClickLnglat = [e.lnglat.getLng(), e.lnglat.getLat()]
    contextMenu.value = {
      visible: true,
      x: e.pixel.x,
      y: e.pixel.y,
    }
    mapStore.setClickPosition(lastClickLnglat)
  })

  mapInstance!.on('click', (e: any) => {
    contextMenu.value.visible = false
    const lng = e.lnglat.getLng()
    const lat = e.lnglat.getLat()
    lastClickLnglat = [lng, lat]
    addWaypointAtPosition(lng, lat)
  })
})

onUnmounted(() => {
  mapInstance?.destroy()
  mapStore.setMapInstance(null)
})

function onSearchSelect(poi: { lng: number; lat: number; name: string; address: string }) {
  tripStore.addWaypoint({
    id: crypto.randomUUID(),
    tripId: tripStore.currentTrip.id,
    dayIndex: tripStore.activeDayIndex,
    orderIndex: 0,
    name: poi.name,
    address: poi.address,
    lng: poi.lng,
    lat: poi.lat,
    type: 'waypoint',
    notes: '',
  })
}

function onContextMenuSelect(type: string) {
  contextMenu.value.visible = false
  const pos = lastClickLnglat
  if (!pos) return
  addWaypointAtPosition(pos[0], pos[1], type)
}

async function addWaypointAtPosition(lng: number, lat: number, wpType: string = 'waypoint') {
  let name = ''
  let address = ''

  try {
    const AMap = await loadAMap()
    const geocoder = new AMap.Geocoder()
    const result = await new Promise<{ name: string; address: string }>((resolve) => {
      geocoder.getAddress([lng, lat], (_status: string, res: any) => {
        if (res?.regeocode) {
          const addr = res.regeocode.formattedAddress || ''
          const pois = res.regeocode.pois || []
          const poiName = pois.length > 0 ? pois[0].name : ''
          resolve({ name: poiName || addr, address: addr })
        } else {
          resolve({ name: '', address: '' })
        }
      })
    })
    name = result.name
    address = result.address
  } catch {
    // geocoding failed, use empty name
  }

  tripStore.addWaypoint({
    type: wpType as WaypointType,
    id: crypto.randomUUID(),
    tripId: tripStore.currentTrip.id,
    dayIndex: tripStore.activeDayIndex,
    orderIndex: 0,
    name,
    address,
    lng,
    lat,
    notes: '',
  })
}
</script>

<style lang="less" scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
