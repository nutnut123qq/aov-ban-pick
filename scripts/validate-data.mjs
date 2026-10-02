/**
 * Data Integrity Audit Script
 * Quét toàn bộ dataset trong public/data/ và đối soát với hero manifest.
 *
 * Chạy:
 *   node scripts/validate-data.mjs
 */

import { readFileSync, existsSync, readdirSync } from "fs"
import { join } from "path"

const ROOT = process.cwd()
const DATA_DIR = join(ROOT, "public", "data")
const MATCHES_DIR = join(DATA_DIR, "matches")
const INDEX_FILE = join(DATA_DIR, "index.json")
const MANIFEST_FILE = join(ROOT, "public", "images", "heroes", "manifest.json")
const HEROES_IMG_DIR = join(ROOT, "public", "images", "heroes")

const VALID_LANES = new Set([
    "ta_than",
    "rung",
    "giua",
    "rong_xa",
    "rong_ho_tro",
    "dark_slayer",
    "jungle",
    "mid",
    "abyssal_dragon",
    "support",
])

function fail(msg) {
    console.error(`\n❌ [Data Audit Failed] ${msg}\n`)
    process.exit(1)
}

function success(msg) {
    console.log(`✅ ${msg}`)
}

console.log("==================================================")
console.log("🔍 AOV DraftMind Data Integrity Audit")
console.log("==================================================")

// 1. Kiểm tra manifest tướng
if (!existsSync(MANIFEST_FILE)) {
    fail(`Không tìm thấy file manifest tướng: ${MANIFEST_FILE}`)
}

let manifest
try {
    manifest = JSON.parse(readFileSync(MANIFEST_FILE, "utf-8"))
} catch (e) {
    fail(`Lỗi parse JSON manifest tướng: ${e.message}`)
}

if (!Array.isArray(manifest) || manifest.length === 0) {
    fail("Manifest tướng phải là mảng không rỗng.")
}

const heroSlugs = new Set()
let missingImageCount = 0

for (const hero of manifest) {
    if (!hero.slug || !hero.file || !hero.name) {
        fail(`Tướng không hợp lệ trong manifest: ${JSON.stringify(hero)}`)
    }
    if (heroSlugs.has(hero.slug)) {
        fail(`Trùng lặp slug tướng trong manifest: ${hero.slug}`)
    }
    heroSlugs.add(hero.slug)

    const imgPath = join(HEROES_IMG_DIR, hero.file)
    if (!existsSync(imgPath)) {
        console.warn(`⚠️ [Cảnh báo] Thiếu file ảnh cho tướng '${hero.slug}': ${hero.file}`)
        missingImageCount++
    }
}

success(`Hero Manifest: ${heroSlugs.size} tướng đã được kiểm tra (Missing images: ${missingImageCount})`)

// 2. Kiểm tra index.json
if (!existsSync(INDEX_FILE)) {
    fail(`Không tìm thấy index.json: ${INDEX_FILE}`)
}

let indexData
try {
    indexData = JSON.parse(readFileSync(INDEX_FILE, "utf-8"))
} catch (e) {
    fail(`Lỗi parse index.json: ${e.message}`)
}

if (!Array.isArray(indexData.matches)) {
    fail("index.json phải chứa trường 'matches' kiểu mảng.")
}

const indexedMatchFiles = new Set(indexData.matches)
success(`Index: ${indexedMatchFiles.size} mùa/giải đấu được khai báo`)

// 3. Kiểm tra các file trong public/data/matches/
if (!existsSync(MATCHES_DIR)) {
    fail(`Thư mục matches không tồn tại: ${MATCHES_DIR}`)
}

const diskMatchFiles = readdirSync(MATCHES_DIR).filter((f) => f.endsWith(".json"))

// Kiểm tra orphan files
for (const file of diskMatchFiles) {
    const baseId = file.replace(/\.json$/, "")
    if (!indexedMatchFiles.has(baseId)) {
        fail(`File dữ liệu mồ côi (không nằm trong index.json): public/data/matches/${file}`)
    }
}

// Kiểm tra missing files
for (const matchId of indexedMatchFiles) {
    const filename = `${matchId}.json`
    const filePath = join(MATCHES_DIR, filename)
    if (!existsSync(filePath)) {
        fail(`File được khai báo trong index.json nhưng không tồn tại: ${filePath}`)
    }
}

// 4. Quét sâu từng file series
let totalSeriesCount = 0
let totalMatchCount = 0
let totalActionCount = 0
const unknownHeroes = new Set()

