export type WaypointType = 'departure' | 'destination' | 'waypoint' | 'lodgment' | 'dining'

export const WAYPOINT_TYPES: WaypointType[] = [
  'departure',
  'destination',
  'waypoint',
  'lodgment',
  'dining',
]

export const WAYPOINT_TYPE_LABELS: Record<WaypointType, string> = {
  departure: '出发地',
  destination: '目的地',
  waypoint: '途径点',
  lodgment: '住宿',
  dining: '餐饮',
}

export const WAYPOINT_TYPE_ICONS: Record<WaypointType, string> = {
  departure: '🚩',
  destination: '🎯',
  waypoint: '📍',
  lodgment: '🏨',
  dining: '🍽️',
}

/**
 * 行程中的一个地点。
 *
 * `dayIndex` 从 1 开始；`orderIndex` 是天内的排序，从 0 开始。
 */
export interface Waypoint {
  id: string
  tripId: string
  dayIndex: number
  orderIndex: number
  name: string
  address: string
  lng: number
  lat: number
  /** 高德 POI ID，可能为空 */
  poiId: string
  type: WaypointType
  notes: string
  createdAt?: number
}
