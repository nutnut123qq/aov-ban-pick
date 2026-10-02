/**
 * Kéo dữ liệu ban/pick từ Liquipedia (wiki Honor of Kings — cover cả giải Liên Quân)
 * và sinh file export đúng schema `public/data/matches/`, giống trang /draft-input.
 *
 * Dùng:
 *   node scripts/import-liquipedia.mjs "<page>" --patch <id> [--tournament <name>] [--out <file>]
 *
 * tournament_name/team_id lấy theo tên chuẩn Liquipedia: --tournament chỉ là override;
 * mặc định script tự đọc |name= từ trang giải (param |tournament= trong từng {{Match}}).
 *
 * Ví dụ:
 *   node scripts/import-liquipedia.mjs "Arena_of_Glory/2026/Winter/Group_Stage/First_Leg" \
 *       --patch p_1 --tournament "AOG Winter 2026" --out exports/aog-w26-leg1.json
 *   node scripts/merge.mjs exports/aog-w26-leg1.json --season aog-2026-winter
 *
 * <page> có thể là title Liquipedia (vd "Arena_of_Glory/2026/Winter/Group_Stage/First_Leg")
 * hoặc URL đầy đủ. Nếu trang không chứa {{Match}} mà chỉ transclude trang con
 * ({{:Sub page}}), script tự kéo các trang con (độ sâu 1).
 *
 * Điều Liquipedia CÓ: side blue/red từng ván, winner, length, 5 picks + 4 bans
 *   theo thứ tự hiển thị broadcast (picks = thứ tự lane: top→rừng→mid→AD→SP;
 *   bans = đúng thứ tự cấm), ngày, đội, VOD.
 * Điều Liquipedia KHÔNG có: lane rõ ràng (suy từ vị trí pick), thứ tự pick thật
 *   giữa 2 đội (pick_index/is_counter_pick là xấp xỉ theo quy ước), player per
 *   pick, first_blood/first_turret, patch (flag --patch).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { dirname, join } from "path"

const ROOT = process.cwd()
const MANIFEST_FILE = join(ROOT, "public", "images", "heroes", "manifest.json")
const API = "https://liquipedia.net/honorofkings/api.php"
const UA = "AovDraftmind-Importer/1.0 (https://github.com; local data tooling)"
const FETCH_DELAY_MS = 2500 // Liquipedia yêu cầu rate-limit nhẹ tay

/** Lane theo vị trí pick trên overlay (xác nhận: trái→phải = top,rừng,mid,AD,SP). */
const PICK_LANES = ["ta_than", "rung", "giua", "rong_xa", "rong_ho_tro"]

/** Trình tự ĐTDV: 8 cấm + 10 chọn — bản sao của src/features/draft-input/sequence.ts. */
const SEQ = [
    { t: 1, s: "blue", a: "ban" }, { t: 2, s: "red", a: "ban" },
    { t: 3, s: "blue", a: "ban" }, { t: 4, s: "red", a: "ban" },
    { t: 5, p: 1, s: "blue", a: "pick" }, { t: 6, p: 2, s: "red", a: "pick" },
    { t: 6, p: 3, s: "red", a: "pick" }, { t: 7, p: 4, s: "blue", a: "pick" },
    { t: 7, p: 5, s: "blue", a: "pick" }, { t: 8, p: 6, s: "red", a: "pick" },
    { t: 9, s: "red", a: "ban" }, { t: 10, s: "blue", a: "ban" },
    { t: 11, s: "red", a: "ban" }, { t: 12, s: "blue", a: "ban" },
    { t: 13, p: 7, s: "red", a: "pick" }, { t: 14, p: 8, s: "blue", a: "pick" },
    { t: 14, p: 9, s: "blue", a: "pick" }, { t: 15, p: 10, s: "red", a: "pick" },
]

