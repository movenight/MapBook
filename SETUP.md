# MapBook 环境搭建指南

路书规划工具。一份代码（uni-app）同时产出**微信小程序**和**H5**。

## 技术栈

| 层 | 选型 |
|---|---|
| 跨端框架 | uni-app 3（Vue 3 + TypeScript + Vite 5） |
| 状态管理 | Pinia 2 |
| UI 组件 | wot-design-uni 1.14 |
| 后端 | 微信云开发（云数据库 + 云认证） |
| 地图 | 原生 `<map>` 组件（渲染） + 高德 Web 服务（搜索/逆地理/路径规划） |

## 前置条件

- Node.js ≥ 18
- 微信开发者工具（跑小程序必须）
- 一个微信小程序 AppID

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入下面「密钥」章节的两个值

# 3a. 跑 H5（浏览器）
npm run dev:h5          # → http://localhost:5173

# 3b. 跑小程序
npm run dev:mp-weixin   # 产物在 dist/dev/mp-weixin
```

### 在小程序里打开

1. 打开微信开发者工具 → 导入项目
2. 目录选择 `dist/dev/mp-weixin`（注意是**编译产物**，不是项目根目录）
3. AppID 填你自己的；或点「测试号」先用测试 AppID
4. 确认「详情 → 本地设置」里勾选了
   **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**
   （`manifest.json` 里已设 `urlCheck: false`，一般会自动勾上）

## 密钥

`.env` 里需要两个值：

| 变量 | 说明 | 获取方式 |
|---|---|---|
| `VITE_AMAP_WEB_KEY` | 高德**「Web服务」**类型 Key | [高德控制台](https://console.amap.com/dev/key/app) 新建 Key，服务平台必须选「Web服务」 |
| `VITE_CLOUDBASE_ENV_ID` | 微信云开发环境 ID，形如 `mapbook-1g2h3j4k` | 微信开发者工具 → 云开发 → 环境 → 环境 ID |

> ⚠️ **高德 Key 的平台类型是最容易踩的坑。**
> 原 Web 版用的 Key 是「Web端(JS API)」类型，调 REST 接口会返回
> `USERKEY_PLAT_NOMATCH`（infocode 10009）。本项目全部地图数据都走 REST 接口，
> 必须是「Web服务」类型。

云开发的建库步骤见 [docs/云开发配置.md](docs/云开发配置.md)。

### 小程序后台还需要配置

小程序管理后台 → 开发管理 → 开发设置 → 服务器域名 → request 合法域名：

```
https://restapi.amap.com
```

`restapi.amap.com` 已完成 ICP 备案，可以直接添加。开发阶段用开发者工具的
「不校验合法域名」即可绕过。

## 常用命令

| 命令 | 说明 |
|---|---|
| `npm run dev:h5` | H5 开发服务器 |
| `npm run dev:mp-weixin` | 小程序开发模式编译（产物 `dist/dev/mp-weixin`） |
| `npm run build:h5` | H5 生产构建 |
| `npm run build:mp-weixin` | 小程序生产构建（产物 `dist/build/mp-weixin`） |
| `npm run type-check` | TypeScript 类型检查 |
| `node scripts/gen-marker-icons.mjs` | 重新生成地图 marker 图标 |

## 目录结构

```
src/
├── pages/                    # 页面（对应 pages.json 里的路由）
│   ├── index/                # 首页
│   ├── trips/                # 我的路书
│   ├── editor/               # 路书编辑（地图 + 底部抽屉）★核心
│   └── auth/                 # 登录（仅 H5 需要）
├── components/
│   ├── map/                  # 地图、搜索栏、类型选择面板
│   ├── trip/                 # 路书卡片、按天列表、地点条目
│   └── common/               # 空状态等
├── services/
│   ├── backend/              # 后端适配层 ★双端差异只在这里
│   │   ├── types.ts          # Backend 接口定义
│   │   ├── cloud-crud.ts     # 两端共用的增删改查
│   │   ├── impl-wxcloud.ts   # 小程序实现（wx.cloud）
│   │   ├── impl-cloudbase.ts # H5 实现（@cloudbase/js-sdk）
│   │   └── mappers.ts        # camelCase ↔ snake_case 字段映射
│   └── amap/                 # 高德 Web 服务（搜索/逆地理/路径规划）
├── stores/                   # Pinia：trip / map / user
├── types/                    # 领域模型
├── utils/                    # 常量、格式化、工具函数
├── static/map/               # marker 图标（由脚本生成）
├── pages.json                # 路由 + 导航栏 + easycom
├── manifest.json             # AppID / 云开发 / H5 配置
└── uni.scss                  # 全局设计变量
```

## 架构说明

见 [docs/架构说明.md](docs/架构说明.md)。
