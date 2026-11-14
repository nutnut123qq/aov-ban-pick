/* eslint-disable @typescript-eslint/no-require-imports -- script Node CommonJS dùng Playwright cài global, không thuộc app */
// Usage: node e2e.cjs <outDir> [baseUrl]
// E2E nghiệm thu draft/meta/navbar trên Chromium thật. Ghi bước/kỳ vọng/thực tế/kết quả vào e2e.json.
const path = require("path")
const fs = require("fs")
const { chromium } = require(path.join(process.env.APPDATA, "npm/node_modules/playwright"))

const outDir = process.argv[2]
const base = process.argv[3] || "http://localhost:3000"
fs.mkdirSync(outDir, { recursive: true })

const steps = []
const rec = (area, name, expect, actual, pass) => {
    const result = pass === null ? "UNVERIFIED" : pass ? "PASS" : "FAIL"
    steps.push({ area, name, expect, actual: String(actual), result })
    console.log(`${result.padEnd(10)} [${area}] ${name} — ${actual}`)
}
const consoleErrors = []
const watch = (page, label) => {
    page.on("console", (m) => {
        if (m.type() === "error") consoleErrors.push({ label, text: m.text().slice(0, 300) })
    })
    page.on("pageerror", (e) => consoleErrors.push({ label, text: String(e).slice(0, 300) }))
}
const shot = (page, name) => page.screenshot({ path: path.join(outDir, name) })

const banner = async (page) => ({
    label: (await page.locator("[data-turn-banner] p").first().innerText()).trim(),
    step: (await page.locator("[data-turn-banner] span").first().innerText()).trim(),
})
const suggestionButtons = (page) =>
    page.locator("[data-slot=card]", { hasText: "Gợi ý cấm/chọn" }).locator("button:has(img)")
const waitSuggestions = (page) => suggestionButtons(page).first().waitFor({ timeout: 30000 })
const slotLabels = (page) =>
    page.locator("button[aria-label^='CẤM:'], button[aria-label^='CHỌN']").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")))
const hOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)