/** Slot index trong SEQ của các ô cấm, theo bên + thứ tự cấm thật. */
const BAN_SLOTS = { blue: [0, 2, 11, 13], red: [1, 3, 10, 12] }
/** Slot index trong SEQ của các ô chọn, theo bên + vị trí hiển thị. */
const PICK_SLOTS = { blue: [4, 7, 8, 15, 16], red: [5, 6, 9, 14, 17] }

/** Alias tướng sau khi normalize (LP viết khác manifest). */
const HERO_SLUG_ALIAS = {
    "lu-bu": "lu-bo", // LP: "lu bu"; manifest: lu-bo
    "ybneth": "y-bneth", // LP viết không nhất quán: "ybneth" / "y'bneth"
    "elandorr": "eland-orr", // LP: "elandorr" / "eland'orr"
    "darcy": "d-arcy",
    "azzenka": "azzen-ka",
    "telannas": "tel-annas", // LP viết liền: "telannas" / "tel'annas"
    "flowborn-mage": "flowborn-mid", // LP: "Flowborn (Mage)" = dạng mid
    // Lưu ý: "zanis"/"riktor" KHÔNG phải zephys/richter — LP có ván pick
    // cả hai cùng team. Đây là tướng riêng → importer tự kéo icon về manifest.
    "teemee": "teemee",
}

