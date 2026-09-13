import { fallbackWaypointName } from '@/utils/format'
import { amapGet } from './request'

export interface ReverseGeocodeResult {
  /** 优先取最近的 POI 名，否则用格式化地址 */
  name: string
  address: string
}

/**
 * 逆地理编码：坐标 → 地址。
 *
 * 替代原 Web 版的 AMap.Geocoder。
 */
export async function reverseGeocode(
  lng: number,
  lat: number
): Promise<ReverseGeocodeResult> {
  const data = await amapGet<{ regeocode?: any }>('/v3/geocode/regeo', {
    location: `${lng},${lat}`,
    radius: 1000,
    extensions: 'all',
  })

  const regeocode = data.regeocode
  const address: string = regeocode?.formatted_address ?? ''
  const pois = Array.isArray(regeocode?.pois) ? regeocode.pois : []
  const poiName: string = pois[0]?.name ?? ''

  return {
    name: poiName || address || fallbackWaypointName(lng, lat),
    address,
  }
}
