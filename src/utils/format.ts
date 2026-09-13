/** 距离：米 → 可读文本 */
export function formatDistance(meters: number): string {
  if (!meters || meters <= 0) return '0m'
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/** 时长：秒 → 可读文本 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0min'
  const totalMinutes = Math.round(seconds / 60)
  if (totalMinutes < 60) return `${totalMinutes}min`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0 ? `${hours}h` : `${hours}h${minutes}min`
}

/** 毫秒时间戳 → YYYY-MM-DD */
export function formatDate(timestamp?: number): string {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 面向用户的地点兜底名称：无名称时退化为坐标 */
export function fallbackWaypointName(lng: number, lat: number): string {
  return `${lng.toFixed(5)}, ${lat.toFixed(5)}`
}
