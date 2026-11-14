/* eslint-disable @typescript-eslint/no-require-imports -- script Node CommonJS dùng Playwright cài global, không thuộc app */
// Usage: node capture.cjs <outDir> [baseUrl]
// Chụp viewport (không full-page) + đo layout cho draft/meta ở desktop/tablet/mobile, dark/light, vi/en.
const path = require("path")
const fs = require("fs")
const { chromium } = require(path.join(process.env.APPDATA, "npm/node_modules/playwright"))

const outDir = process.argv[2]
const base = process.argv[3] || "http://localhost:3000"
fs.mkdirSync(outDir, { recursive: true })

const VIEWPORTS = { desktop: [1440, 900], tablet: [768, 1024], mobile: [390, 844] }
const SUGGEST_TITLE = { vi: "Gợi ý cấm/chọn", en: "Draft Suggestions" }
const COMBO_TITLE = { vi: "Combo đồng đội", en: "Teammate Combos" }

const measure = async (page, route, locale) =>
    page.evaluate(({ route, sTitle, cTitle }) => {
        const de = document.documentElement
        const r = {
            pageHeight: de.scrollHeight,
            hOverflow: de.scrollWidth > de.clientWidth,
            scrollWidth: de.scrollWidth,
            clientWidth: de.clientWidth,
        }
        const byText = (txt) =>
            [...document.querySelectorAll("h1,h2,h3,h4,div,span,button,p")].find(
                (el) => el.childElementCount <= 1 && el.textContent.trim() === txt,
            )
        if (route === "draft") {
            const title = byText(sTitle)
            const card = title?.closest("[data-slot=card]")
            const btns = card ? [...card.querySelectorAll("button")].filter((b) => b.querySelector("img")) : []
            r.suggestionCount = btns.length
            r.firstSuggestionTop = btns[0] ? Math.round(btns[0].getBoundingClientRect().top + scrollY) : null
            r.suggestionsInFirstViewport = btns.filter((b) => b.getBoundingClientRect().bottom <= innerHeight).length
            const turn = document.querySelector("[data-turn-banner]")
            r.turnBannerBottom = turn ? Math.round(turn.getBoundingClientRect().bottom) : null
        }
        if (route === "meta") {
            r.renderedRows = [...document.querySelectorAll("tbody tr")].filter((tr) => tr.offsetParent).length
            const combo = byText(cTitle)
            r.comboTop = combo && combo.offsetParent ? Math.round(combo.getBoundingClientRect().top + scrollY) : null
        }
        // Nút/combobox hiển thị không có tên truy cập.
        const visible = (el) => el.offsetParent !== null
        const name = (el) =>
            (el.getAttribute("aria-label") ||
                (el.getAttribute("aria-labelledby") &&
                    el.getAttribute("aria-labelledby").split(" ").map((id) => document.getElementById(id)?.textContent).join(" ")) ||
                (el.id && document.querySelector(`label[for="${el.id}"]`)?.textContent) ||
                el.textContent ||
                el.getAttribute("title") ||
                "").trim()
        r.unnamedButtons = [...document.querySelectorAll("button,a[href]")].filter(visible).filter((b) => !name(b) && !b.querySelector("img[alt]:not([alt=''])")).map((b) => b.outerHTML.slice(0, 120))
        r.comboboxesWithoutLabel = [...document.querySelectorAll("[role=combobox]")].filter(visible).filter((c) => !c.getAttribute("aria-label") && !c.getAttribute("aria-labelledby") && !(c.id && document.querySelector(`label[for="${c.id}"]`))).map((c) => c.textContent.trim())
        return r
    }, { route, sTitle: SUGGEST_TITLE[locale], cTitle: COMBO_TITLE[locale] })

;(async () => {
    const browser = await chromium.launch({
        executablePath: path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1234/chrome-win64/chrome.exe"),
    })
    const results = []
    const combos = [
        ["vi", "dark"], ["vi", "light"], ["en", "dark"], ["en", "light"],
    ]
    for (const [locale, theme] of combos) {
        for (const [vpName, [w, h]] of Object.entries(VIEWPORTS)) {
            // Chỉ chụp tablet ở vi-dark (dùng cho kiểm tràn ngang).
            if (vpName === "tablet" && !(locale === "vi" && theme === "dark")) continue
            const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme })
            await ctx.addInitScript((t) => localStorage.setItem("aov-theme", t), theme)
            const page = await ctx.newPage()
            for (const route of ["draft", "meta"]) {
                await page.goto(`${base}/${locale}/${route}`, { waitUntil: "networkidle" })
                await page.waitForTimeout(1500)
                const file = `${route}-${vpName}-${locale}-${theme}.png`
                await page.screenshot({ path: path.join(outDir, file) })
                const m = await measure(page, route, locale)
                results.push({ route, locale, theme, viewport: vpName, w, h, file, ...m })
            }
            await ctx.close()
        }
    }
    // Nội dung dài: draft đủ 18 ô với tên tướng + lane dài nhất (en "Abyssal Dragon"/"Dark Slayer").
    const LONG = "0:flowborn-ad,1:bolt-baron,2:sinestrea,3:the-flash,4:wonder-woman:rong_xa,5:flowborn-mid:ta_than,6:wiro-sableng:rong_xa,7:dieu-thuyen:ta_than,8:florentino:rong_xa,9:charlotte:rong_xa,10:butterfly,11:flowborn,12:superman,13:aleister,14:eland-orr:ta_than,15:tel-annas:rong_xa,16:ngo-khong:ta_than,17:trieu-van:rong_xa"
    if (process.argv[4] !== "--no-long") {
        for (const [locale, theme, vp] of [["en", "dark", "mobile"], ["vi", "light", "mobile"], ["en", "light", "desktop"]]) {
            const [w, h] = VIEWPORTS[vp]
            const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme })
            await ctx.addInitScript((t) => localStorage.setItem("aov-theme", t), theme)
            const page = await ctx.newPage()
            await page.goto(`${base}/${locale}/draft?d=${encodeURIComponent(LONG)}`, { waitUntil: "networkidle" })
            await page.waitForTimeout(2000)
            const file = `draft-long-${vp}-${locale}-${theme}.png`
            await page.screenshot({ path: path.join(outDir, file), fullPage: vp === "mobile" })
            const m = await measure(page, "draft", locale)
            results.push({ route: "draft-long", locale, theme, viewport: vp, w, h, file, ...m })
            await ctx.close()
        }
    }
    await browser.close()
    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(results, null, 2))
    for (const r of results) {
        const { unnamedButtons, comboboxesWithoutLabel, ...rest } = r
        console.log(JSON.stringify({ ...rest, unnamed: unnamedButtons.length, unlabeledCombos: comboboxesWithoutLabel }))
    }
})().catch((e) => {
    console.error(e)
    process.exit(1)
})
