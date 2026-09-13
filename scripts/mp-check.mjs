/**
 * 小程序端自动验收：连上微信开发者工具的自动化端口，逐页截图并收集控制台报错。
 *
 * 为什么不用 automator.launch()：
 *   Node 18.20.2+ 为修 CVE-2024-27980 禁止 spawn 直接执行 .bat/.cmd，
 *   而 automator 内部正是 spawn cli.bat —— 在 Node 22 上必然抛
 *   "Failed to launch wechat web devTools, please make sure cliPath is correctly
 *   specified"，且错误信息具有误导性（跟 cliPath 无关）。
 *   所以改为：由外部用 CLI 以自动化模式打开项目，本脚本只负责连接。
 *
 * 前置：
 *   1. 开发者工具 → 设置 → 安全设置 → 服务端口 → 打开
 *   2. 以自动化模式打开项目（在项目根目录执行）：
 *        "D:/微信web开发者工具/cli.bat" auto \
 *          --project "<项目>/dist/dev/mp-weixin" --auto-port 9420
 *
 * 用法：
 *   node scripts/mp-check.mjs
 *
 * 产物：截图写入 .mp-shots/（已 gitignore），报错打印到终端。
 */
import automator from 'miniprogram-automator'
import { mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inspect } from 'node:util'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHOT_DIR = resolve(__dirname, '..', '.mp-shots')
const WS_ENDPOINT = process.env.MP_WS || 'ws://127.0.0.1:9420'

/** 要过一遍的页面 */
const PAGES = [
  { path: '/pages/index/index', name: '01-首页' },
  { path: '/pages/trips/index', name: '02-我的路书' },
  { path: '/pages/editor/index', name: '03-编辑器' },
  { path: '/pages/auth/index', name: '04-登录' },
]

const PAGE_SETTLE_MS = 2500

const consoleErrors = []
const exceptions = []
const consoleWarns = []

mkdirSync(SHOT_DIR, { recursive: true })

let miniProgram
try {
  miniProgram = await automator.connect({ wsEndpoint: WS_ENDPOINT })
} catch (e) {
  console.error(`\n连接 ${WS_ENDPOINT} 失败。`)
  console.error('请确认：')
  console.error('  1) 开发者工具已打开「设置 → 安全设置 → 服务端口」')
  console.error('  2) 已用 CLI 以自动化模式打开项目：')
  console.error('     "D:/微信web开发者工具/cli.bat" auto --project "<项目>/dist/dev/mp-weixin" --auto-port 9420')
  console.error(`\n原始错误: ${e.message}`)
  process.exit(1)
}

/**
 * console 的参数是 DevTools 转发的 CDP RemoteObject —— 带 getter 的类实例，
 * inspect / JSON.stringify 都会得到空对象，必须读 description / value / preview。
 */
function formatArg(arg) {
  if (typeof arg === 'string') return arg
  if (arg === null || arg === undefined) return String(arg)
  if (typeof arg !== 'object') return String(arg)

  if (typeof arg.description === 'string' && arg.description) return arg.description
  if (arg.value !== undefined) return String(arg.value)
  if (arg.preview) {
    const props = (arg.preview.properties || [])
      .map((p) => `${p.name}: ${p.value}`)
      .join(', ')
    return `${arg.preview.description ?? arg.preview.subtype ?? ''}{${props}}`.trim()
  }
  return inspect(arg, { depth: 4, breakLength: 160 })
}

function formatArgs(args) {
  return (args || []).map(formatArg).join(' ')
}

miniProgram.on('console', (msg) => {
  const text = formatArgs(msg.args)
  if (msg.type === 'error') consoleErrors.push(text)
  else if (msg.type === 'warn') consoleWarns.push(text)
})

miniProgram.on('exception', (err) => {
  exceptions.push(err?.message || String(err))
})

console.log('已连接开发者工具，开始逐页验收\n')

for (const { path, name } of PAGES) {
  console.log(`→ ${name}  ${path}`)
  try {
    const page = await miniProgram.reLaunch(path)
    await new Promise((r) => setTimeout(r, PAGE_SETTLE_MS))

    const file = join(SHOT_DIR, `${name}.png`)
    await miniProgram.screenshot({ path: file })
    console.log(`  截图: ${file}`)

    // 确认页面真的挂上了，而不是白屏
    const current = await miniProgram.currentPage()
    console.log(`  当前页: ${current?.path ?? '(取不到)'}`)
  } catch (e) {
    console.log(`  ❌ 失败: ${e.message}`)
  }
}

console.log('\n================ 汇总 ================')
console.log(`控制台 error: ${consoleErrors.length}`)
consoleErrors.forEach((e) => console.log(`  · ${e}`))
console.log(`未捕获异常: ${exceptions.length}`)
exceptions.forEach((e) => console.log(`  · ${e}`))
console.log(`控制台 warn: ${consoleWarns.length}`)
consoleWarns.slice(0, 10).forEach((e) => console.log(`  · ${e}`))
console.log(`\n截图目录: ${SHOT_DIR}`)

miniProgram.disconnect()
