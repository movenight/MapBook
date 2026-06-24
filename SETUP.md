# MapBook 环境搭建指南

## 前置条件

- Node.js ≥ 18
- Git
- npm（安装 Node.js 时自带）

## 快速启动

```bash
# 1. 克隆仓库
git clone git@github.com:movenight/MapBook.git
cd MapBook

# 2. 安装依赖
npm config set registry https://registry.npmmirror.com
npm install

# 3. 创建环境变量文件
cp .env.example .env

# 4. 编辑 .env，填入高德和 Supabase 的 Key（见下方"密钥"章节）

# 5. 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:3000`

## 密钥

联系项目维护者获取以下信息，填入 `.env` 文件：

- **高德地图 Key + 安全密钥**：用于地图显示、逆地理编码、驾车路线规划
- **Supabase URL + Anon Key**：用于用户认证和数据存储

## 数据库

Supabase 数据库已在云端配好。如需重新创建，在 Supabase SQL Editor 中执行：

```
supabase/migrations/001_init.sql
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 代码检查 |
| `npm run format` | 代码格式化 |

## 技术栈

- Vue 3 + TypeScript + Vite
- 高德地图 JS API 2.0
- Supabase (PostgreSQL + Auth)
- Element Plus UI
- Pinia 状态管理