const draftDesktop = async (browser) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" })
    await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base })
    const page = await ctx.newPage()
    watch(page, "draft-desktop")
    await page.goto(`${base}/vi/draft`, { waitUntil: "networkidle" })
    await waitSuggestions(page)
    let b = await banner(page)
    rec("draft-desktop", "Bắt đầu draft", "Bên Xanh · CẤM, Bước 1/18", `${b.label}, ${b.step}`, b.label === "Bên Xanh · CẤM" && b.step === "Bước 1/18")
    const undo = page.getByRole("button", { name: "Hoàn tác" })
    rec("draft-desktop", "Hoàn tác bị khoá khi chưa có lượt", "disabled", (await undo.isDisabled()) ? "disabled" : "enabled", await undo.isDisabled())

    // Picker bằng bàn phím: Enter mở, Escape đóng, focus trả về nút.
    const pickBtn = page.getByRole("button", { name: "Chọn tướng" })
    await pickBtn.focus()
    await page.keyboard.press("Enter")
    const dialog = page.getByRole("dialog")
    await dialog.waitFor()
    await page.keyboard.press("Escape")
    await dialog.waitFor({ state: "hidden" })
    await page.waitForTimeout(300)
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim())
    rec("draft-desktop", "Picker: Enter mở → Escape đóng → focus trả về", "focus ở nút 'Chọn tướng'", focused, focused === "Chọn tướng")

    // Focus nhìn thấy: từ "Chọn tướng" Tab qua nguồn gợi ý tới gợi ý đầu.
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    const fv = await page.evaluate(() => {
        const el = document.activeElement
        const r = el.getBoundingClientRect()
        return { text: el.textContent.trim().slice(0, 24), fv: el.matches(":focus-visible"), shadow: getComputedStyle(el).boxShadow, box: { x: r.x - 12, y: r.y - 12, width: r.width + 24, height: r.height + 24 } }
    })
    await page.screenshot({ path: path.join(outDir, "focus-visible-suggestion.png"), clip: fv.box })
    rec("draft-desktop", "Focus nhìn thấy khi Tab tới gợi ý", ":focus-visible + ring (box-shadow)", `${fv.text}; fv=${fv.fv}; shadow=${fv.shadow.slice(0, 40)}`, fv.fv && fv.shadow !== "none")

    // Ban/pick bằng picker.
    await pickBtn.click()
    await dialog.waitFor()
    const hero = dialog.locator("button:not([disabled]):has(img)").first()
    const heroName = (await hero.innerText()).trim()
    await hero.click()
    await dialog.waitFor({ state: "hidden" })
    b = await banner(page)
    const labels1 = await slotLabels(page)
    rec("draft-desktop", "Cấm bằng picker", `ô CẤM đầu = ${heroName}; chuyển Bên Đỏ · CẤM 2/18`, `${labels1[0]}; ${b.label} ${b.step}`, labels1[0] === `CẤM: ${heroName}` && b.label === "Bên Đỏ · CẤM" && b.step === "Bước 2/18")

    // Gợi ý tới lượt chọn đầu.
    for (let i = 0; i < 3; i++) await suggestionButtons(page).first().click()
    b = await banner(page)
    rec("draft-desktop", "Áp dụng gợi ý cho 3 lượt cấm", "Bên Xanh · CHỌN 1, Bước 5/18", `${b.label}, ${b.step}`, b.label === "Bên Xanh · CHỌN 1" && b.step === "Bước 5/18")
    await suggestionButtons(page).first().click()
    const lane1 = page.getByRole("combobox", { name: "Lane · CHỌN 1", exact: true })
    const laneAfterSuggest = (await lane1.innerText()).trim()
    rec("draft-desktop", "Gợi ý pick kèm lane", "lane CHỌN 1 được điền", laneAfterSuggest, laneAfterSuggest !== "Lane")

    // Chọn lane thủ công.
    await lane1.click()
    await page.getByRole("option", { name: "Rừng" }).click()
    rec("draft-desktop", "Chọn lane thủ công", "CHỌN 1 = Rừng", (await lane1.innerText()).trim(), (await lane1.innerText()).trim() === "Rừng")

    // Undo.
    await undo.click()
    b = await banner(page)
    const labels2 = await slotLabels(page)
    const pick1 = labels2.find((l) => l.startsWith("CHỌN 1:"))
    rec("draft-desktop", "Hoàn tác", "về Bước 5/18, CHỌN 1 trống/lượt này", `${b.step}; ${pick1}`, b.step === "Bước 5/18" && pick1 === "CHỌN 1: → Lượt này")

    // Xoá một ô cấm → lượt hiện tại quay về ô đó.
    await page.getByRole("button", { name: "Xoá lựa chọn" }).first().click()
    b = await banner(page)
    rec("draft-desktop", "Xoá lựa chọn ô cấm đầu", "lượt về Bước 1/18 Bên Xanh · CẤM", `${b.label}, ${b.step}`, b.step === "Bước 1/18" && b.label === "Bên Xanh · CẤM")

    // Hoàn thành draft bằng gợi ý.
    for (let i = 0; i < 30; i++) {
        if (!(await pickBtn.isVisible())) break
        await suggestionButtons(page).first().click()
    }
    b = await banner(page)
    const complete = b.label === "Đã đủ cấm/chọn cho ván này" && b.step === "Bước 18/18"
    rec("draft-desktop", "Hoàn thành draft 18 bước", "banner hoàn tất, Bước 18/18, ẩn 'Chọn tướng'", `${b.label}, ${b.step}, pickBtn=${await pickBtn.isVisible()}`, complete && !(await pickBtn.isVisible()))
    const score = page.getByText("Đánh giá đội hình")
    rec("draft-desktop", "Score card hiện khi đủ pick", "thấy 'Đánh giá đội hình'", await score.isVisible(), await score.isVisible())
    const histCount = await page.locator("button[aria-expanded]", { hasText: "Draft đã lưu" }).innerText()
    rec("draft-desktop", "Lịch sử tự lưu khi đủ 18 bước", "Draft đã lưu (≥1)", histCount.replace(/\s+/g, " "), /\(\d+\)/.test(histCount))
    await shot(page, "draft-desktop-complete.png")

    // Chia sẻ URL.
    const copyLink = page.getByRole("button", { name: "Sao chép link draft" })
    await copyLink.click()
    const copiedVisible = await page.getByRole("button", { name: "Đã chép link!" }).isVisible()
    const clip = await page.evaluate(() => navigator.clipboard.readText())
    rec("draft-desktop", "Sao chép link draft", "nhãn 'Đã chép link!' + clipboard có ?d=", `${copiedVisible}; ${clip.slice(0, 80)}`, copiedVisible && clip.includes("d="))
    const finalLabels = await slotLabels(page)

    const page2 = await ctx.newPage()
    watch(page2, "draft-restore")
    await page2.goto(clip, { waitUntil: "networkidle" })
    await waitSuggestions(page2).catch(() => {})
    await page2.waitForTimeout(1000)
    const restored = await slotLabels(page2)
    const b2 = await banner(page2)
    rec("draft-desktop", "Khôi phục draft từ URL share", "18 ô giống hệt + banner hoàn tất", `${b2.step}; same=${JSON.stringify(restored) === JSON.stringify(finalLabels)}`, JSON.stringify(restored) === JSON.stringify(finalLabels) && b2.step === "Bước 18/18")
    await page2.close()

    // History: reset rồi tải lại từ lịch sử.
    await page.getByRole("button", { name: "Làm lại" }).click()
    b = await banner(page)
    rec("draft-desktop", "Làm lại", "Bước 1/18, Hoàn tác khoá", `${b.step}, undoDisabled=${await undo.isDisabled()}`, b.step === "Bước 1/18" && (await undo.isDisabled()))
    await page.locator("button[aria-expanded]", { hasText: "Draft đã lưu" }).click()
    await page.getByRole("button", { name: "Tải lại" }).first().click()
    const fromHistory = await slotLabels(page)
    rec("draft-desktop", "Tải lại draft từ lịch sử", "18 ô khớp draft đã lưu", JSON.stringify(fromHistory) === JSON.stringify(finalLabels), JSON.stringify(fromHistory) === JSON.stringify(finalLabels))

    // Global ban ván 2.
    const blueFirstPick = finalLabels.find((l) => l.startsWith("CHỌN 1:")).replace("CHỌN 1: ", "")
    await page.locator("#draft-van").click()
    await page.getByRole("option", { name: "2", exact: true }).click()
    const gbTitle = page.getByText("Tướng đã pick các ván trước")
    const gbImgs = await page.locator("[data-slot=card]", { hasText: "Tướng đã pick các ván trước" }).locator("img").count()
    b = await banner(page)
    rec("draft-desktop", "Ván 2: global ban", "khối global ban hiện 10 tướng; banner Bước 1/18", `visible=${await gbTitle.isVisible()}, imgs=${gbImgs}, ${b.step}`, (await gbTitle.isVisible()) && gbImgs === 10 && b.step === "Bước 1/18")
    await page.getByRole("button", { name: "Xoá lựa chọn" }).first().click()
    const gbImgsAfterClear = await page.locator("[data-slot=card]", { hasText: "Tướng đã pick các ván trước" }).locator("img").count()
    rec("draft-desktop", "Ván 2: xoá một global ban (nút có tên)", "còn 9 tướng", gbImgsAfterClear, gbImgsAfterClear === 9)
    await page.getByRole("button", { name: "Làm lại" }).click()
    // Sau "Làm lại" ván 2, override thủ công được xoá → global ban tính lại đủ 10.
    await pickBtn.click()
    await dialog.waitFor()
    const lockedBtn = dialog.locator("button:has(img)", { hasText: blueFirstPick }).first()
    const locked = await lockedBtn.isDisabled()
    rec("draft-desktop", "Ván 2: tướng Xanh đã pick ở ván 1 bị khoá trong picker", `${blueFirstPick} disabled`, locked, locked)
    await page.keyboard.press("Escape")
    await shot(page, "draft-desktop-van2.png")
    rec("draft-desktop", "Không tràn ngang", "false", await hOverflow(page), !(await hOverflow(page)))
    await ctx.close()
}