// ── Tiện ích ─────────────────────────────────────────────────────────────────
const fail = (msg) => {
    console.error(`\n❌  ${msg}\n`)
    process.exit(1)
}
const warn = (msg) => console.warn(`⚠️  ${msg}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** slugify giống export.ts (a-z,0-9,_) — dùng cho team_id/series id. */
const slugify = (s) =>
    s.normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/đ/gi, "d")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")

/** slug → tên gốc trên LP (phục vụ tự kéo icon tướng còn thiếu). */
const slugToLpName = new Map()

/** Tên tướng LP ("Eland'orr", "Flowborn (Marksman)") → slug manifest. */
const heroSlug = (name) => {
    const n = name.trim().toLowerCase()
    let s = n.normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
    // "flowborn (marksman)" → "flowborn-ad"; "(mid lane)"/"(mid)" → "-mid"
    s = s.replace(/\((marksman|ad carry|adc|mm)\)/g, "-ad")
        .replace(/\((mid lane|mid|midlaner)\)/g, "-mid")
        .replace(/['’]/g, "-")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    const slug = HERO_SLUG_ALIAS[s] ?? s
    if (slug) slugToLpName.set(slug, name.trim())
    return slug
}

const teamId = (displayName) => `team_${slugify(displayName)}`

// ── Parse tham số ────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
let page, patch, tournament, out
let fresh = false

for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--patch") patch = argv[++i]
    else if (a === "--tournament") tournament = argv[++i]
    else if (a === "--out") out = argv[++i]
    else if (a === "--fresh") fresh = true
    else if (a === "--help" || a === "-h") {
        console.log(`\n  node scripts/import-liquipedia.mjs "<page>" --patch <id> [--tournament <name>] [--out <file>]\n`)
        process.exit(0)
    } else if (a.startsWith("--")) fail(`Cờ không hiểu: ${a}`)
    else if (!page) page = a
    else fail(`Tham số dư: ${a}`)
}

if (!page) fail("Thiếu <page> (vd \"Arena_of_Glory/2026/Winter/Group_Stage/First_Leg\").")
if (!patch) fail("Thiếu --patch <id> (vd p_1). Patch gắn vào mọi series nên bắt buộc nhập rõ.")

// Cho phép truyền URL đầy đủ → lấy phần title sau domain
page = decodeURIComponent(page)
    .replace(/^https?:\/\/[^/]+\/(honorofkings|arenaofvalor)\//i, "")
    .replace(/^\/+/, "")
if (!page) fail("Không suy ra được page title từ tham số.")

if (!out) out = `lp-import-${slugify(page).replace(/_/g, "-")}.json`

// ── Manifest tướng ───────────────────────────────────────────────────────────
let heroSlugs = null
let manifestData = null
if (existsSync(MANIFEST_FILE)) {
    manifestData = JSON.parse(readFileSync(MANIFEST_FILE, "utf-8"))
    heroSlugs = new Set(manifestData.map((h) => h.slug))
} else {
    warn("Không thấy manifest tướng — không kiểm tra hero_id tồn tại được.")
}

const HEROES_DIR = join(ROOT, "public", "images", "heroes")
const HERO_URLS_FILE = join(ROOT, "hero-urls.json")
const heroUrls = existsSync(HERO_URLS_FILE) ? JSON.parse(readFileSync(HERO_URLS_FILE, "utf-8")) : []

/**
 * Với mỗi slug còn thiếu: tra `File:<Tên LP> Hero Icon.(png|jpg)` trên
 * Liquipedia commons, tải về HEROES_DIR và bổ sung manifest.json.
 * Trả về danh sách slug vẫn không tìm được.
 */
async function fetchMissingHeroIcons(slugs) {
    const stillMissing = []
    for (const slug of slugs) {
        const lpName = slugToLpName.get(slug) || slug
        const base = lpName.replace(/\s*\([^)]*\)\s*/g, "").trim()
        const stems = [...new Set([lpName, base])]
        const titles = stems.flatMap((s) => [`File:${s} Hero Icon.png`, `File:${s} Hero Icon.jpg`])
        const j = await lpApi({ action: "query", titles: titles.join("|"), prop: "imageinfo", iiprop: "url" })
        const found = (j.query?.pages || []).find((pg) => pg.imageinfo?.[0]?.url)
        if (!found) { stillMissing.push(slug); continue }
        const url = found.imageinfo[0].url
        const ext = url.match(/\.(png|jpg|jpeg|webp)/i)?.[0] || ".png"
        const file = `${slug}${ext.toLowerCase()}`
        const res = await fetch(url, { headers: { "User-Agent": UA } }).catch(() => null)
        if (!res?.ok) { stillMissing.push(slug); continue }
        writeFileSync(join(HEROES_DIR, file), Buffer.from(await res.arrayBuffer()))
        const pretty = base.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1))
        manifestData.push({ name: pretty, slug, file })
        heroSlugs.add(slug)
        if (!heroUrls.some((h) => h.name === pretty)) heroUrls.push({ name: pretty, url })
        console.log(`   ＋ hero mới: ${pretty} (${file})`)
        await sleep(FETCH_DELAY_MS)
    }
    return stillMissing
}

// ── API Liquipedia ───────────────────────────────────────────────────────────
const CACHE_DIR = join(ROOT, "scripts", ".lp-cache")
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 phút; truyền --fresh để bỏ cache

async function lpApi(params, attempt = 1) {
    const qs = new URLSearchParams({ ...params, format: "json", formatversion: "2" }).toString()
    const cacheFile = join(CACHE_DIR, Buffer.from(qs).toString("base64url") + ".json")
    if (!fresh && existsSync(cacheFile)) {
        const st = JSON.parse(readFileSync(cacheFile, "utf-8"))
        if (Date.now() - st.t < CACHE_TTL_MS) return st.j
    }
    const url = `${API}?${qs}`
    try {
        const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Encoding": "gzip" } })
        if (res.status === 429 && attempt < 5) {
            await sleep(10000 * attempt) // bị rate-limit: nghỉ dần rồi thử lại
            return lpApi(params, attempt + 1)
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const j = await res.json()
        mkdirSync(CACHE_DIR, { recursive: true })
        writeFileSync(cacheFile, JSON.stringify({ t: Date.now(), j }))
        return j
    } catch (e) {
        if (attempt >= 5) fail(`Liquipedia lỗi sau ${attempt} lần: ${e.message}`)
        await sleep(FETCH_DELAY_MS * attempt)
        return lpApi(params, attempt + 1)
    }
}

async function fetchWikitext(p) {
    const j = await lpApi({ action: "parse", page: p, prop: "wikitext" })
    return j.parse?.wikitext ?? null
}

async function fetchHtml(p) {
    const j = await lpApi({ action: "parse", page: p, prop: "text" })
    return j.parse?.text ?? null
}

/**
 * Trích tên đội theo thứ tự trận từ HTML render: mỗi trận là một
 * `brkts-match-popup-wrapper`, trong đó link đội có `title="Tên đội"`.
 * Trả mảng các cặp [tên1, tên2] — index khớp thứ tự {{Match}} trong wikitext.
 */
function extractMatchTeams(html) {
    const chunks = html.split(/brkts-match-popup-wrapper/)
    const perChunk = chunks.slice(1).map((chunk) => {
        // Ưu tiên title trong .block-team (ô tên đội). Một số trang (vd APL)
        // đặt link tướng trước link đội trong popup → scan thô sẽ lấy nhầm.
        let titles = [...chunk.matchAll(/block-team[^]*?<a\s[^>]*?title="([^"]+)"/g)].map((m) => m[1])
        if (titles.length < 2) {
            titles = [...chunk.matchAll(/<a href="\/honorofkings\/[^"]*"[^>]*?title="([^"]+)"[^>]*?>/g)].map((m) => m[1])
        }
        const names = []
        for (const raw of titles) {
            const n = raw.trim().replace(/&#(\d+);/g, (_, c) => String.fromCharCode(+c))
            if (!n || n === names[names.length - 1] || n.includes("File:")) continue
            names.push(n)
            if (names.length === 2) break
        }
        return names
    })
    // Một số trang render wrapper 2 lần/trận → bỏ chunk rỗng để zip đúng index
    return perChunk.filter((names) => names.length === 2)
}

// ── Trích {{Template}} cân bằng ngoặc ───────────────────────────────────────
function extractTemplates(text, name) {
    const blocks = []
    const open = `{{${name}`
    let i = 0
    while ((i = text.indexOf(open, i)) !== -1) {
        const after = text[i + open.length]
        if (after && /[a-zA-Z]/.test(after)) { i += open.length; continue } // Matchlist ≠ Match
        let depth = 0, j = i
        while (j < text.length) {
            const two = text.slice(j, j + 2)
            if (two === "{{") { depth++; j += 2 }
            else if (two === "}}") { depth--; j += 2; if (depth === 0) break }
            else j++
        }
        blocks.push(text.slice(i, j))
        i = j
    }
    return blocks
}

/** Parse |key=value của một block template (positional param → key "" theo thứ tự). */
function parseTemplate(block) {
    const inner = block.slice(2, -2)
    const name = inner.slice(0, inner.search(/[|\n]/)).trim()
    const params = new Map()
    const positional = []
    let depth = 0, seg = ""
    const parts = []
    for (let i = 0; i < inner.length; i++) {
        const two = inner.slice(i, i + 2)
        if (two === "{{") { depth++; seg += two; i++ }
        else if (two === "}}") { depth--; seg += two; i++ }
        else if (inner[i] === "|" && depth === 0) { parts.push(seg); seg = "" }
        else seg += inner[i]
    }
    parts.push(seg)
    for (const p of parts) {
        const eq = p.indexOf("=")
        if (eq === -1) { if (p.trim()) positional.push(p.trim()); continue }
        const k = p.slice(0, eq).trim(), v = p.slice(eq + 1)
        if (k && !params.has(k)) params.set(k, v)
    }
    return { name, params, positional }
}

// ── Giải mã đội: tên hiển thị lấy từ HTML render (prop=text) ────────────────
// {{TeamOpponent|code}} expand ra JSON marker nội bộ, không phải tên — nên đọc
// trực tiếp link đội trong card trận đã render.

// ── Sinh draft_actions từ 1 Map LP ───────────────────────────────────────────
function buildActions(map, warnings, tag, isBlind) {
    // side: team1 nằm bên nào
    const s1 = (map.get("team1side") || "").trim().toLowerCase()
    const s2 = (map.get("team2side") || "").trim().toLowerCase()
    if (s1 !== "blue" && s1 !== "red") { warnings.push(`${tag}: thiếu/không hiểu team1side (${s1})`); return null }

    const get = (side, kind, i) => (map.get(`t${side}${kind}${i}`) || "").trim()
    const lists = { blue: { bans: [], picks: [] }, red: { bans: [], picks: [] } }
    for (const [team, side] of [["1", s1], ["2", s2]]) {
        for (let i = 1; i <= 4; i++) lists[side].bans.push(heroSlug(get(team, "b", i)))
        for (let i = 1; i <= 5; i++) lists[side].picks.push(heroSlug(get(team, "h", i)))
    }

    for (const side of ["blue", "red"]) {
        if (lists[side].bans.some((h) => !h) || lists[side].picks.some((h) => !h)) {
            warnings.push(`${tag}: thiếu ban/pick ở bên ${side}`)
            return null
        }
    }

    // Blind pick (BO7 ván 7) được trùng tướng; còn lại trùng = lỗi dữ liệu LP
    if (!isBlind) {
        const all = [...lists.blue.bans, ...lists.blue.picks, ...lists.red.bans, ...lists.red.picks]
        const dup = all.find((h, i) => all.indexOf(h) !== i)
        if (dup) {
            warnings.push(`${tag}: trùng tướng "${dup}" — dữ liệu LP lỗi, bỏ qua ván`)
            return null
        }
    }

    const heroAt = SEQ.map(() => null)
    const laneAt = SEQ.map(() => null)
    for (const side of ["blue", "red"]) {
        lists[side].bans.forEach((h, i) => { heroAt[BAN_SLOTS[side][i]] = h })
        lists[side].picks.forEach((h, i) => {
            const idx = PICK_SLOTS[side][i]
            heroAt[idx] = h
            laneAt[idx] = PICK_LANES[i]
        })
    }

    return SEQ.map((step, i) => {
        const isPick = step.a === "pick"
        const lane = isPick ? laneAt[i] : null
        // is_counter_pick theo cùng quy ước export.ts — XẤP XỈ vì thứ tự pick
        // giữa 2 đội không có trên LP (chỉ có thứ tự hiển thị theo lane).
        let isCounterPick = false
        if (isPick && lane) {
            isCounterPick = SEQ.some((e, j) => e.a === "pick" && j < i && e.s !== step.s && laneAt[j] === lane)
        }
        return {
            turn_number: step.t,
            pick_index: isPick ? step.p : null,
            team_side: step.s,
            action_type: step.a,
            hero_id: heroAt[i],
            lane_position: lane,
            player_id: null,
            is_counter_pick: isCounterPick,
        }
    })
}

// ── Main ─────────────────────────────────────────────────────────────────────
const MONTHS = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 }

const parseDate = (raw) => {
    const m = raw.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/)
    if (!m) return null
    const mo = MONTHS[m[1].toLowerCase()]
    return mo ? `${m[3]}-${String(mo).padStart(2, "0")}-${m[2].padStart(2, "0")}` : null
}

const parseDuration = (raw) => {
    const m = (raw || "").trim().match(/^(\d+):(\d{2})$/)
    return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

async function collectPages(p, out = [], depth = 0) {
    const w = await fetchWikitext(p)
    if (!w) { warn(`Trang không tồn tại hoặc không đọc được: ${p}`); return out }
    // Strip <!-- comment --> — nội dung comment (kể cả dấu ngoặc) không phải dữ liệu
    const clean = w.replace(/<!--[\s\S]*?-->/g, "")
    const matchBlocks = extractTemplates(clean, "Match")
    if (matchBlocks.length > 0) {
        await sleep(FETCH_DELAY_MS)
        const html = await fetchHtml(p)
        out.push({ page: p, wikitext: clean, html })
        return out
    }
    if (depth > 0) return out
    // Không có trận → thử transclude {{:Sub page}}
    const subs = extractTemplates(clean, ":").map((b) => parseTemplate(b).name.replace(/^:\s*/, "").trim())
    const uniq = [...new Set(subs)].filter((s) => s && !s.startsWith("#"))
    if (uniq.length === 0) { warn(`Không thấy {{Match}} hay trang con nào trong ${p}`); return out }
    console.log(`  ⤷ "${p}" transclude ${uniq.length} trang con — kéo từng trang...`)
    for (const s of uniq) {
        await sleep(FETCH_DELAY_MS)
        await collectPages(s, out, depth + 1)
    }
    return out
}

console.log(`\n📥 Fetch "${page}" ...`)
const pages = await collectPages(page)
if (pages.length === 0) fail("Không thu được trang nào chứa trận đấu.")

// Parse tất cả Match blocks + tên đội theo thứ tự từ HTML
const matchEntries = []
for (const { page: p, wikitext, html } of pages) {
    const blocks = extractTemplates(wikitext, "Match")
    const teamsByMatch = html ? extractMatchTeams(html) : []
    if (teamsByMatch.length && teamsByMatch.length !== blocks.length) {
        warn(`${p}: HTML có ${teamsByMatch.length} trận nhưng wikitext có ${blocks.length} — tên đội có thể lệch`)
    }
    blocks.forEach((block, i) => {
        matchEntries.push({ page: p, tpl: parseTemplate(block), names: teamsByMatch[i] })
    })
}
console.log(`   ${pages.length} trang · ${matchEntries.length} series (Match blocks)`)
if (matchEntries.length === 0) fail("Không parse được {{Match}} nào.")

// ── Tên giải chuẩn theo LP: thử param |tournament= trong Match (hiếm khi có),
// rồi leo dần đường dẫn cha của trang cho tới khi gặp trang có |name= trong
// infobox (trang giải mẹ). Fallback: prettify path.
const prettyLpPath = (p) => p.replace(/_/g, " ").replace(/\//g, " ")

async function resolveTournamentName() {
    const candidates = [
        ...new Set(matchEntries.map((e) => (e.tpl.params.get("tournament") || "").trim()).filter(Boolean)),
    ]
    let p = page
    for (let i = 0; i < 3 && p.includes("/"); i++) {
        p = p.slice(0, p.lastIndexOf("/"))
        candidates.push(p)
    }
    for (const c of candidates) {
        await sleep(FETCH_DELAY_MS)
        const w = await fetchWikitext(c)
        const nm = w?.match(/\|\s*name\s*=\s*([^\n|]+)/)?.[1]?.trim()
        if (nm) return nm
    }
    return prettyLpPath(page)
}

if (!tournament) {
    tournament = await resolveTournamentName()
    console.log(`   giải: "${tournament}"`)
}

// Build Series[]
const warnings = []
const unknownHeroes = new Set()
const seriesList = []
let gamesOk = 0, gamesSkipped = 0

for (const { page: p, tpl, names } of matchEntries) {
    const rawOpp = (k) => {
        const raw = tpl.params.get(k) || ""
        const tm = raw.match(/\{\{TeamOpponent\|([^}|]+)/)
        return tm ? tm[1].trim() : raw.trim()
    }
    const n1 = names?.[0] || rawOpp("opponent1")
    const n2 = names?.[1] || rawOpp("opponent2")
    const id1 = teamId(n1), id2 = teamId(n2)

    const bestof = Number((tpl.params.get("bestof") || "3").replace(/\D/g, "")) || 3
    const date = parseDate(tpl.params.get("date") || "")
    const tagBase = `${n1} vs ${n2} (${date ?? "?"}) @ ${p}`

    // Lấy các Map theo thứ tự map1..mapN
    const mapKeys = [...tpl.params.keys()].filter((k) => /^map\d+$/.test(k)).sort((a, b) => +a.slice(3) - +b.slice(3))
    const matches = []
    let wins1 = 0, wins2 = 0
    for (const mk of mapKeys) {
        const van = Number(mk.slice(3))
        const raw = tpl.params.get(mk) || ""
        const mblocks = extractTemplates(raw, "Map")
        if (mblocks.length === 0) continue
        const map = parseTemplate(mblocks[0]).params
        const w = (map.get("winner") || "").trim()
        if (w === "skip" || w === "" || (map.get("finished") || "") === "skip") continue
        const tag = `${tagBase} · ván ${van}`

        const isBlind = bestof === 7 && van === 7 // ĐTDV: ván 7 BO7 = chọn ẩn
        const actions = buildActions(map, warnings, tag, isBlind)
        if (!actions) { gamesSkipped++; continue }

        const winnerTeam = w === "1" ? id1 : w === "2" ? id2 : null
        if (!winnerTeam) { warnings.push(`${tag}: winner="${w}" không hợp lệ`); gamesSkipped++; continue }
        w === "1" ? wins1++ : wins2++

        const blueId = (map.get("team1side") || "").trim().toLowerCase() === "blue" ? id1 : id2
        const match = {
            van_number: van,
            team_blue_id: blueId,
            team_red_id: blueId === id1 ? id2 : id1,
            winner_team_id: winnerTeam,
            is_blind_pick: isBlind,
            draft_actions: actions,
        }
        const dur = parseDuration(map.get("length"))
        if (dur) match.duration_seconds = dur
        matches.push(match)
        gamesOk++
    }
    if (matches.length === 0) continue

    if (heroSlugs) {
        for (const m of matches) for (const a of m.draft_actions) {
            if (a.hero_id && !heroSlugs.has(a.hero_id)) unknownHeroes.add(a.hero_id)
        }
    }

    const seriesWinner = wins1 >= wins2 ? id1 : id2
    const map1 = matches[0]
    const [ta, tb] = [slugify(n1), slugify(n2)].sort()
    seriesList.push({
        id: `s_${slugify(tournament).replace(/[^a-z0-9]+/g, "_")}_${(date || "unknown").replace(/-/g, "_")}_${ta}vs${tb}`,
        tournament_name: tournament,
        patch_id: patch,
        format: `BO${bestof}`,
        team_blue_id: map1.team_blue_id,
        team_red_id: map1.team_red_id,
        winner_team_id: seriesWinner,
        played_at: date || "1970-01-01",
        matches,
    })
}

// ── Báo cáo + ghi file ───────────────────────────────────────────────────────
console.log(`\n📊 ${seriesList.length} series · ${gamesOk} ván import được` +
    (gamesSkipped ? ` · ${gamesSkipped} ván bỏ qua (thiếu data)` : ""))
// Tướng LP có mà manifest thiếu → tự kéo icon từ LP commons + cập nhật manifest
if (unknownHeroes.size && manifestData) {
    console.log(`\n🧩  ${unknownHeroes.size} tướng chưa có trong manifest — kéo icon từ LP commons...`)
    const still = await fetchMissingHeroIcons([...unknownHeroes])
    if (still.length < unknownHeroes.size) {
        writeFileSync(MANIFEST_FILE, JSON.stringify(manifestData, null, 2) + "\n")
        writeFileSync(HERO_URLS_FILE, JSON.stringify(heroUrls, null, 2) + "\n")
    }
    if (still.length) {
        warn(`vẫn thiếu (merge sẽ từ chối ván chứa chúng): ${still.join(", ")}`)
    }
} else if (unknownHeroes.size) {
    warn(`hero_id chưa có trong manifest (merge sẽ từ chối ván chứa chúng): ${[...unknownHeroes].join(", ")}`)
}
if (warnings.length) {
    console.log(`\n⚠️  ${warnings.length} cảnh báo:`)
    warnings.slice(0, 20).forEach((w) => console.log(`   - ${w}`))
    if (warnings.length > 20) console.log(`   ... và ${warnings.length - 20} cảnh báo khác`)
}

mkdirSync(dirname(join(ROOT, out)), { recursive: true })
writeFileSync(join(ROOT, out), JSON.stringify(seriesList, null, 2) + "\n")
console.log(`\n✅  Ghi ${out}`)
console.log(`👉  node scripts/merge.mjs ${out} --season <season-id>\n`)
