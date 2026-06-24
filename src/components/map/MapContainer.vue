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
import { loadAMap } from '@/services/amap'
import MapSearch from './MapSearch.vue'
import MapContextMenu from './MapContextMenu.vue'
import MapRouteLine from './MapRouteLine.vue'

const mapRef = ref<HTMLDivElement>()
const mapStore = useMapStore()
const contextMenu = ref({ visible: false, x: 0, y: 0 })
let mapInstance: AMap.Map | null = null

onMounted(async () => {
  const AMap = await loadAMap()
  if (!mapRef.value) return

  mapInstance = new AMap.Map(mapRef.value, {
    zoom: 11,
    center: [116.397428, 39.90923],
    viewMode: '3D',
  })

  mapStore.setMapInstance(mapInstance)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapInstance!.on('rightclick', (e: any) => {
    contextMenu.value = { visible: true, x: e.pixel.x, y: e.pixel.y }
    mapStore.setClickPosition([e.lnglat.getLng(), e.lnglat.getLat()])
  })

  mapInstance!.on('click', () => {
    contextMenu.value.visible = false
  })
})

onUnmounted(() => {
  mapInstance?.destroy()
  mapStore.setMapInstance(null)
})

function onSearchSelect(poi: { lng: number; lat: number; name: string; address: string }) {
  mapStore.addWaypoint({
    lng: poi.lng,
    lat: poi.lat,
    name: poi.name,
    address: poi.address,
  })
}

function onContextMenuSelect(type: string) {
  contextMenu.value.visible = false
  const pos = mapStore.clickPosition
  if (!pos) return
  mapStore.addWaypoint({ lng: pos[0], lat: pos[1], name: '', address: '' })
}
</script>

<style lang="less" scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
