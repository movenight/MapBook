import type { Backend } from './types'

// #ifdef MP-WEIXIN
import { wxCloudBackend } from './impl-wxcloud'
// #endif

// #ifdef H5
import { cloudbaseBackend } from './impl-cloudbase'
// #endif

export type { Backend, AuthUser, Platform, CloudDb, CloudQuery, CloudDoc } from './types'
export { BackendError } from './types'

/**
 * 取得当前平台的 Backend 实现。
 *
 * 条件编译保证每个平台只打包自己的实现 —— 小程序包里不会出现
 * @cloudbase/js-sdk（那个包浏览器专用，体积也大）。
 */
export function getBackend(): Backend {
  // #ifdef MP-WEIXIN
  return wxCloudBackend
  // #endif

  // #ifdef H5
  return cloudbaseBackend
  // #endif
}