const draftMobile = async (browser) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark", hasTouch: true, isMobile: true })
    const page = await ctx.newPage()
    watch(page, "draft-mobile")
    await page.goto(`${base}/vi/draft`, { waitUntil: "networkidle" })
    await waitSuggestions(page)
    const pickBtn = page.getByRole("button", { name: "Chọn tướng" })
    const pb = await pickBtn.boundingBox()
    const banBox = await page.locator("[data-turn-banner]").boundingBox()
    const firstSug = await suggestionButtons(page).first().boundingBox()
    rec("draft-mobile", "Viewport đầu 390×844", "thấy lượt hiện tại, nút chọn tướng (≥44px), ≥1 gợi ý", `banner.bottom=${Math.round(banBox.y + banBox.height)}, pickBtn.h=${pb.height}, sug1.bottom=${Math.round(firstSug.y + firstSug.height)}`, banBox.y + banBox.height <= 844 && pb.height >= 44 && firstSug.y + firstSug.height <= 844)
    await pickBtn.tap()
    const sheet = page.getByRole("dialog")
    await sheet.waitFor()
    const hero = sheet.locator("button:not([disabled]):has(img)").first()
    const heroName = (await hero.innerText()).trim()
    await hero.tap()
    await sheet.waitFor({ state: "hidden" })
    let b = await banner(page)
    rec("draft-mobile", "Cấm bằng bottom sheet", `→ Bên Đỏ · CẤM 2/18 (đã cấm ${heroName})`, `${b.label}, ${b.step}`, b.step === "Bước 2/18")
    await suggestionButtons(page).first().tap()
    b = await banner(page)
    rec("draft-mobile", "Áp dụng gợi ý", "Bước 3/18", b.step, b.step === "Bước 3/18")
    await page.getByRole("button", { name: "Hoàn tác" }).tap()
    b = await banner(page)
    rec("draft-mobile", "Hoàn tác", "Bước 2/18", b.step, b.step === "Bước 2/18")
    const copyBtn = page.getByRole("button", { name: "Sao chép draft" })
    rec("draft-mobile", "Nút chỉ-icon vẫn có tên", "aria-label 'Sao chép draft'", await copyBtn.count(), (await copyBtn.count()) === 1)
    rec("draft-mobile", "Không tràn ngang 390", "false", await hOverflow(page), !(await hOverflow(page)))
    await page.screenshot({ path: path.join(outDir, "draft-mobile-fullpage.png"), fullPage: true })
    await ctx.close()
}

