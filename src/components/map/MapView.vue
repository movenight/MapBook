<template>
  <view class="map-view">
    <map
      id="trip-map"
      class="map"
      :longitude="mapStore.center.lng"
      :latitude="mapStore.center.lat"
      :scale="mapStore.scale"
      :markers="markers"
      :polyline="polylines"
      :include-points="includePoints"
      :show-location="false"
      :enable-rotate="false"
      :enable-overlooking="false"
      @markertap="onMarkerTap"
      @tap="onMapTap"
    />

    <!-- 路线规划失败时给出原因，而不是静默什么都不画 -->
    <view v-if="routeError" class="map-banner">
      <text class="map-banner__text">{{ routeError }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { drivingRoute } from '@/services/amap'
import { useMapStore } from '@/stores/mapStore'
import { useTripStore } from '@/stores/tripStore'
import type { WaypointType } from '@/types/waypoint'
import { ROUTE_COLORS } from '@/utils/constants'

/**
 * 小程序 <map> 的 marker.id 必须是数字，且 @markertap 只回传这个数字。
 * 所以维护「序号 → 业务 id」的映射，把数字 id 当作数组下标使用。
 */
interface MarkerSpec {
  id: number
  latitude: number
  longitude: number
  iconPath: string
  width: number
  height: number
  anchor: { x: number; y: number }
  callout: Record<string, unknown>
}

interface PolylineSpec {
  points: { latitude: number; longitude: number }[]
  color: string
  width: number
  dottedLine?: boolean
  arrowLine?: boolean
}

const props = withDefaults(
  defineProps<{
    /** 有地点时自动缩放视野到全部地点 */
    autoFit?: boolean
    /** 是否显示路线 */
    showRoutes?: boolean
  }>(),
  { autoFit: true, showRoutes: true }
)

const emit = defineEmits<{
  (e: 'pick', point: { lng: number; lat: number }): void
  (e: 'markertap', waypointId: string): void
}>()

const mapStore = useMapStore()
const tripStore = useTripStore()

const MARKER_SIZE = 26
/** 与产品规划一致：地图上最多 200 个标记 */
const MAX_MARKERS = 200
const ROUTE_DEBOUNCE_MS = 600

const polylines = ref<PolylineSpec[]>([])
const routeError = ref('')

function iconFor(type: WaypointType): string {
  // uni-app 会把 src/static 拷到小程序根目录，所以以 /static 开头
  return `/static/map/${type}.png`
}

/**
 * 标记与「序号 → 业务 id」映射一起算出来，避免在 computed 里产生副作用。
 */
const markerData = computed(() => {
  const ids: string[] = []
  const list: MarkerSpec[] = []

  outer: for (const dayWaypoints of tripStore.waypointsByDay.values()) {
    for (const waypoint of dayWaypoints) {
      if (list.length >= MAX_MARKERS) break outer

      const id = list.length
      list.push({
        id,
        latitude: waypoint.lat,
        longitude: waypoint.lng,
        iconPath: iconFor(waypoint.type),
        width: MARKER_SIZE,
        height: MARKER_SIZE,
        anchor: { x: 0.5, y: 0.5 },
        callout: {
          content: waypoint.name || '未命名地点',
          color: '#1f1f1f',
          fontSize: 12,
          bgColor: '#ffffff',
          padding: 6,
          borderRadius: 6,
          borderWidth: 0,
          display: 'BYCLICK',
          textAlign: 'center',
        },
      })
      ids.push(waypoint.id)
    }
  }

  return { ids, list }
})

const markers = computed(() => markerData.value.list)

const includePoints = computed(() => {
  if (!props.autoFit) return []
  return tripStore.waypoints.map((w) => ({ latitude: w.lat, longitude: w.lng }))
})

function onMarkerTap(e: any): void {
  const markerId = e?.detail?.markerId
  if (typeof markerId !== 'number') return
  const waypointId = markerData.value.ids[markerId]
  if (waypointId) {
    tripStore.activeWaypointId = waypointId
    emit('markertap', waypointId)
  }
}

/**
 * 点击地图 → 交给上层弹出类型选择面板。
 *
 * 原 Web 版是「左键直接添加途径点 + 右键弹菜单」，小程序没有右键，
 * 这里统一成「点击 → 选类型」，顺带避免了误触添加。
 */
function onMapTap(e: any): void {
  const detail = e?.detail ?? {}
  const lng = Number(detail.longitude)
  const lat = Number(detail.latitude)
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    console.warn('[MapView] 地图点击事件未返回坐标', e)
    return
  }
  mapStore.setPendingPoint({ lng, lat })
  emit('pick', { lng, lat })
}

