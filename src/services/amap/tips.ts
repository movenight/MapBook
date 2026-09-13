import { amapGet, parseLocation } from './request'

export interface PoiTip {
  id: string
  name: string
  /** 行政区，如「北京市朝阳区」 */
  district: string
  address: string
  lng: number
  lat: number
}

/**
 * POI 关键字输入提示。
 *
 * 替代原 Web 版的 AMap.AutoComplete —— 小程序里没有 JSAPI，改用
 * Web 服务的 /v3/assistant/inputtips 接口。
 */
export async function inputTips(keyword: string, city = '全国'): Promise<PoiTip[]> {
  const trimmed = keyword.trim()
  if (!trimmed) return []

  const data = await amapGet<{ tips?: any[] }>('/v3/assistant/inputtips', {
    keywords: trimmed,
    city,
    citylimit: 'false',
    datatype: 'all',
  })

  const tips = Array.isArray(data.tips) ? data.tips : []

  return tips
    .map((tip): PoiTip | null => {
      const point = parseLocation(tip?.location)
      // 没有坐标的提示项（比如纯行政区名）无法直接落点，跳过
      if (!point) return null
      return {
        id: tip?.id ?? '',
        name: tip?.name ?? '',
        district: tip?.district ?? '',
        address: typeof tip?.address === 'string' ? tip.address : '',
        lng: point.lng,
        lat: point.lat,
      }
    })
    .filter((tip): tip is PoiTip => tip !== null)
}