const metaRowsInfo = (page) =>
    page.locator("tbody tr").evaluateAll((trs) =>
        trs.filter((tr) => tr.offsetParent).map((tr) => {
            const td = [...tr.querySelectorAll("td")].map((x) => x.innerText.trim())
            return { name: td[0], lane: td[1], wr: parseFloat(td[3]) }
        }),
    )
const pageStatus = async (page) => (await page.locator("nav[aria-label='Phân trang bảng tướng'] span[aria-live]").innerText().catch(() => "")).trim()
const selectOption = async (page, trigger, option) => {
    await page.locator(trigger).click()
    await page.getByRole("option", { name: option, exact: true }).click()
}

const metaDesktop = async (browser) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" })
    const page = await ctx.newPage()
    watch(page, "meta-desktop")
    await page.goto(`${base}/vi/meta`, { waitUntil: "networkidle" })
    await page.locator("tbody tr").first().waitFor()
    const header = async () => (await page.locator("[data-slot=card-title]", { hasText: "dòng ·" }).innerText()).trim()
    let rows = await metaRowsInfo(page)
    rec("meta-desktop", "Trang 1", "206 dòng tổng, 25 dòng render, Trang 1/9", `${await header()}, rendered=${rows.length}, ${await pageStatus(page)}`, rows.length === 25 && (await pageStatus(page)) === "Trang 1/9")
    const comboTab = await page.getByRole("tab", { name: "Combo đồng đội" }).boundingBox()
    rec("meta-desktop", "Combo/kèo/duo ở đầu màn", "tab Combo trong viewport đầu", `y=${Math.round(comboTab.y)}`, comboTab.y + comboTab.height <= 900)

    // Truy cập đủ 206 dòng qua phân trang.
    const seen = new Set()
    for (let i = 0; i < 20; i++) {
        for (const r of await metaRowsInfo(page)) seen.add(`${r.name}|${r.lane}`)
        const next = page.getByRole("button", { name: "Trang sau" })
        if (await next.isDisabled()) break
        await next.click()
    }
    rec("meta-desktop", "Phân trang truy cập đủ kết quả", "206 dòng duy nhất qua các trang; trang cuối Trang 9/9", `${seen.size}, ${await pageStatus(page)}`, seen.size === 206 && (await pageStatus(page)) === "Trang 9/9")
    // Đổi filter từ trang cuối → về trang 1.
    await selectOption(page, "#meta-lane", "Rừng")
    rows = await metaRowsInfo(page)
    rec("meta-desktop", "Đổi vị trí từ trang cuối", "về trang 1, mọi dòng lane Rừng", `${await pageStatus(page) || "1 trang"}, ${await header()}, lanes=${[...new Set(rows.map((r) => r.lane))]}`, rows.every((r) => r.lane === "Rừng") && ["Trang 1/2", "Trang 1/3", ""].includes(await pageStatus(page)))

    // Sort WR giảm dần trên toàn tập.
    await selectOption(page, "#meta-sort", "Tỉ lệ thắng")
    rows = await metaRowsInfo(page)
    const maxWr = Math.max(...rows.map((r) => r.wr))
    const ariaSort = await page.locator("th[aria-sort]").innerText()
    let p2first = null
    if (!(await page.getByRole("button", { name: "Trang sau" }).isDisabled().catch(() => true))) {
        await page.getByRole("button", { name: "Trang sau" }).click()
        p2first = (await metaRowsInfo(page))[0].wr
        await page.getByRole("button", { name: "Trang trước" }).click()
    }
    rec("meta-desktop", "Sắp xếp WR giảm dần trước phân trang", "dòng 1 = WR cao nhất; dòng đầu trang 2 ≤ cuối trang 1; header aria-sort", `top=${rows[0].wr}, max=${maxWr}, p1last=${rows[rows.length - 1].wr}, p2first=${p2first}, aria-sort on '${ariaSort.trim()}'`, rows[0].wr === maxWr && (p2first === null || p2first <= rows[rows.length - 1].wr) && ariaSort.includes("Tỉ lệ thắng"))
    await page.getByRole("button", { name: /Đổi chiều sắp xếp/ }).click()
    rows = await metaRowsInfo(page)
    rec("meta-desktop", "Đảo chiều sắp xếp", "dòng 1 = WR thấp nhất", `top=${rows[0].wr}, min=${Math.min(...rows.map((r) => r.wr))}`, rows[0].wr === Math.min(...rows.map((r) => r.wr)))
    await shot(page, "meta-desktop-sorted.png")

    // Tìm + empty + reset.
    await selectOption(page, "#meta-lane", "Tất cả")
    await page.locator("#meta-search").fill("Y'bneth")
    rec("meta-desktop", "Tìm tướng", "1 dòng Y'bneth", `${await header()}`, (await header()).startsWith("1 dòng"))
    await page.locator("#meta-search").fill("zzzz")
    const empty = await page.getByText("Không có tướng nào khớp bộ lọc.").isVisible()
    rec("meta-desktop", "Tìm không có kết quả", "thông báo rỗng, không có phân trang", `empty=${empty}, nav=${await page.locator("nav[aria-label='Phân trang bảng tướng']").count()}`, empty && (await page.locator("nav[aria-label='Phân trang bảng tướng']").count()) === 0)
    await page.locator("#meta-search").fill("an")
    const anHeader = await header()

    // Tabs + bàn phím.
    await page.getByRole("tab", { name: "Combo đồng đội" }).click()
    const synergyVisible = await page.getByRole("tabpanel").locator("[data-slot=card-title]", { hasText: "Combo đồng đội" }).isVisible()
    await page.keyboard.press("ArrowRight")
    await page.waitForTimeout(200)
    const matchupSelected = await page.getByRole("tab", { name: "Kèo đối đầu" }).getAttribute("aria-selected")
    await page.keyboard.press("ArrowRight")
    await page.waitForTimeout(200)
    const duoSelected = await page.getByRole("tab", { name: "Duo theo cặp lane" }).getAttribute("aria-selected")
    rec("meta-desktop", "Tabs: click + phím mũi tên", "Combo hiển thị; → Kèo; → Duo", `combo=${synergyVisible}, matchup=${matchupSelected}, duo=${duoSelected}`, synergyVisible && matchupSelected === "true" && duoSelected === "true")
    const duoSelect = page.getByRole("combobox", { name: "Cặp lane" })
    await duoSelect.click()
    await page.getByRole("option", { name: "Giữa × Rồng" }).click()
    rec("meta-desktop", "Duo: đổi cặp lane (có nhãn)", "Giữa × Rồng", (await duoSelect.innerText()).trim(), (await duoSelect.innerText()).trim() === "Giữa × Rồng")
    await shot(page, "meta-desktop-duo.png")
    await page.getByRole("tab", { name: "Tướng" }).click()
    rec("meta-desktop", "Quay lại tab Tướng giữ truy vấn", `ô tìm = "an", ${anHeader}`, `${await page.locator("#meta-search").inputValue()}, ${await header()}`, (await page.locator("#meta-search").inputValue()) === "an" && (await header()) === anHeader)
    await page.locator("#meta-search").fill("")

    // Compare A/B.
    const cmp = page.getByRole("button", { name: "So sánh", exact: true })
    await cmp.click()
    const pressed = await cmp.getAttribute("aria-pressed")
    const tabsGone = (await page.getByRole("tablist").count()) === 0
    const pickTournament = async (labelText, index) => {
        const trigger = page.locator("div.space-y-1\\.5", { has: page.getByText(labelText, { exact: true }) }).getByRole("button").first()
        await trigger.click()
        const opts = page.locator("[data-slot=popover-content] button.pl-6")
        const name = (await opts.nth(index).innerText()).trim()
        await opts.nth(index).click()
        await page.keyboard.press("Escape")
        return name
    }
    const ta = await pickTournament("Giải A", 0)
    const tb = await pickTournament("Giải B", 1)
    await page.waitForTimeout(500)
    const deltas = await page.locator("tbody tr td:last-child").evaluateAll((tds) => tds.map((t) => t.innerText.trim()).filter((x) => /[+-]?\d/.test(x)).length)
    rec("meta-desktop", "So sánh A/B độc lập", "aria-pressed=true, ẩn tabs, có cột Chênh với số", `pressed=${pressed}, tabsGone=${tabsGone}, A=${ta}, B=${tb}, deltaRows=${deltas}`, pressed === "true" && tabsGone && deltas > 0)
    await shot(page, "meta-desktop-compare.png")
    await cmp.click()
    rec("meta-desktop", "Tắt so sánh trả lại tab trước", "tab Tướng đang chọn", await page.getByRole("tab", { name: "Tướng" }).getAttribute("aria-selected"), (await page.getByRole("tab", { name: "Tướng" }).getAttribute("aria-selected")) === "true")

    // Mở trang tướng.
    const link = page.locator("tbody tr a").first()
    const heroName = (await link.innerText()).trim()
    await link.click()
    await page.waitForURL(/\/vi\/heroes\//)
    await page.waitForLoadState("networkidle")
    const h1 = (await page.locator("h1").first().innerText()).trim()
    rec("meta-desktop", "Mở trang tướng", `URL /vi/heroes/…, h1 chứa ${heroName}`, `${page.url().replace(base, "")}, h1=${h1}`, h1.includes(heroName))
    await ctx.close()
}

