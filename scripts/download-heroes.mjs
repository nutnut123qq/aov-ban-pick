/**
 * Tải ảnh tướng từ hero-urls.json, đặt tên file theo slug tướng
 * Dùng: node scripts/download-heroes.mjs
 */

import { readFileSync, mkdirSync, existsSync, writeFileSync } from "fs"
import { join, extname } from "path"
import { createWriteStream } from "fs"
import https from "https"
import http from "http"

const URLS_FILE = join(process.cwd(), "hero-urls.json")
const OUTPUT_DIR = join(process.cwd(), "public", "images", "heroes")
const CONCURRENCY = 5

if (!existsSync(URLS_FILE)) {
    console.error("❌  Không tìm thấy hero-urls.json")
    process.exit(1)
}

mkdirSync(OUTPUT_DIR, { recursive: true })

const heroes = JSON.parse(readFileSync(URLS_FILE, "utf-8"))
console.log(`📋  ${heroes.length} tướng cần tải\n`)

function toSlug(name) {
    return name
        .toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
}

function download(url, destPath) {
    return new Promise((resolve, reject) => {
        if (existsSync(destPath)) { resolve("skip"); return }
        const client = url.startsWith("https") ? https : http
        const file = createWriteStream(destPath)
        client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close()
                download(res.headers.location, destPath).then(resolve).catch(reject)
                return
            }
            if (res.statusCode !== 200) {
                file.close()
                reject(new Error(`HTTP ${res.statusCode}`))
                return
            }
            res.pipe(file)
            file.on("finish", () => { file.close(); resolve("ok") })
        }).on("error", reject)
    })
}

async function runBatch(batch) {
    return Promise.allSettled(
        batch.map(async ({ name, url }) => {
            const ext = extname(new URL(url).pathname) || ".jpg"
            const filename = toSlug(name) + ext
            const dest = join(OUTPUT_DIR, filename)
            const status = await download(url, dest)
            return { name, filename, status }
        })
    )
}

let ok = 0, skipped = 0, failed = 0
const manifest = []

for (let i = 0; i < heroes.length; i += CONCURRENCY) {
    const batch = heroes.slice(i, i + CONCURRENCY)
    const results = await runBatch(batch)

    for (const r of results) {
        if (r.status === "fulfilled") {
            const { name, filename, status } = r.value
            if (status === "skip") { skipped++; process.stdout.write(`  ⏭  ${filename}\n`) }
            else { ok++; process.stdout.write(`  ✓  ${filename}\n`); manifest.push({ name, slug: filename.replace(/\.[^.]+$/, ""), file: filename }) }
        } else {
            failed++
            console.error(`  ✗  ${batch[results.indexOf(r)]?.name} — ${r.reason?.message}`)
        }
    }
    console.log(`[${Math.min(i + CONCURRENCY, heroes.length)}/${heroes.length}]`)
}

writeFileSync(join(OUTPUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2))

console.log(`\n✅  Xong: ${ok} tải về, ${skipped} đã có, ${failed} lỗi`)
console.log(`📁  public/images/heroes/`)
console.log(`📄  manifest.json gồm ${manifest.length} tướng`)
