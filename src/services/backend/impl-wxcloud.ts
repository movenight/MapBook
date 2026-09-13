import type { AuthUser, Backend, CloudDb } from './types'
import { createCloudDataOps } from './cloud-crud'

/**
 * wx.cloud 的最小类型描述。
 * 用局部类型 + 断言而不是全局声明，避免和 @dcloudio/types 里的 wx 定义冲突。
 */
interface WxCloud {
  init(options: { env: string; traceUser?: boolean }): void
  database(): CloudDb
}

let initialized = false

function getDb(): CloudDb {
  const cloud = (wx as unknown as { cloud?: WxCloud }).cloud
  if (!cloud) {
    throw new Error('当前环境没有 wx.cloud，请确认运行在微信小程序中')
  }
  if (!initialized) {
    const env = import.meta.env.VITE_CLOUDBASE_ENV_ID
    if (!env) {
      throw new Error('VITE_CLOUDBASE_ENV_ID 未配置：请在 .env 中填入云开发环境 ID')
    }
    cloud.init({ env, traceUser: true })
    initialized = true
  }
  return cloud.database()
}

/** 提前初始化云开发，避免首个请求时才报配置错误 */
export function initWxCloudBackend(): void {
  getDb()
}

/**
 * 微信小程序端实现。
 *
 * 云开发会把调用方的 openid 隐式写入文档的 _openid 字段，配合集合的
 * 「仅创建者可读写」权限即可完成数据隔离 —— 因此小程序端没有登录流程。
 */
export const wxCloudBackend: Backend = {
  platform: 'mp-weixin',
  requiresLogin: false,

  ...createCloudDataOps(getDb),

  async getCurrentUser(): Promise<AuthUser | null> {
    getDb()
    return { id: 'wechat-user', displayName: '微信用户' }
  },

  async signIn(): Promise<AuthUser> {
    throw new Error('小程序端使用微信身份，无需邮箱登录')
  },

  async signUp(): Promise<AuthUser> {
    throw new Error('小程序端使用微信身份，无需注册')
  },

  async signOut(): Promise<void> {
    throw new Error('小程序端不支持退出登录')
  },
}