const metaMobile = async (browser) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light", hasTouch: true, isMobile: true })
    await ctx.addInitScript(() => localStorage.setItem("aov-theme", "light"))
    const page = await ctx.newPage()
    watch(page, "meta-mobile")
    await page.goto(`${base}/en/meta`, { waitUntil: "networkidle" })
    await page.locator("#meta-lane").waitFor()
    const cards = () => page.locator("div.lg\\:hidden > div").evaluateAll((els) => els.map((e) => ({ lane: e.querySelector("span.text-xs")?.textContent?.trim(), wr: parseFloat(e.querySelectorAll("span.font-semibold")[0]?.textContent) })))
    rec("meta-mobile", "Controls lọc/sort hiện trên mobile (en)", "#meta-lane, #meta-sort visible; 25 card", `${await page.locator("#meta-lane").isVisible()}, ${await page.locator("#meta-sort").isVisible()}, cards=${(await cards()).length}`, (await page.locator("#meta-lane").isVisible()) && (await page.locator("#meta-sort").isVisible()) && (await cards()).length === 25)
    const tab = await page.getByRole("tab", { name: "Teammate Combos" }).boundingBox()
    rec("meta-mobile", "Tab phân tích trong viewport đầu", "tab Combos bottom ≤ 844", Math.round(tab.y + tab.height), tab.y + tab.height <= 844)
    await page.locator("#meta-lane").tap()
    await page.getByRole("option", { name: "Jungle" }).tap()
    let c = await cards()
    rec("meta-mobile", "Lọc vị trí trên mobile", "mọi card lane Jungle", [...new Set(c.map((x) => x.lane))].join(","), c.length > 0 && c.every((x) => x.lane === "Jungle"))
    await page.locator("#meta-sort").tap()
    await page.getByRole("option", { name: "Win Rate" }).tap()
    c = await cards()
    rec("meta-mobile", "Sort WR trên mobile", "card đầu = WR cao nhất trang", `${c[0].wr} vs max ${Math.max(...c.map((x) => x.wr))}`, c[0].wr === Math.max(...c.map((x) => x.wr)))
    const next = page.getByRole("button", { name: "Next page" })
    if (await next.count()) {
        await next.tap()
        rec("meta-mobile", "Trang kế trên mobile", "Page 2 of N", (await page.locator("span[aria-live]").last().innerText()).trim(), (await page.locator("span[aria-live]").last().innerText()).startsWith("Page 2"))
    }
    rec("meta-mobile", "Không tràn ngang 390", "false", await hOverflow(page), !(await hOverflow(page)))
    await shot(page, "meta-mobile-en-light-jungle-wr.png")
    await ctx.close()
}

