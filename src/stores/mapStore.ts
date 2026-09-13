import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 默认视野：北京 */
const DEFAULT_CENTER = { lng: 116.397428, lat: 39.90923 }
const DEFAULT_SCALE = 11

export interface MapCenter {
  lng: number
  lat: number
}

/**
 * 地图视图状态。
 *
 * 小程序端的 <map> 是声明式组件（longitude / latitude / scale 全靠属性驱动），
 * 所以这里只存视图参数，不再持有地图实例 —— 原 Web 版把 AMap.Map 实例塞进
 * store 的做法在小程序里没有对应物。
 */
export const useMapStore = defineStore('map', () => {
  const center = ref<MapCenter>({ ...DEFAULT_CENTER })
  const scale = ref(DEFAULT_SCALE)

  /**
   * 用户点了地图、但还没决定这一点是什么类型的坐标。
   * 有值时弹出类型选择面板 —— 相当于原 Web 版的右键菜单。
   */
  const pendingPoint = ref<MapCenter | null>(null)

  function moveTo(point: MapCenter, nextScale?: number): void {
    center.value = { ...point }
    if (typeof nextScale === 'number') {
      scale.value = nextScale
    }
  }

  function resetView(): void {
    center.value = { ...DEFAULT_CENTER }
    scale.value = DEFAULT_SCALE
  }

  function setPendingPoint(point: MapCenter | null): void {
    pendingPoint.value = point
  }

  return {
    center,
    scale,
    pendingPoint,
    moveTo,
    resetView,
    setPendingPoint,
  }
})
