/**
 * 生成地图 marker 图标。
 *
 * 小程序 <map> 组件的 marker.iconPath 需要真实图片文件（不支持 SVG / emoji 文本），
 * 所以这里用 zlib 手写 PNG，按地点类型生成 5 个配色不同的圆点标记。
 *
 * 用法：node scripts/gen-marker-icons.mjs
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'src', 'static', 'map')

const SIZE = 48
const OUTER_R = 21
const INNER_R = 15

/** 与 src/types/waypoint.ts 的 WaypointType 一一对应 */
const ICONS = [
  { name: 'departure', color: [0x16, 0x77, 0xff] },
  { name: 'destination', color: [0xff, 0x4d, 0x4f] },
  { name: 'waypoint', color: [0x52, 0xc4, 0x1a] },
  { name: 'lodgment', color: [0x72, 0x2e, 0xd1] },
  { name: 'dining', color: [0xfa, 0xad, 0x14] },
]

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i += 1) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([length, typeBuf, data, crc])
}

/** rgba: Buffer，长度 size*size*4 */
function encodePng(size, rgba) {
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0 // filter type: None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

/** 画一个「白色描边 + 彩色实心」的圆点 */
function drawDot(color) {
  const rgba = Buffer.alloc(SIZE * SIZE * 4)
  const center = (SIZE - 1) / 2

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const dist = Math.hypot(x - center, y - center)
      const offset = (y * SIZE + x) * 4

      let r = 0
      let g = 0
      let b = 0
      let a = 0

      if (dist <= INNER_R) {
        ;[r, g, b] = color
        a = 255
      } else if (dist <= OUTER_R) {
        // 白色描边，边缘做 1px 抗锯齿
        r = 255
        g = 255
        b = 255
        a = 255
      }

      if (a === 255 && dist > OUTER_R - 1) {
        a = Math.round(255 * (OUTER_R - dist))
      } else if (a === 255 && dist > INNER_R && dist <= INNER_R + 1) {
        // 内圈到白环的过渡，避免锯齿
        const t = dist - INNER_R
        r = Math.round(color[0] * (1 - t) + 255 * t)
        g = Math.round(color[1] * (1 - t) + 255 * t)
        b = Math.round(color[2] * (1 - t) + 255 * t)
      }

      rgba[offset] = r
      rgba[offset + 1] = g
      rgba[offset + 2] = b
      rgba[offset + 3] = Math.max(0, Math.min(255, a))
    }
  }

  return rgba
}

mkdirSync(OUT_DIR, { recursive: true })

for (const icon of ICONS) {
  const png = encodePng(SIZE, drawDot(icon.color))
  const file = join(OUT_DIR, `${icon.name}.png`)
  writeFileSync(file, png)
  console.log(`generated ${file} (${png.length} bytes)`)
}

console.log(`\n完成：${ICONS.length} 个图标已写入 src/static/map/`)
