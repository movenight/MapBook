import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Trip } from '@/types/trip'
import type { Waypoint } from '@/types/waypoint'
import { supabase } from '@/services/supabase'
import { db } from '@/services/api/trips'

export const useTripStore = defineStore('trip', () => {
  const currentTrip = ref<Trip>(createEmptyTrip())
  const activeDayIndex = ref(1)
  const activeWaypointId = ref<string | null>(null)
  const saveStatus = ref('')
  const totalDistance = ref(0)
  const totalDuration = ref(0)

  const waypointsByDay = computed(() => {
    const map = new Map<number, Waypoint[]>()
    for (const wp of currentTrip.value.waypoints) {
      if (!map.has(wp.dayIndex)) map.set(wp.dayIndex, [])
      map.get(wp.dayIndex)!.push(wp)
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.orderIndex - b.orderIndex)
    }
    return map
  })

  function createEmptyTrip(): Trip {
    return {
      id: '',
      title: '',
      description: '',
      dayCount: 1,
      waypoints: [],
      waypointRoutes: new Map(),
      status: 'draft',
    }
  }

  function initNew() {
    currentTrip.value = createEmptyTrip()
    activeDayIndex.value = 1
  }

  async function loadTrip(id: string) {
    const { data } = await supabase
      .from('trips')
      .select('*, waypoints(*)')
      .eq('id', id)
      .single()

    if (data) {
      currentTrip.value = {
        ...data,
        waypoints: data.waypoints || [],
        waypointRoutes: new Map(),
      }
    }
  }

  function setActiveDay(day: number) {
    activeDayIndex.value = day
  }

  function addDay() {
    currentTrip.value.dayCount++
  }

  function removeDay(dayIndex: number) {
    currentTrip.value.waypoints = currentTrip.value.waypoints.filter(
      (wp) => wp.dayIndex !== dayIndex
    )
    currentTrip.value.dayCount = Math.max(1, currentTrip.value.dayCount - 1)
  }

  function addWaypoint(wp: Waypoint) {
    const day = activeDayIndex.value
    const maxOrder = currentTrip.value.waypoints
      .filter((w) => w.dayIndex === day)
      .reduce((max, w) => Math.max(max, w.orderIndex), -1)

    const newWp: Waypoint = {
      ...wp,
      id: crypto.randomUUID(),
      dayIndex: day,
      orderIndex: maxOrder + 1,
    }
    currentTrip.value.waypoints.push(newWp)
    activeWaypointId.value = newWp.id
    debounceSave()
  }

  function removeWaypoint(id: string) {
    currentTrip.value.waypoints = currentTrip.value.waypoints.filter((wp) => wp.id !== id)
    if (activeWaypointId.value === id) activeWaypointId.value = null
    debounceSave()
  }

  function updateWaypoint(id: string, patch: Partial<Waypoint>) {
    const idx = currentTrip.value.waypoints.findIndex((wp) => wp.id === id)
    if (idx >= 0) {
      currentTrip.value.waypoints[idx] = {
        ...currentTrip.value.waypoints[idx],
        ...patch,
      }
    }
    debounceSave()
  }

  let saveTimer: ReturnType<typeof setTimeout> | null = null

  function debounceSave() {
    if (saveTimer) clearTimeout(saveTimer)
    saveStatus.value = '未保存...'
    saveTimer = setTimeout(() => saveCurrent(), 2000)
  }

  async function saveCurrent() {
    if (!currentTrip.value.title) return
    saveStatus.value = '保存中...'

    const { data, error } = await db.upsertTrip(currentTrip.value)

    if (!error && data) {
      currentTrip.value.id = data.id
      saveStatus.value = '已保存 ✓'
    } else {
      saveStatus.value = '保存失败'
    }
  }

  return {
    currentTrip,
    activeDayIndex,
    activeWaypointId,
    saveStatus,
    totalDistance,
    totalDuration,
    waypointsByDay,
    initNew,
    loadTrip,
    setActiveDay,
    addDay,
    removeDay,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    saveCurrent,
  }
})
