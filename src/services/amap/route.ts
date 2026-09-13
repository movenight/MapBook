import { amapGet } from './request'

export interface LatLng {
  lng: number
  lat: number
}

/** 小程序 <map> 的 polyline 坐标点格式 */
export interface MapPoint {
  latitude: number
  longitude: number
}

export interface RouteResult {
  points: MapPoint[]
  /** 米 */
  distance: number
  /** 秒 */
  duration: number
}

/**
 * 单条路线的点数上限。
 * 高德返回的 polyline 可能有上万个点，小程序 <map> 一次渲染太多点会明显卡顿，
 * 超出时按固定步长抽稀。
 */
const MAX_POINTS = 600

function downsample(points: MapPoint[], max: number): MapPoint[] {
  if (points.length <= max) return points
  const step = points.length / max
  const out: MapPoint[] = []
  for (let i = 0; i < points.length; i += step) {
    out.push(points[Math.floor(i)])
  }
  // 保证终点不丢
  const last = points[points.length - 1]
  if (out[out.length - 1] !== last) out.push(last)
  return out
}

/**
 * 驾车路径规划。
 *
 * 替代原 Web 版的 AMap.Driving 插件。
 * 注意坐标顺序：高德返回 "lng,lat"，小程序 polyline 需要 {latitude, longitude}，
 * 这个转换收敛在这里，组件层不用关心。
 */
export async function drivingRoute(
  origin: LatLng,
  destination: LatLng,
  waypoints: LatLng[] = []
): Promise<RouteResult> {
  const data = await amapGet<{ route?: any }>('/v3/direction/driving', {
    origin: `${origin.lng},${origin.lat}`,
    destination: `${destination.lng},${destination.lat}`,
    strategy: 0,
    extensions: 'all',
    waypoints:
      waypoints.length > 0
        ? waypoints.map((w) => `${w.lng},${w.lat}`).join(';')
        : undefined,
  })

  const path = data.route?.paths?.[0]
  if (!path) {
    throw new Error('高德未返回可用路线')
  }

  const points: MapPoint[] = []
  for (const step of path.steps ?? []) {
    if (typeof step?.polyline !== 'string' || !step.polyline) continue
    for (const pair of step.polyline.split(';')) {
      const [lng, lat] = pair.split(',').map(Number)
      if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
        points.push({ latitude: lat, longitude: lng })
      }
    }
  }

  return {
    points: downsample(points, MAX_POINTS),
    distance: Number.parseInt(path.distance, 10) || 0,
    duration: Number.parseInt(path.duration, 10) || 0,
  }
}
