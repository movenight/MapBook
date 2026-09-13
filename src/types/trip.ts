export type TripStatus = 'draft' | 'published'

/**
 * 路书（一次旅行的规划）
 *
 * 注意：地点不存在 Trip 上，而是通过 tripId 关联的独立集合。
 * 这样做是为了匹配云开发的文档型数据库，避免嵌套数组带来的读写放大。
 */
export interface Trip {
  /** 云开发文档 _id；新建时为 '' */
  id: string
  title: string
  description: string
  /** 天数，至少为 1 */
  dayCount: number
  status: TripStatus
  /** 格式 YYYY-MM-DD，未设置为 '' */
  startDate: string
  endDate: string
  coverLng?: number
  coverLat?: number
  coverZoom?: number
  /** 毫秒时间戳 */
  createdAt?: number
  updatedAt?: number
}

/** 新建路书时的空白对象 */
export function createEmptyTrip(): Trip {
  return {
    id: '',
    title: '',
    description: '',
    dayCount: 1,
    status: 'draft',
    startDate: '',
    endDate: '',
  }
}
