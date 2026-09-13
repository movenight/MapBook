const AMAP_WEB_KEY = import.meta.env.VITE_AMAP_WEB_KEY
const AMAP_BASE = 'https://restapi.amap.com'

/**
 * 高德常见错误码的中文说明。
 * 10009 是最容易踩的一个：用了「Web端(JS API)」类型的 Key 去调 REST 接口。
 */
const AMAP_ERROR_HINTS: Record<string, string> = {
  '10001': 'Key 不正确或已过期',
  '10002': '该 Key 没有权限调用此服务',
  '10003': '访问过于频繁，请稍后重试',
  '10004': '当日访问量已超限',
  '10009': 'Key 与平台类型不匹配：请在高德控制台申请「Web服务」类型的 Key（当前用的可能是「Web端(JS API)」类型）',
  '10012': '访问过于频繁（超出配额）',
  '10016': 'Key 绑定的域名或 IP 不匹配',
  '20000': '高德服务内部错误',
  '20800': '规划点超出服务范围',
  '20802': '无法规划该路线，请调整地点',
  '20803': '起点与终点过近，无法规划',
}

function describeAmapError(data: { info?: string; infocode?: string }): string {
  const code = data?.infocode ?? ''
  const hint = AMAP_ERROR_HINTS[code]
  if (hint) {
    return `高德接口报错 ${code}：${hint}`
  }
  return `高德接口报错 ${code || '未知'}：${data?.info ?? '未知错误'}`
}

/**
 * 调用高德 Web 服务（REST）接口。
 *
 * 小程序端没有 fetch，统一走 uni.request —— 它在 H5 端会转成 XHR，
 * 两端代码完全一致。
 *
 * ⚠️ 需要「Web服务」类型的 Key，并且小程序后台要把 restapi.amap.com
 *    加入 request 合法域名（开发阶段可在开发者工具勾选「不校验合法域名」）。
 */
export function amapGet<T>(
  path: string,
  params: Record<string, string | number | undefined>
): Promise<T> {
  if (!AMAP_WEB_KEY) {
    return Promise.reject(
      new Error('VITE_AMAP_WEB_KEY 未配置：请在 .env 中填入高德「Web服务」类型的 Key')
    )
  }

  const query = Object.entries({ key: AMAP_WEB_KEY, ...params })
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${AMAP_BASE}${path}?${query}`,
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`高德接口 HTTP ${res.statusCode}`))
          return
        }
        const data = res.data as Record<string, any>
        // 高德的业务错误也是 HTTP 200，必须看 status 字段
        if (data?.status !== '1') {
          reject(new Error(describeAmapError(data)))
          return
        }
        resolve(data as T)
      },
      fail: (err) => {
        reject(new Error(err?.errMsg || '高德接口请求失败，请检查网络与域名白名单'))
      },
    })
  })
}

/** 高德返回的 "lng,lat" 字符串 → 数字对 */
export function parseLocation(location?: string): { lng: number; lat: number } | null {
  if (typeof location !== 'string' || !location.includes(',')) return null
  const [lng, lat] = location.split(',').map(Number)
  if (Number.isNaN(lng) || Number.isNaN(lat)) return null
  return { lng, lat }
}