const navbar = async (browser) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" })
    const page = await ctx.newPage()
    watch(page, "navbar")
    await page.goto(`${base}/vi/draft`, { waitUntil: "networkidle" })
    const menu = page.getByRole("button", { name: "Mở menu" })
    rec("navbar", "Nút menu có tên + aria-expanded", "Mở menu, false", `${await menu.count()}, ${await menu.getAttribute("aria-expanded")}`, (await menu.count()) === 1 && (await menu.getAttribute("aria-expanded")) === "false")
    await menu.click()
    const close = page.getByRole("button", { name: "Đóng menu" })
    const navVisible = await page.locator("#mobile-nav").isVisible()
    await page.locator("#mobile-nav a").first().focus()
    await page.keyboard.press("Escape")
    const afterEsc = await page.evaluate(() => ({ nav: !!document.getElementById("mobile-nav"), focus: document.activeElement?.getAttribute("aria-label") }))
    rec("navbar", "Menu: mở → Escape đóng → focus về nút", "nav ẩn, focus 'Mở menu'", `opened=${navVisible}, expanded=${await close.count()}, navAfter=${afterEsc.nav}, focus=${afterEsc.focus}`, navVisible && !afterEsc.nav && afterEsc.focus === "Mở menu")
    const theme = page.getByRole("button", { name: "Chuyển sang giao diện sáng" })
    rec("navbar", "Nút theme có tên i18n", "Chuyển sang giao diện sáng", await theme.count(), (await theme.count()) === 1)
    await theme.click()
    const isLight = await page.evaluate(() => !document.documentElement.classList.contains("dark"))
    rec("navbar", "Đổi theme", "html bỏ class dark, nút đổi tên", `${isLight}, ${await page.getByRole("button", { name: "Chuyển sang giao diện tối" }).count()}`, isLight && (await page.getByRole("button", { name: "Chuyển sang giao diện tối" }).count()) === 1)
    const lang = page.getByRole("button", { name: "Ngôn ngữ: Tiếng Việt" })
    rec("navbar", "Nút ngôn ngữ có tên", "Ngôn ngữ: Tiếng Việt", await lang.count(), (await lang.count()) === 1)
    // Có một lượt cấm để kiểm query ?d= được giữ khi đổi ngôn ngữ.
    await waitSuggestions(page)
    await suggestionButtons(page).first().click()
    const banVi = (await slotLabels(page))[0].replace("CẤM: ", "")
    await lang.click()
    await page.getByRole("menuitem", { name: /English/ }).click()
    await page.waitForURL(/\/en\/draft/)
    await page.waitForLoadState("networkidle")
    // Tên tướng chỉ hiện khi dữ liệu tướng đã tải (trước đó ô hiện "—").
    await page.waitForFunction(() => {
        const l = document.querySelector("button[aria-label^='BAN:']")?.getAttribute("aria-label")
        return l && l !== "BAN: —"
    }, null, { timeout: 20000 }).catch(() => {})
    const enBtn = await page.getByRole("button", { name: "Language: English" }).count()
    const banEn = await page.locator("button[aria-label^='BAN:']").first().getAttribute("aria-label")
    rec("navbar", "Đổi sang tiếng Anh giữ route + draft", `/en/draft?d=…, ô cấm vẫn là ${banVi}`, `${page.url().replace(base, "")}, ${enBtn}, ${banEn}`, /\/en\/draft\?d=/.test(page.url()) && enBtn === 1 && banEn === `BAN: ${banVi}`)
    await page.getByRole("button", { name: "Language: English" }).click()
    await page.getByRole("menuitem", { name: /Tiếng Việt/ }).click()
    await page.waitForURL(/\/vi\/draft/)
    rec("navbar", "Đổi lại tiếng Việt", "/vi/draft?d=…", page.url().replace(base, ""), /\/vi\/draft\?d=/.test(page.url()))
    const brand = await page.locator("header a[href]").first().innerText()
    rec("navbar", "Tên sản phẩm hiện trên 390px", "AOV DraftMind", brand.trim(), brand.trim() === "AOV DraftMind")
    await ctx.close()
}

