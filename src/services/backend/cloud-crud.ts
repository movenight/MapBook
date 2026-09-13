import type { Trip } from '@/types/trip'
import type { Waypoint } from '@/types/waypoint'
import type { Backend, CloudDb, CloudQuery } from './types'
import { BackendError } from './types'
import { rowToTrip, rowToWaypoint, tripToRow, waypointToRow } from './mappers'

const COL_TRIPS = 'trips'
const COL_WAYPOINTS = 'waypoints'

/**
 * 云开发客户端单次查询上限：小程序端 100，Web 端 20。
 * 取两端的公共安全值 20 作为分页步长，保证 Web 端也能取到全量数据。
 */
const PAGE_SIZE = 20

/** 防御性上限，避免异常数据导致无限翻页 */
const MAX_RECORDS = 2000

/**
 * 按页取完全部结果。
 * 每页都必须重新构造查询对象，所以传入工厂函数而不是查询对象本身。
 */
async function fetchAll<T>(
  build: () => CloudQuery,
  map: (row: Record<string, any>) => T
): Promise<T[]> {
  const out: T[] = []
  for (let offset = 0; offset < MAX_RECORDS; offset += PAGE_SIZE) {
    const res = await build().skip(offset).limit(PAGE_SIZE).get()
    const rows = res?.data ?? []
    out.push(...rows.map(map))
    if (rows.length < PAGE_SIZE) break
  }
  return out
}

/**
 * 用给定的云开发数据库实例构造「数据访问」这一半的 Backend 实现。
 * 双端的差异只在认证与建库方式上，这部分完全共用。
 */
export function createCloudDataOps(getDb: () => CloudDb): Pick<
  Backend,
  | 'listTrips'
  | 'getTrip'
  | 'saveTrip'
  | 'deleteTrip'
  | 'listWaypoints'
  | 'saveWaypoints'
  | 'deleteWaypoints'
> {
  return {
    async listTrips(): Promise<Trip[]> {
      try {
        const trips = await fetchAll(
          () => getDb().collection(COL_TRIPS).orderBy('updated_at', 'desc'),
          rowToTrip
        )
        return trips
      } catch (e) {
        throw new BackendError('读取路书列表失败', e)
      }
    },

    async getTrip(id: string): Promise<Trip | null> {
      try {
        const res = await getDb().collection(COL_TRIPS).doc(id).get()
        return res?.data ? rowToTrip(res.data) : null
      } catch (e) {
        throw new BackendError('读取路书失败', e)
      }
    },

    async saveTrip(trip: Trip): Promise<Trip> {
      if (!trip.id) {
        throw new BackendError('saveTrip 需要 trip.id：id 由调用方在创建时生成')
      }
      const now = Date.now()
      const row = {
        ...tripToRow(trip),
        created_at: trip.createdAt ?? now,
        updated_at: now,
      }
      try {
        await getDb().collection(COL_TRIPS).doc(trip.id).set({ data: row })
        return { ...trip, createdAt: row.created_at, updatedAt: now }
      } catch (e) {
        throw new BackendError('保存路书失败', e)
      }
    },

    async deleteTrip(id: string): Promise<void> {
      try {
        // 云开发没有级联删除，先清掉这一天名下的地点再删路书本身
        const waypoints = await this.listWaypoints(id)
        if (waypoints.length > 0) {
          await this.deleteWaypoints(waypoints.map((w) => w.id))
        }
        await getDb().collection(COL_TRIPS).doc(id).remove()
      } catch (e) {
        throw new BackendError('删除路书失败', e)
      }
    },

    async listWaypoints(tripId: string): Promise<Waypoint[]> {
      try {
        return await fetchAll(
          () =>
            getDb()
              .collection(COL_WAYPOINTS)
              .where({ trip_id: tripId })
              .orderBy('day_index', 'asc')
              .orderBy('order_index', 'asc'),
          rowToWaypoint
        )
      } catch (e) {
        throw new BackendError('读取地点失败', e)
      }
    },

    async saveWaypoints(waypoints: Waypoint[]): Promise<void> {
      if (waypoints.length === 0) return
      try {
        // 逐个 upsert：云开发没有批量 upsert，doc().set() 本身就是 upsert
        await Promise.all(
          waypoints.map((wp) =>
            getDb()
              .collection(COL_WAYPOINTS)
              .doc(wp.id)
              .set({ data: { ...waypointToRow(wp), created_at: wp.createdAt ?? Date.now() } })
          )
        )
      } catch (e) {
        throw new BackendError('保存地点失败', e)
      }
    },

    async deleteWaypoints(ids: string[]): Promise<void> {
      if (ids.length === 0) return
      try {
        await Promise.all(
          ids.map((id) => getDb().collection(COL_WAYPOINTS).doc(id).remove())
        )
      } catch (e) {
        throw new BackendError('删除地点失败', e)
      }
    },
  }
}
