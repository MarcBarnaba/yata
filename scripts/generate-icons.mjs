// Generates GSD's PWA icon set with zero external dependencies (Node's zlib only).
// The mark echoes the dashboard: a few white "attention bubbles" on a blue field.
// Run: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

// --- PNG encoder (truecolor + alpha) ---
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// --- Drawing ---
const lerp = (a, b, t) => a + (b - a) * t

// Bubble positions in normalized [0,1] coordinates.
const BUBBLES = [
  { x: 0.36, y: 0.385, r: 0.205, a: 1.0 },
  { x: 0.67, y: 0.40, r: 0.12, a: 0.9 },
  { x: 0.55, y: 0.67, r: 0.16, a: 0.82 },
]

// Signed-distance test for a rounded rectangle covering the whole canvas.
function insideRounded(x, y, size, cr) {
  const c = size / 2
  const qx = Math.max(Math.abs(x - c) - (c - cr), 0)
  const qy = Math.max(Math.abs(y - c) - (c - cr), 0)
  return Math.sqrt(qx * qx + qy * qy) - cr <= 0
}

function render(size, { full = false, safe = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4)
  const SS = 4 // supersampling for anti-aliasing
  const cornerR = full ? 0 : 0.22 * size
  const scale = safe ? 0.78 : 1.0
  const center = 0.5 * size
  const bubbles = BUBBLES.map((b) => ({
    x: center + (b.x * size - center) * scale,
    y: center + (b.y * size - center) * scale,
    r: b.r * size * scale,
    a: b.a,
  }))

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let pr = 0, pg = 0, pb = 0, pa = 0 // premultiplied accumulators
      for (let sj = 0; sj < SS; sj++) {
        for (let si = 0; si < SS; si++) {
          const sx = px + (si + 0.5) / SS
          const sy = py + (sj + 0.5) / SS
          let r = 0, g = 0, b = 0, a = 0
          if (full || insideRounded(sx, sy, size, cornerR)) {
            const t = sy / size
            r = lerp(59, 37, t)
            g = lerp(130, 99, t)
            b = lerp(246, 235, t)
            a = 1
          }
          for (const bb of bubbles) {
            const dx = sx - bb.x
            const dy = sy - bb.y
            if (dx * dx + dy * dy <= bb.r * bb.r) {
              r = lerp(r, 255, bb.a)
              g = lerp(g, 255, bb.a)
              b = lerp(b, 255, bb.a)
              a = a + bb.a * (1 - a)
            }
          }
          pr += r * a
          pg += g * a
          pb += b * a
          pa += a
        }
      }
      const n = SS * SS
      const A = pa / n
      const idx = (py * size + px) * 4
      if (A > 0) {
        rgba[idx] = Math.round(pr / n / A)
        rgba[idx + 1] = Math.round(pg / n / A)
        rgba[idx + 2] = Math.round(pb / n / A)
        rgba[idx + 3] = Math.round(A * 255)
      }
    }
  }
  return rgba
}

mkdirSync(publicDir, { recursive: true })
const write = (name, size, opts) => {
  writeFileSync(join(publicDir, name), encodePNG(size, render(size, opts)))
  console.log('wrote', name, `${size}x${size}`)
}

write('pwa-192x192.png', 192, {})
write('pwa-512x512.png', 512, {})
write('pwa-maskable-512x512.png', 512, { full: true, safe: true })
write('apple-touch-icon.png', 180, { full: true }) // iOS applies its own mask; must be opaque
write('favicon.png', 32, {})
