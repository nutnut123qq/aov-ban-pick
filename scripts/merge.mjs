/**
 * Gộp JSON export từ trang Nhập liệu Draft vào dữ liệu tĩnh của site.
 *
 * Đây là đoạn "backend" DUY NHẤT — chỉ chạy local lúc build dữ liệu, không host.
 * Nó: đọc file export → validate lại lần 2 → chống trùng id → append đúng file
 * mùa trong public/data/matches/ → cập nhật public/data/index.json.
 *
 * Dùng:
 *   node scripts/merge.mjs <export.json> --season <season-id> [--force]
 *
 * Ví dụ:
 *   node scripts/merge.mjs ~/Downloads/s_dtdv2024_sgbvshn.json --season 2024-s1
 *
 * Cờ:
 *   --season <id>   Tên mùa/giải → file public/data/matches/<id>.json (bắt buộc)
 *   --force         Cho phép ghi đè ván đã tồn tại (cùng series + van_number)
 *
 * Series đã tồn tại: format lấy theo bản export (mới hơn), winner_team_id tính
 * lại theo số ván thắng sau khi gộp (hoà thì giữ nguyên) — kể cả khi không có
 * ván mới, các sửa này vẫn được ghi.
 *
 * Xem .claude/design/03-data-model.md và 06-roadmap-kpi.md.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { pathToFileURL } from "url"

const EXPECTED_BANS = 8
const EXPECTED_PICKS = 10
const PICKS_PER_SIDE = 5

/**
 * Validate một series + các ván bên trong (lần kiểm tra thứ 2, sau trang nhập).
 * `heroSlugs` (Set) có thì kiểm tra hero_id tồn tại trong catalog.
 * Trả về mảng lỗi (rỗng = hợp lệ).
 */
export function validateSeries(s, heroSlugs) {
    const errs = []
    if (!s || typeof s !== "object") return ["Series không phải object."]
    if (!s.id) errs.push("Thiếu series.id.")
    if (!s.patch_id) errs.push("Thiếu patch_id.")
    if (!s.played_at) errs.push("Thiếu played_at (ngày thi đấu).")
    if (!s.team_blue_id || !s.team_red_id) errs.push("Thiếu team_blue_id / team_red_id.")
    if (!Array.isArray(s.matches) || s.matches.length === 0) {
        errs.push("Series không có ván nào (matches rỗng).")
        return errs
    }

    s.matches.forEach((m, mi) => {
        const tag = `ván ${m.van_number ?? mi + 1}`
        const da = m.draft_actions
        if (!Array.isArray(da)) {
            errs.push(`${tag}: thiếu draft_actions.`)
            return
        }

        const bans = da.filter((a) => a.action_type === "ban")
        const picks = da.filter((a) => a.action_type === "pick")
        if (bans.length !== EXPECTED_BANS) errs.push(`${tag}: cần ${EXPECTED_BANS} cấm, có ${bans.length}.`)
        if (picks.length !== EXPECTED_PICKS) errs.push(`${tag}: cần ${EXPECTED_PICKS} chọn, có ${picks.length}.`)

        const noHero = da.filter((a) => !a.hero_id)
        if (noHero.length) errs.push(`${tag}: ${noHero.length} ô thiếu hero_id.`)

        const ids = da.map((a) => a.hero_id).filter(Boolean)
        const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))]
        if (dup.length) errs.push(`${tag}: trùng tướng trong ván — ${dup.join(", ")}.`)

        const noLane = picks.filter((p) => !p.lane_position)
        if (noLane.length) errs.push(`${tag}: ${noLane.length} pick chưa gán lane.`)

        const blue = picks.filter((p) => p.team_side === "blue").length
        const red = picks.filter((p) => p.team_side === "red").length
        if (blue !== PICKS_PER_SIDE) errs.push(`${tag}: bên xanh cần ${PICKS_PER_SIDE} pick, có ${blue}.`)
        if (red !== PICKS_PER_SIDE) errs.push(`${tag}: bên đỏ cần ${PICKS_PER_SIDE} pick, có ${red}.`)

        if (heroSlugs) {
            const unknown = [...new Set(ids.filter((id) => !heroSlugs.has(id)))]
            if (unknown.length) errs.push(`${tag}: hero_id không có trong catalog — ${unknown.join(", ")}.`)
        }

        if (!m.winner_team_id) errs.push(`${tag}: thiếu winner_team_id.`)
    })

    return errs
}

/**
 * Đội thắng series theo số ván thắng: đội có NHIỀU ván thắng hơn hẳn,
 * hoà (hoặc không có ván) → null.
 */