const smoke = async (browser) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" })
    const page = await ctx.newPage()
    watch(page, "smoke")
    await page.goto(`${base}/vi/matches`, { waitUntil: "networkidle" })
    await page.waitForTimeout(1500)
    const teamHref = await page.locator("a[href*='/teams/']").first().getAttribute("href").catch(() => null)
    const heroHref = await page.locator("a[href*='/heroes/']").first().getAttribute("href").catch(() => null)
    const routes = ["/vi/matches", "/vi/draft-input", "/en/draft", "/en/meta", heroHref || "/vi/heroes/florentino", teamHref].filter(Boolean)
    for (const r of routes) {
        const resp = await page.goto(`${base}${r}`, { waitUntil: "networkidle" })
        await page.waitForTimeout(1000)
        const ok = resp.status() === 200
        const ov = await hOverflow(page)
        rec("smoke", `Route ${r}`, "200, không tràn ngang 390", `${resp.status()}, overflow=${ov}`, ok && !ov)
    }
    if (!teamHref) rec("smoke", "Route trang đội", "tìm link đội trên /vi/matches", "không tìm thấy link", null)
    // draft-input dùng chung HeroPicker — mở picker (sheet mobile), chọn tướng, mở lại + Escape trả focus.
    await page.goto(`${base}/vi/draft-input`, { waitUntil: "networkidle" })
    const slot = page.locator("button.flex-1.rounded-md.border").first()
    await slot.click()
    const sheet = page.getByRole("dialog")
    await sheet.waitFor()
    const inputFocused = await page.evaluate(() => document.activeElement?.tagName === "INPUT")
    const pick = sheet.locator("button:not([disabled]):has(img)").first()
    const pickName = (await pick.innerText()).trim()
    await pick.click()
    await sheet.waitFor({ state: "hidden" })
    const slotText = (await slot.innerText()).trim()
    await slot.click()
    await sheet.waitFor()
    await page.keyboard.press("Escape")
    await sheet.waitFor({ state: "hidden" })
    await page.waitForTimeout(300)
    const back = await page.evaluate(() => document.activeElement?.textContent?.trim())
    rec("smoke", "draft-input: HeroPicker dùng chung", `mở → input focus; chọn ${pickName} vào ô; Escape → focus về ô`, `inputFocused=${inputFocused}, slot=${slotText}, focus=${back}`, inputFocused && slotText.includes(pickName) && back?.includes(pickName))
    await ctx.close()
}

;(async () => {
    const browser = await chromium.launch({
        executablePath: path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1234/chrome-win64/chrome.exe"),
    })
    for (const [name, fn] of [["draftDesktop", draftDesktop], ["draftMobile", draftMobile], ["metaDesktop", metaDesktop], ["metaMobile", metaMobile], ["navbar", navbar], ["smoke", smoke]]) {
        try {
            await fn(browser)
        } catch (e) {
            rec(name, "Không ném lỗi", "flow chạy hết", String(e).split("\n")[0], false)
        }
    }
    await browser.close()
    rec("runtime", "Mobile WebKit", "chạy flow trên WebKit", "WebKit chưa cài trong ms-playwright (chỉ có chromium-1234)", null)
    const summary = steps.reduce((a, s) => ({ ...a, [s.result]: (a[s.result] || 0) + 1 }), {})
    fs.writeFileSync(path.join(outDir, "e2e.json"), JSON.stringify({ base, ranAt: new Date().toISOString(), summary, consoleErrors, steps }, null, 2))
    console.log("SUMMARY", JSON.stringify(summary), "consoleErrors", consoleErrors.length)
    for (const e of consoleErrors.slice(0, 10)) console.log("CONSOLE", e.label, e.text)
})()