/* ------------------------------------------------------------------ *
 * 路线绘制
 * ------------------------------------------------------------------ */

let routeTimer: ReturnType<typeof setTimeout> | null = null
/** 递增令牌，丢弃过期请求的结果，避免旧请求覆盖新路线 */
let routeToken = 0

function scheduleRouteDraw(): void {
  if (routeTimer) clearTimeout(routeTimer)
  routeTimer = setTimeout(() => {
    routeTimer = null
    void drawRoutes()
  }, ROUTE_DEBOUNCE_MS)
}

async function drawRoutes(): Promise<void> {
  if (!props.showRoutes) {
    polylines.value = []
    tripStore.setRouteSummaries({})
    return
  }

  const token = ++routeToken
  const nextPolylines: PolylineSpec[] = []
  const nextSummaries: Record<number, { distance: number; duration: number }> = {}
  let firstError = ''

  for (const [dayIndex, dayWaypoints] of tripStore.waypointsByDay) {
    if (dayWaypoints.length < 2) continue

    const color = ROUTE_COLORS[dayIndex % ROUTE_COLORS.length]
    const origin = { lng: dayWaypoints[0].lng, lat: dayWaypoints[0].lat }
    const last = dayWaypoints[dayWaypoints.length - 1]
    const destination = { lng: last.lng, lat: last.lat }
    const via = dayWaypoints.slice(1, -1).map((w) => ({ lng: w.lng, lat: w.lat }))

    try {
      const route = await drivingRoute(origin, destination, via)
      if (token !== routeToken) return

      if (route.points.length > 0) {
        nextPolylines.push({
          points: route.points,
          color,
          width: 6,
          arrowLine: true,
        })
      }
      nextSummaries[dayIndex] = { distance: route.distance, duration: route.duration }
    } catch (error) {
      if (token !== routeToken) return

      // 规划失败时退回虚线直连，至少让用户看清顺序
      nextPolylines.push({
        points: dayWaypoints.map((w) => ({ latitude: w.lat, longitude: w.lng })),
        color,
        width: 3,
        dottedLine: true,
      })
      nextSummaries[dayIndex] = { distance: 0, duration: 0 }
      if (!firstError) {
        firstError = error instanceof Error ? error.message : '路线规划失败'
      }
    }
  }

  if (token !== routeToken) return

  polylines.value = nextPolylines
  // 整体替换而不是逐天覆盖，避免已删除的天残留统计值
  tripStore.setRouteSummaries(nextSummaries)
  routeError.value = firstError
}

watch(
  () => tripStore.waypointsByDay,
  () => scheduleRouteDraw(),
  { deep: true, immediate: true }
)

onUnmounted(() => {
  if (routeTimer) clearTimeout(routeTimer)
  routeTimer = null
  routeToken += 1
})
</script>

<style lang="scss" scoped>
/*
 * 高度靠 100%（父级给宿主节点定高），不能用 flex:1。
 * 小程序端 uni-app 会给自定义组件套一层宿主节点且高度为 auto，宿主不是 flex
 * 容器，写在这里的 flex:1 会完全失效 → 本元素塌成 0 高，而 <map> 是
 * position:absolute，于是填进一个 0 高的盒子，地图整块不可见。
 * 定高由父级的 .editor__map 类（落在宿主节点上）提供。
 */
.map-view {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.map-banner {
  position: absolute;
  top: $mb-gap-sm;
  left: $mb-gap-sm;
  right: $mb-gap-sm;
  padding: $mb-gap-xs $mb-gap-sm;
  background: rgba(255, 77, 79, 0.94);
  border-radius: $mb-radius-sm;
}

.map-banner__text {
  font-size: 22rpx;
  color: $mb-text-inverse;
}
</style>
