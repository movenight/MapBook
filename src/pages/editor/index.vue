<template>
  <view class="editor">
    <MapSearchBar @select="onSearchSelect" @update:expanded="onSearchExpanded" />

    <view class="editor__body">
      <!--
        小程序 <map> 是原生组件，浮层压不住它，所以搜索展开时整个换掉地图，
        而不是把结果列表做成浮层。
      -->
      <MapView v-if="!searchExpanded" @pick="onMapPick" @markertap="onMarkerTap" />
      <view v-else class="editor__placeholder">
        <text class="editor__placeholder-text">从上方搜索结果中选择一个地点</text>
      </view>

      <view v-if="!searchExpanded && tripStore.waypointCount === 0" class="editor__tip">
        <text class="editor__tip-text">点击地图添加地点，或在上方搜索</text>
      </view>
    </view>

    <view class="drawer" :class="{ 'drawer--open': drawerOpen }">
      <view class="drawer__handle" @click="toggleDrawer">
        <view class="drawer__bar" />
        <view class="drawer__summary">
          <text class="drawer__summary-text">{{ drawerSummary }}</text>
          <text class="drawer__summary-action">{{ drawerOpen ? '收起' : '展开' }}</text>
        </view>
      </view>

      <scroll-view v-if="drawerOpen" class="drawer__content" scroll-y>
        <TripMetaForm />
        <TripDayList @add-place="onAddPlace" />
      </scroll-view>

      <view class="drawer__footer">
        <text class="drawer__stat">总距离 {{ formatDistance(tripStore.totalDistance) }}</text>
        <text class="drawer__stat">总时长 {{ formatDuration(tripStore.totalDuration) }}</text>
        <text class="drawer__status" :class="statusClass">{{ saveStatusText }}</text>
      </view>
    </view>

    <WaypointTypeSheet
      v-model="typeSheetVisible"
      title="这一点是什么？"
      @select="onTypeSelected"
    />

    <WaypointSheet
      v-model="waypointSheetVisible"
      :waypoint="activeWaypoint"
      @save="onWaypointSave"
      @delete="onWaypointDelete"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onHide, onLoad, onUnload } from '@dcloudio/uni-app'
import MapSearchBar from '@/components/map/MapSearchBar.vue'
import MapView from '@/components/map/MapView.vue'
import WaypointTypeSheet from '@/components/map/WaypointTypeSheet.vue'
import TripDayList from '@/components/trip/TripDayList.vue'
import TripMetaForm from '@/components/trip/TripMetaForm.vue'
import WaypointSheet from '@/components/trip/WaypointSheet.vue'
import { reverseGeocode, type PoiTip } from '@/services/amap'
import { useMapStore } from '@/stores/mapStore'
import { useTripStore } from '@/stores/tripStore'
import { useUserStore } from '@/stores/userStore'
import type { Waypoint, WaypointType } from '@/types/waypoint'
import { formatDistance, formatDuration, fallbackWaypointName } from '@/utils/format'

const tripStore = useTripStore()
const mapStore = useMapStore()
const userStore = useUserStore()

const searchExpanded = ref(false)
// 地图优先：默认收起抽屉，让地图占据主视口。抽屉把手上的摘要行提示可展开
const drawerOpen = ref(false)
const typeSheetVisible = ref(false)
const waypointSheetVisible = ref(false)

const activeWaypoint = computed<Waypoint | null>(
  () => tripStore.waypoints.find((w) => w.id === tripStore.activeWaypointId) ?? null
)

const drawerSummary = computed(() => {
  const day = tripStore.activeDayIndex
  return `Day ${day} · 共 ${tripStore.dayCount} 天 · ${tripStore.waypointCount} 个地点`
})

const saveStatusText = computed(() => {
  switch (tripStore.saveStatus) {
    case 'dirty':
      return '未保存…'
    case 'saving':
      return '保存中…'
    case 'saved':
      return '已保存 ✓'
    case 'error':
      return tripStore.saveError || '保存失败'
    default:
      return ''
  }
})

const statusClass = computed(() => ({ 'drawer__status--error': tripStore.saveStatus === 'error' }))

/* ------------------------------------------------------------------ *
 * 生命周期
 * ------------------------------------------------------------------ */

