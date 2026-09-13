import cloudbase from '@cloudbase/js-sdk'
import { registerAuth } from '@cloudbase/js-sdk/auth'
import { registerDatabase } from '@cloudbase/js-sdk/database'
import type { AuthUser, Backend, CloudDb } from './types'
import { BackendError } from './types'
import { createCloudDataOps } from './cloud-crud'

/*
 * v3 的 @cloudbase/js-sdk 是模块化的：认证与数据库都必须显式注册，
 * 主包不会自动挂载（minified 源码里只暴露了 window.registerDatabase 供 CDN 用法）。
 * 漏掉注册时 app.database() / app.auth() 会是 undefined。
 */
let appInstance: any = null
let authInstance: any = null

function getApp(): any {
  if (appInstance) return appInstance

  const env = import.meta.env.VITE_CLOUDBASE_ENV_ID
  if (!env) {
    throw new BackendError('VITE_CLOUDBASE_ENV_ID 未配置：请在 .env 中填入云开发环境 ID')
  }

  appInstance = cloudbase.init({ env })
  registerAuth(appInstance)
  registerDatabase(appInstance)
  return appInstance
}

function getAuth(): any {
  if (!authInstance) {
    // persistence: 'local' 让登录态在刷新后保留
    authInstance = getApp().auth({ persistence: 'local' })
  }
  return authInstance
}

function getDb(): CloudDb {
  return getApp().database() as unknown as CloudDb
}

/** 把 SDK 返回的用户对象规整成应用内的 AuthUser */
function toAuthUser(user: any): AuthUser {
  if (!user) {
    throw new BackendError('未获取到用户信息')
  }
  return {
    id: user.uid ?? user.id ?? user.sub ?? '',
    email: user.email ?? undefined,
    displayName: user.name ?? user.username ?? user.email ?? undefined,
  }
}

/** 把 SDK 的 { data, error } 响应解包，出错时抛出统一的 BackendError */
function unwrap(res: any, fallbackMessage: string): any {
  if (res?.error) {
    throw new BackendError(res.error.message ?? fallbackMessage, res.error)
  }
  return res?.data
}

/**
 * H5 端实现。
 *
 * 连接的是和小程序端**同一个云开发环境**，所以集合结构与权限规则完全共用。
 * 区别只在身份来源：这里用邮箱密码登录，拿到 uid 后由云开发权限规则做隔离。
 */
export const cloudbaseBackend: Backend = {
  platform: 'h5',
  requiresLogin: true,

  ...createCloudDataOps(getDb),

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const data = unwrap(await getAuth().getUser(), '读取登录态失败')
      return data?.user ? toAuthUser(data.user) : null
    } catch {
      // 未登录是正常状态，不当作错误抛出
      return null
    }
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    const data = unwrap(
      await getAuth().signInWithPassword({ email, password }),
      '登录失败'
    )
    return toAuthUser(data?.user)
  },

  async signUp(email: string, password: string): Promise<AuthUser> {
    const data = unwrap(await getAuth().signUp({ email, password }), '注册失败')
    return toAuthUser(data?.user)
  },

  async signOut(): Promise<void> {
    await getAuth().signOut()
  },
}