export function seriesWinnerByGames(matches) {
    const wins = new Map()
    for (const m of matches) wins.set(m.winner_team_id, (wins.get(m.winner_team_id) ?? 0) + 1)
    const [first, second] = [...wins].sort((a, b) => b[1] - a[1])
    if (!first || (second && second[1] === first[1])) return null
    return first[0]
}

/**
 * Gộp các series `incoming` (đã validate) vào `seasonData` — KHÔNG đụng input,
 * trả về bản mùa mới + thống kê. Series đã có: gộp ván theo van_number (ván đã
 * có chỉ ghi đè khi `force`), cập nhật format theo incoming, tính lại winner.
 * `log` nhận từng dòng tiến trình (CLI truyền console.log).
 */
export function mergeIntoSeason(seasonData, incoming, { force = false, log = () => {} } = {}) {
    const data = structuredClone(seasonData)
    const byId = new Map(data.map((s) => [s.id, s]))
    const stats = { newSeries: 0, newMatches: 0, overwritten: 0, skipped: 0, formatChanged: 0, winnerChanged: 0 }

    for (const src of incoming) {
        const s = structuredClone(src)
        const existing = byId.get(s.id)

        if (!existing) {
            data.push(s)
            byId.set(s.id, s)
            stats.newSeries++
            stats.newMatches += s.matches.length
            log(`  ＋ series mới: ${s.id} (${s.matches.length} ván)`)
            continue
        }

        // Series đã tồn tại → gộp từng ván theo van_number.
        const vans = new Map(existing.matches.map((m) => [m.van_number, m]))
        for (const m of s.matches) {
            // Nếu ván 1 được merge, cập nhật bên Xanh/Đỏ ở cấp series theo đúng ván 1.
            if (m.van_number === 1) {
                existing.team_blue_id = m.team_blue_id
                existing.team_red_id = m.team_red_id
            }

            if (vans.has(m.van_number)) {
                if (force) {
                    existing.matches = existing.matches.map((em) =>
                        em.van_number === m.van_number ? m : em,
                    )
                    stats.overwritten++
                    log(`  ↻ ghi đè ${s.id} · ván ${m.van_number} (--force)`)
                } else {
                    stats.skipped++
                }
            } else {
                existing.matches.push(m)
                vans.set(m.van_number, m)
                stats.newMatches++
                log(`  ＋ thêm ${s.id} · ván ${m.van_number}`)
            }
        }
        existing.matches.sort((a, b) => a.van_number - b.van_number)

        // Export mới hơn → tin format của nó (vd importer cũ ghi nhầm BO3),
        // trừ khi nó nhỏ hơn số ván đã có (export cũ/stale sẽ hạ BO5 về BO3).
        const maxVan = Math.max(...existing.matches.map((m) => m.van_number))
        const incomingBo = Number(/^BO(\d+)$/.exec(s.format ?? "")?.[1])
        if (s.format && s.format !== existing.format && incomingBo >= maxVan) {
            log(`  ✎ format ${s.id}: ${existing.format} → ${s.format}`)
            existing.format = s.format
            stats.formatChanged++
        }
        // Hoà số ván đã lưu (ván LP lỗi draft bị bỏ) → tin winner của export (importer đếm mọi ván có kết quả).
        const winner = seriesWinnerByGames(existing.matches) ?? s.winner_team_id
        if (winner && winner !== existing.winner_team_id) {
            log(`  ✎ winner ${s.id}: ${existing.winner_team_id} → ${winner}`)
            existing.winner_team_id = winner
            stats.winnerChanged++
        }
    }

    return { seasonData: data, ...stats }
}

// ── CLI ──────────────────────────────────────────────────────────────────────

/** Thoát với thông báo lỗi đỏ. */
function fail(msg) {
    console.error(`\n❌  ${msg}\n`)
    process.exit(1)
}

/** In hướng dẫn dùng rồi thoát. */
function usage() {
    console.log(`
Gộp JSON export vào dữ liệu tĩnh.

  node scripts/merge.mjs <export.json> --season <season-id> [--force]

Ví dụ:
  node scripts/merge.mjs downloads/s_dtdv2024.json --season 2024-s1
`)
    process.exit(1)
}

