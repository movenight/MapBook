import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTripStore } from './tripStore'

export const useMapStore = defineStore('map', () => {
  const mapInstance = ref<AMap.Map | null>(null)
  const clickPosition = ref<[number, number] | null>(null)

  function setMapInstance(instance: AMap.Map | null) {
    mapInstance.value = instance
  }

  function setClickPosition(pos: [number, number]) {
    clickPosition.value = pos
  }

  function addWaypoint(poi: { lng: number; lat: number; name: string; address: string }) {
    const tripStore = useTripStore()
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

  return {
    mapInstance,
    clickPosition,
    setMapInstance,
    setClickPosition,
    addWaypoint,
  }
})
