/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  /** 高德地图「Web 服务」类型 Key —— 用于逆地理编码 / 驾车规划 / POI 搜索 */
  readonly VITE_AMAP_WEB_KEY: string
  /** 微信云开发环境 ID，形如 mapbook-1g2h3j4k */
  readonly VITE_CLOUDBASE_ENV_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * 微信小程序运行时会注入全局 `wx` 对象，但 @dcloudio/types 只声明了 `uni`。
 * 这里补一个宽松声明；具体用到的字段形状在 services/backend/impl-wxcloud.ts
 * 里用局部 interface + 断言描述，避免和潜在的其它类型包冲突。
 */
declare const wx: { cloud?: unknown }