/** Chạy CLI: parse argv → validate → gộp → ghi file mùa + index.json. */
function main() {
    const ROOT = process.cwd()
    const DATA_DIR = join(ROOT, "public", "data")
    const MATCHES_DIR = join(DATA_DIR, "matches")
    const INDEX_FILE = join(DATA_DIR, "index.json")
    const MANIFEST_FILE = join(ROOT, "public", "images", "heroes", "manifest.json")

    // ── Parse tham số ────────────────────────────────────────────────────────
    const argv = process.argv.slice(2)
    let inputFile
    let season
    let force = false

    for (let i = 0; i < argv.length; i++) {
        const a = argv[i]
        if (a === "--season") season = argv[++i]
        else if (a === "--force") force = true
        else if (a === "--help" || a === "-h") usage()
        else if (a.startsWith("--")) fail(`Cờ không hiểu: ${a}`)
        else if (!inputFile) inputFile = a
        else fail(`Tham số dư: ${a}`)
    }

    if (!inputFile) usage()
    if (!existsSync(inputFile)) fail(`Không tìm thấy file: ${inputFile}`)
    if (!season) fail("Thiếu --season <id> (vd --season 2024-s1).")
    if (!/^[a-z0-9][a-z0-9_-]*$/i.test(season)) {
        fail(`--season không hợp lệ: "${season}". Chỉ dùng chữ/số/gạch (vd 2024-s1).`)
    }

    // ── Đọc catalog tướng để kiểm tra hero_id tồn tại ───────────────────────
    let heroSlugs
    if (existsSync(MANIFEST_FILE)) {
        const manifest = JSON.parse(readFileSync(MANIFEST_FILE, "utf-8"))
        heroSlugs = new Set(manifest.map((h) => h.slug))
    } else {
        console.warn("⚠️  Không thấy manifest tướng — bỏ qua kiểm tra hero_id tồn tại.")
    }

    // ── Đọc + validate input ─────────────────────────────────────────────────
    let parsed
    try {
        parsed = JSON.parse(readFileSync(inputFile, "utf-8"))
    } catch (e) {
        fail(`File export không phải JSON hợp lệ: ${e.message}`)
    }

    const incoming = Array.isArray(parsed) ? parsed : [parsed]
    if (incoming.length === 0) fail("File export rỗng.")

    const allErrors = []
    incoming.forEach((s, i) => {
        const errs = validateSeries(s, heroSlugs)
        if (errs.length) allErrors.push(`Series #${i + 1} (${s?.id ?? "?"}):\n   - ${errs.join("\n   - ")}`)
    })
    if (allErrors.length) {
        fail(`Validation thất bại, KHÔNG ghi gì:\n\n${allErrors.join("\n\n")}`)
    }

    // ── Gộp vào file mùa ─────────────────────────────────────────────────────
    mkdirSync(MATCHES_DIR, { recursive: true })
    const seasonFile = join(MATCHES_DIR, `${season}.json`)

    let seasonData = []
    if (existsSync(seasonFile)) {
        try {
            seasonData = JSON.parse(readFileSync(seasonFile, "utf-8"))
            if (!Array.isArray(seasonData)) fail(`${season}.json không phải mảng series.`)
        } catch (e) {
            fail(`${season}.json hỏng, không đọc được: ${e.message}`)
        }
    }

    const r = mergeIntoSeason(seasonData, incoming, { force, log: (line) => console.log(line) })
    if (r.skipped) console.warn(`  ⏭ bỏ qua ${r.skipped} ván đã tồn tại (dùng --force để ghi đè)`)

    if (r.newSeries + r.newMatches + r.overwritten + r.formatChanged + r.winnerChanged === 0) {
        console.log("\nKhông có gì mới để ghi (mọi ván đã tồn tại, format/winner đã khớp).\n")
        process.exit(0)
    }

    writeFileSync(seasonFile, JSON.stringify(r.seasonData, null, 2) + "\n")

    // ── Cập nhật index.json ──────────────────────────────────────────────────
    let index = { matches: [] }
    if (existsSync(INDEX_FILE)) {
        try {
            index = JSON.parse(readFileSync(INDEX_FILE, "utf-8"))
        } catch {
            console.warn("⚠️  index.json hỏng — tạo lại từ đầu.")
        }
    }
    if (!Array.isArray(index.matches)) index.matches = []
    let indexUpdated = false
    if (!index.matches.includes(season)) {
        index.matches.push(season)
        index.matches.sort()
        indexUpdated = true
    }
    writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2) + "\n")

    // ── Tổng kết ─────────────────────────────────────────────────────────────
    console.log(`\n✅  Xong → public/data/matches/${season}.json`)
    console.log(`    series mới: ${r.newSeries} · ván mới: ${r.newMatches}` +
        (r.overwritten ? ` · ghi đè: ${r.overwritten}` : "") +
        (r.skipped ? ` · bỏ qua: ${r.skipped}` : "") +
        ` · sửa format: ${r.formatChanged} · sửa winner: ${r.winnerChanged}`)
    console.log(`    tổng trong mùa: ${r.seasonData.length} series`)
    if (indexUpdated) console.log(`    index.json: + "${season}"`)
    console.log(`\n👉  git add public/data && git commit → push để lên site.\n`)
}

// Chỉ chạy CLI khi gọi trực tiếp (import từ test thì không).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
