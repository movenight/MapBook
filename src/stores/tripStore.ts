import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Trip } from '@/types/trip'
import { createEmptyTrip } from '@/types/trip'
import type { Waypoint } from '@/types/waypoint'
import { getBackend } from '@/services/backend'
import { generateId } from '@/utils/helpers'

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export interface RouteSummary {
  distance: number
  duration: number
}

/** 自动保存防抖间隔 */
const SAVE_DEBOUNCE_MS = 2000

export const useTripStore = defineStore('trip', () => {
  const currentTrip = ref<Trip>(createEmptyTrip())
  const waypoints = ref<Waypoint[]>([])
  const activeDayIndex = ref(1)
  const activeWaypointId = ref<string | null>(null)
  const saveStatus = ref<SaveStatus>('idle')
  const saveError = ref('')
  const loading = ref(false)

  /**
   * 已成功落库的地点 id。
   * 保存时用它和当前列表对账，得出需要远端删除的 id —— 这样既不用维护
   * 一份「待删除」清单，也不会误删从未保存过的本地地点。
   */
  const persistedWaypointIds = ref<string[]>([])

  /**
   * 每天的路线距离/时长，总距离与总时长由它汇总。
   * 原 Web 版把总距离写在异步回调里逐个赋值，多天时会互相覆盖；
   * 改成按天存储 + computed 求和后不再有竞态。
   */
  const routeByDay = ref<Record<number, RouteSummary>>({})

  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const dayCount = computed(() => Math.max(1, currentTrip.value.dayCount))

  /** 按天分组后的地点，供列表与地图消费 */
  const waypointsByDay = computed(() => {
    const buckets = new Map<number, Waypoint[]>()

    for (let day = 1; day <= dayCount.value; day += 1) {
      buckets.set(day, [])
    }
    for (const waypoint of waypoints.value) {
      const bucket = buckets.get(waypoint.dayIndex)
      if (bucket) {
        bucket.push(waypoint)
      } else {
        // dayIndex 超出 dayCount 时兜底，避免地点在界面上凭空消失
        buckets.set(waypoint.dayIndex, [waypoint])
      }
    }
    for (const bucket of buckets.values()) {
      bucket.sort((a, b) => a.orderIndex - b.orderIndex)
    }

    return buckets
  })

  const totalDistance = computed(() =>
    Object.values(routeByDay.value).reduce((sum, route) => sum + route.distance, 0)
  )

  const totalDuration = computed(() =>
    Object.values(routeByDay.value).reduce((sum, route) => sum + route.duration, 0)
  )

  /** 地点总数，用于判断路书是否「已动过」 */
  const waypointCount = computed(() => waypoints.value.length)

  /* ---------------------------------------------------------------- *
   * 生命周期
   * ---------------------------------------------------------------- */

  /** 新建路书：立刻分配 id，这样保存时永远走 upsert，不需要区分新建/更新 */
  function initNew(): void {
    cancelPendingSave()
    currentTrip.value = { ...createEmptyTrip(), id: generateId() }
    waypoints.value = []
    persistedWaypointIds.value = []
    routeByDay.value = {}
    activeDayIndex.value = 1
    activeWaypointId.value = null
    saveStatus.value = 'idle'
    saveError.value = ''
  }

  async function loadTrip(id: string): Promise<void> {
    cancelPendingSave()
    loading.value = true
    saveError.value = ''
    try {
      const backend = getBackend()
      const trip = await backend.getTrip(id)
      if (!trip) {
        throw new Error('路书不存在或无权访问')
      }
      const list = await backend.listWaypoints(id)

      currentTrip.value = trip
      waypoints.value = list
      persistedWaypointIds.value = list.map((w) => w.id)
      routeByDay.value = {}
      activeDayIndex.value = 1
      activeWaypointId.value = null
      saveStatus.value = 'idle'
    } catch (e) {
      saveStatus.value = 'error'
      saveError.value = e instanceof Error ? e.message : '加载路书失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  /* ---------------------------------------------------------------- *
   * 路书字段
   * ---------------------------------------------------------------- */

  function updateTrip(patch: Partial<Trip>): void {
    currentTrip.value = { ...currentTrip.value, ...patch }
    scheduleSave()
  }

  function setActiveDay(day: number): void {
    activeDayIndex.value = Math.min(Math.max(1, day), dayCount.value)
  }

  function addDay(): void {
    currentTrip.value = { ...currentTrip.value, dayCount: dayCount.value + 1 }
    activeDayIndex.value = dayCount.value
    scheduleSave()
  }

  /**
   * 删除某一天。
   * 原 Web 版只递减了 dayCount，没有把后面的天整体前移，于是会出现
   * Day 1 / Day 3 这种空洞 —— 这里补上重编号。
   */
  function removeDay(dayIndex: number): void {
    if (dayCount.value <= 1) return

    waypoints.value = waypoints.value.filter((w) => w.dayIndex !== dayIndex)
    for (const waypoint of waypoints.value) {
      if (waypoint.dayIndex > dayIndex) {
        waypoint.dayIndex -= 1
      }
    }

    currentTrip.value = { ...currentTrip.value, dayCount: dayCount.value - 1 }
    if (activeDayIndex.value > dayCount.value) {
      activeDayIndex.value = dayCount.value
    }
    scheduleSave()
  }

  /* ---------------------------------------------------------------- *
   * 地点
   * ---------------------------------------------------------------- */

  function addWaypoint(input: Omit<Waypoint, 'id' | 'orderIndex' | 'dayIndex'> & {
    dayIndex?: number
  }): Waypoint {
    const dayIndex = input.dayIndex ?? activeDayIndex.value
    const maxOrder = waypoints.value
      .filter((w) => w.dayIndex === dayIndex)
      .reduce((max, w) => Math.max(max, w.orderIndex), -1)

    const waypoint: Waypoint = {
      ...input,
      id: generateId(),
      dayIndex,
      orderIndex: maxOrder + 1,
      createdAt: Date.now(),
    }

    waypoints.value = [...waypoints.value, waypoint]
    activeWaypointId.value = waypoint.id
    scheduleSave()
    return waypoint
  }

  function removeWaypoint(id: string): void {
    waypoints.value = waypoints.value.filter((w) => w.id !== id)
    if (activeWaypointId.value === id) {
      activeWaypointId.value = null
    }
    scheduleSave()
  }

  function updateWaypoint(id: string, patch: Partial<Waypoint>): void {
    waypoints.value = waypoints.value.map((w) => (w.id === id ? { ...w, ...patch } : w))
    scheduleSave()
  }

  /** 把某天的地点整体按给定顺序重编号（供拖拽排序使用） */
  function reorderDay(dayIndex: number, orderedIds: string[]): void {
    const rank = new Map(orderedIds.map((id, index) => [id, index]))
    for (const waypoint of waypoints.value) {
      if (waypoint.dayIndex === dayIndex && rank.has(waypoint.id)) {
        waypoint.orderIndex = rank.get(waypoint.id) as number
      }
    }
    scheduleSave()
  }

  /* ---------------------------------------------------------------- *
   * 路线统计
   * ---------------------------------------------------------------- */

  function setRouteSummary(dayIndex: number, summary: RouteSummary): void {
    routeByDay.value = { ...routeByDay.value, [dayIndex]: summary }
  }

  /** 整体替换：一次写入全部天数，避免逐天覆盖时残留已删除天的统计 */
  function setRouteSummaries(next: Record<number, RouteSummary>): void {
    routeByDay.value = next
  }

  function clearRouteSummaries(): void {
    routeByDay.value = {}
  }

  /* ---------------------------------------------------------------- *
   * 保存
   * ---------------------------------------------------------------- */

  /** 完全空白的新路书不落库，避免产生垃圾行 */
  function isBlank(): boolean {
    const trip = currentTrip.value
    return (
      waypoints.value.length === 0 &&
      !trip.title.trim() &&
      !trip.description.trim()
    )
  }

  function cancelPendingSave(): void {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
  }

  function scheduleSave(): void {
    saveStatus.value = 'dirty'
    cancelPendingSave()
    saveTimer = setTimeout(() => {
      saveTimer = null
      void persist()
    }, SAVE_DEBOUNCE_MS)
  }

  /**
   * 把路书与地点一起写回后端。
   *
   * 原 Web 版只保存了 trips 表，upsertWaypoints 是死代码 —— 导致刷新后
   * 地点全部丢失。这里是真正的修复点。
   */
  async function persist(): Promise<boolean> {
    if (isBlank()) {
      saveStatus.value = 'idle'
      return true
    }
    if (!currentTrip.value.id) {
      currentTrip.value = { ...currentTrip.value, id: generateId() }
    }

    const backend = getBackend()
    saveStatus.value = 'saving'
    saveError.value = ''

    try {
      currentTrip.value = await backend.saveTrip(currentTrip.value)
      await backend.saveWaypoints(waypoints.value)

      const aliveIds = new Set(waypoints.value.map((w) => w.id))
      const removedIds = persistedWaypointIds.value.filter((id) => !aliveIds.has(id))
      if (removedIds.length > 0) {
        await backend.deleteWaypoints(removedIds)
      }

      persistedWaypointIds.value = waypoints.value.map((w) => w.id)
      saveStatus.value = 'saved'
      return true
    } catch (e) {
      saveStatus.value = 'error'
      saveError.value = e instanceof Error ? e.message : '保存失败'
      return false
    }
  }

  /** 立即保存，并取消尚未触发的防抖（用于离开页面前） */
  async function flushSave(): Promise<boolean> {
    cancelPendingSave()
    return persist()
  }

  return {
    // state
    currentTrip,
    waypoints,
    activeDayIndex,
    activeWaypointId,
    saveStatus,
    saveError,
    loading,
    routeByDay,
    // getters
    dayCount,
    waypointCount,
    waypointsByDay,
    totalDistance,
    totalDuration,
    // lifecycle
    initNew,
    loadTrip,
    // trip
    updateTrip,
    setActiveDay,
    addDay,
    removeDay,
    // waypoints
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    reorderDay,
    // routes
    setRouteSummary,
    setRouteSummaries,
    clearRouteSummaries,
    // saving
    persist,
    flushSave,
  }
})