for (const matchId of indexedMatchFiles) {
    const filePath = join(MATCHES_DIR, `${matchId}.json`)
    let seriesList
    try {
        seriesList = JSON.parse(readFileSync(filePath, "utf-8"))
    } catch (e) {
        fail(`Lỗi parse JSON file ${filePath}: ${e.message}`)
    }

    if (!Array.isArray(seriesList)) {
        fail(`File ${filename} phải chứa mảng Series.`)
    }

    totalSeriesCount += seriesList.length

    for (const series of seriesList) {
        if (!series.id || !series.tournament_name || !series.patch_id || !series.format || !series.played_at) {
            fail(`Series thiếu trường bắt buộc: ${JSON.stringify(series.id || series)}`)
        }
        if (!Array.isArray(series.matches) || series.matches.length === 0) {
            fail(`Series '${series.id}' không có ván đấu (matches) nào.`)
        }

        totalMatchCount += series.matches.length

        for (const match of series.matches) {
            if (typeof match.van_number !== "number" || match.van_number < 1) {
                fail(`Match trong series '${series.id}' có van_number không hợp lệ.`)
            }
            if (!match.team_blue_id || !match.team_red_id || !match.winner_team_id) {
                fail(`Match ${match.van_number} trong series '${series.id}' thiếu thông tin đội.`)
            }
            if (match.winner_team_id !== match.team_blue_id && match.winner_team_id !== match.team_red_id) {
                fail(
                    `Match ${match.van_number} trong series '${series.id}' có winner_team_id ('${match.winner_team_id}') không khớp với blue ('${match.team_blue_id}') hoặc red ('${match.team_red_id}')`,
                )
            }

            if (!Array.isArray(match.draft_actions)) {
                fail(`Match ${match.van_number} trong series '${series.id}' thiếu draft_actions.`)
            }

            totalActionCount += match.draft_actions.length

            const seenMatchHeroes = new Set()
            for (let i = 0; i < match.draft_actions.length; i++) {
                const action = match.draft_actions[i]

                if (!action.hero_id) {
                    fail(`Lượt ${i + 1} trong ván ${match.van_number} (series '${series.id}') thiếu hero_id.`)
                }

                // 100% hero_id phải tồn tại trong manifest
                if (!heroSlugs.has(action.hero_id)) {
                    unknownHeroes.add(action.hero_id)
                    console.error(
                        `❌ Hero không xác định: '${action.hero_id}' tại series '${series.id}', ván ${match.van_number}, turn ${action.turn_number}`,
                    )
                }

                // Kiểm tra trùng tướng trong cùng match (nếu không phải blind pick)
                if (!match.is_blind_pick) {
                    if (seenMatchHeroes.has(action.hero_id)) {
                        fail(
                            `Trùng hero_id '${action.hero_id}' trong ván ${match.van_number} (series '${series.id}').`,
                        )
                    }
                    seenMatchHeroes.add(action.hero_id)
                }

                // Kiểm tra ban/pick logic
                if (action.action_type === "ban") {
                    if (action.pick_index !== null) {
                        fail(`Lượt BAN tại ván ${match.van_number} (series '${series.id}') có pick_index != null.`)
                    }
                    if (action.lane_position !== null) {
                        fail(`Lượt BAN tại ván ${match.van_number} (series '${series.id}') có lane_position != null.`)
                    }
                } else if (action.action_type === "pick") {
                    if (typeof action.pick_index !== "number" || action.pick_index < 1 || action.pick_index > 10) {
                        fail(`Lượt PICK tại ván ${match.van_number} (series '${series.id}') có pick_index không hợp lệ: ${action.pick_index}`)
                    }
                    if (action.lane_position && !VALID_LANES.has(action.lane_position)) {
                        fail(`Lượt PICK tại ván ${match.van_number} (series '${series.id}') có lane không hợp lệ: ${action.lane_position}`)
                    }
                }
            }
        }
    }
}

if (unknownHeroes.size > 0) {
    fail(`Tìm thấy ${unknownHeroes.size} tướng chưa có trong manifest: ${Array.from(unknownHeroes).join(", ")}`)
}

console.log("--------------------------------------------------")
success(`Audit hoàn tất không có lỗi!`)
console.log(`📊 Thống kê:`)
console.log(`   - Tổng Series:  ${totalSeriesCount}`)
console.log(`   - Tổng Matches: ${totalMatchCount}`)
console.log(`   - Tổng Actions: ${totalActionCount}`)
console.log(`   - Tổng Tướng:   ${heroSlugs.size} (100% khớp manifest)`)
console.log("==================================================")
process.exit(0)
