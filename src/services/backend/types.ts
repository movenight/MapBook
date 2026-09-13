import type { Trip } from '@/types/trip'
import type { Waypoint } from '@/types/waypoint'

/** 当前登录用户。小程序端只有隐式微信身份，不采集昵称头像 */
export interface AuthUser {
  id: string
  email?: string
  displayName?: string
}

export type Platform = 'mp-weixin' | 'h5'

/* ------------------------------------------------------------------ *
 * 云开发数据库的最小接口
 *
 * 小程序端 (wx.cloud.database) 与 Web 端 (cloudbase.database) 的查询 API
 * 形状基本一致，这里抽象出实际用到的那部分，CRUD 只写一份。
 * ------------------------------------------------------------------ */

export interface CloudDoc {
  get(): Promise<{ data: any }>
  /** upsert：文档不存在时创建。_id 由客户端生成，_openid 由云开发注入 */
  set(options: { data: Record<string, any> }): Promise<unknown>
  remove(): Promise<unknown>
}

export interface CloudQuery {
  where(condition: Record<string, any>): CloudQuery
  orderBy(field: string, direction: 'asc' | 'desc'): CloudQuery
  limit(n: number): CloudQuery
  skip(n: number): CloudQuery
  get(): Promise<{ data: any[] }>
  doc(id: string): CloudDoc
}

export interface CloudDb {
  collection(name: string): CloudQuery
}

/* ------------------------------------------------------------------ */

/** 数据访问接口：双端各自实现，业务代码只依赖它 */
export interface Backend {
  readonly platform: Platform
  /** 该平台是否需要用户手动登录。小程序端 false —— openid 由云开发隐式提供 */
  readonly requiresLogin: boolean

  getCurrentUser(): Promise<AuthUser | null>
  signIn(email: string, password: string): Promise<AuthUser>
  signUp(email: string, password: string): Promise<AuthUser>
  signOut(): Promise<void>

  listTrips(): Promise<Trip[]>
  getTrip(id: string): Promise<Trip | null>
  /** upsert：id 为空时创建，否则覆盖更新 */
  saveTrip(trip: Trip): Promise<Trip>
  deleteTrip(id: string): Promise<void>

  listWaypoints(tripId: string): Promise<Waypoint[]>
  saveWaypoints(waypoints: Waypoint[]): Promise<void>
  deleteWaypoints(ids: string[]): Promise<void>
}

/** 后端调用失败的统一错误类型，便于 UI 区分展示 */
export class BackendError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message)
    this.name = 'BackendError'
  }
}