onLoad(async (options) => {
  // H5 端需要登录；小程序端 openid 由云开发隐式提供，这里直接放行
  const canContinue = await userStore.requireLogin()
  if (!canContinue) return

  const id = options?.id
  if (id) {
    uni.setNavigationBarTitle({ title: '编辑路书' })
    try {
      await tripStore.loadTrip(id)
    } catch (e) {
      uni.showToast({
        title: e instanceof Error ? e.message : '加载失败',
        icon: 'none',
      })
    }
  } else {
    uni.setNavigationBarTitle({ title: '新建路书' })
    tripStore.initNew()
  }
})

// 小程序切后台 / 返回时把未落库的改动立刻写掉，避免丢数据
onHide(() => {
  void tripStore.flushSave()
})

onUnload(() => {
  void tripStore.flushSave()
})

/* ------------------------------------------------------------------ *
 * 交互
 * ------------------------------------------------------------------ */

function toggleDrawer(): void {
  drawerOpen.value = !drawerOpen.value
}

function onSearchExpanded(value: boolean): void {
  searchExpanded.value = value
}

function onAddPlace(): void {
  drawerOpen.value = false
}

/** 点击地图：先记下坐标，弹类型选择面板 */
function onMapPick(): void {
  typeSheetVisible.value = true
}

function onMarkerTap(): void {
  waypointSheetVisible.value = true
}

async function onTypeSelected(type: WaypointType): Promise<void> {
  const point = mapStore.pendingPoint
  if (!point) return
  mapStore.setPendingPoint(null)

  // 先落点保证交互即时，名称等逆地理编码回来再补
  const waypoint = tripStore.addWaypoint({
    tripId: tripStore.currentTrip.id,
    name: '',
    address: '',
    lng: point.lng,
    lat: point.lat,
    poiId: '',
    type,
    notes: '',
  })

  try {
    const geo = await reverseGeocode(point.lng, point.lat)
    tripStore.updateWaypoint(waypoint.id, { name: geo.name, address: geo.address })
  } catch {
    // 逆地理编码失败不阻塞添加，退化成坐标文本
    tripStore.updateWaypoint(waypoint.id, {
      name: fallbackWaypointName(point.lng, point.lat),
    })
  }
}

function onSearchSelect(poi: PoiTip): void {
  tripStore.addWaypoint({
    tripId: tripStore.currentTrip.id,
    name: poi.name,
    address: `${poi.district}${poi.address}`,
    lng: poi.lng,
    lat: poi.lat,
    poiId: poi.id,
    type: 'waypoint',
    notes: '',
  })
  mapStore.moveTo({ lng: poi.lng, lat: poi.lat })
  searchExpanded.value = false
}

function onWaypointSave(payload: { id: string; patch: Partial<Waypoint> }): void {
  tripStore.updateWaypoint(payload.id, payload.patch)
}

function onWaypointDelete(id: string): void {
  tripStore.removeWaypoint(id)
}
</script>

<style lang="scss" scoped>
.editor {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--window-top, 0px) - var(--window-bottom, 0px));
  background: $mb-bg-light;
}

.editor__body {
  position: relative;
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.editor__placeholder-text,
.editor__tip-text {
  font-size: 26rpx;
  color: $mb-text-disabled;
}

.editor__tip {
  position: absolute;
  top: $mb-gap-md;
  left: 50%;
  padding: $mb-gap-xs $mb-gap-md;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 40rpx;
  transform: translateX(-50%);
}

.editor__tip-text {
  color: $mb-text-inverse;
}

/* ---- 底部抽屉 ---- */
.drawer {
  flex-shrink: 0;
  background: $mb-bg-white;
  border-top: 1rpx solid $mb-border;
}

.drawer__handle {
  padding: $mb-gap-sm $mb-gap-md;
}

.drawer__bar {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto $mb-gap-sm;
  background: $mb-border;
  border-radius: 4rpx;
}

.drawer__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer__summary-text {
  font-size: 26rpx;
  color: $mb-text-secondary;
}

.drawer__summary-action {
  font-size: 24rpx;
  color: $mb-primary;
}

.drawer__content {
  height: 52vh;
  border-top: 1rpx solid $mb-border-light;
}

.drawer__footer {
  display: flex;
  align-items: center;
  gap: $mb-gap-md;
  padding: $mb-gap-sm $mb-gap-md;
  border-top: 1rpx solid $mb-border-light;
}

.drawer__stat {
  font-size: 22rpx;
  color: $mb-text-disabled;
}

.drawer__status {
  margin-left: auto;
  font-size: 22rpx;
  color: $mb-success;

  &--error {
    color: $mb-danger;
  }
}
</style>
