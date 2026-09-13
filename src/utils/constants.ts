/** 地图默认视野：北京 */
export const DEFAULT_MAP_CENTER = { lng: 116.397428, lat: 39.90923 }
export const DEFAULT_MAP_SCALE = 11

/** 地图上一次最多渲染的标记数（与产品规划一致） */
export const MAX_MARKERS = 200

/** 每天路线的配色，按 dayIndex 取模循环 */
export const ROUTE_COLORS = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#ff4d4f',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#2f54eb',
]

/** POI 搜索输入防抖 */
export const SEARCH_DEBOUNCE_MS = 400

/** 自动保存防抖 */
export const SAVE_DEBOUNCE_MS = 2000
