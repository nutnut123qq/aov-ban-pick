# Done — AOV DraftMind

Khán giả/mục đích: **public cho cộng đồng Liên Quân Mobile** — bản đầu đủ tin cậy để đăng site/repo ra ngoài mà không xấu hổ.

Version đang mở: **— (v1.1 đã đóng, đang ở trạng thái bảo trì)**

## Checklist v1.1 — ✅ ĐÃ ĐÓNG 2026-10-02

- [x] `duoLaneKey` giữ đúng hero↔lane — key mới `${laneA}:${heroA}|${laneB}:${heroB}` canonical ("rung:mina|giua:zata" ≠ "rung:zata|giua:mina"); duo UI hiện badge lane dưới từng tướng, test cập nhật + case đảo chiều.
- [x] `formatSec` không bao giờ hiện `:60` — tách ra `src/modules/aov/format.ts`, làm tròn tổng giây trước khi tách phút; `format.test.ts` cover 719.6→12′00″, 59.9→1′00″, NaN/âm→0.
- [x] Console error Redux — `store.ts` `reducer: {}` → reducer no-op hợp lệ (chưa có slice nào); verify console sạch khi load `/vi/meta` trên dev server.
- [x] `AGENTS.md` cập nhật — thêm `npm test`/`tsc --noEmit`/`validate:data` vào lệnh, Testing section phản ánh vitest (13 file/90 test), thêm route mới vào structure, deploy section → Vercel (bỏ VPS workflow đã xoá).

## Checklist v1.0 — ✅ ĐÃ ĐÓNG 2026-10-02

- [x] Site live trên Vercel, trả data thật: 334 series / 1295 ván / 133 tướng / 7 giải — `npm run validate:data` xanh, `https://aov-ban-pick.vercel.app/vi` render.
- [x] `/meta`: stats theo lane + WR Xanh/Đỏ + thời lượng + phase pick + duo theo cặp lane + so sánh 2 giải — verify production (duration/phase/duo/compare đều render).
- [x] `/draft`: engine ban/pick, gợi ý, chấm điểm comp + kèo theo lane, share `?d=` + history localStorage — verify production (URL restore đúng, "Đỏ nghiêng 62%", copy link + lịch sử sống).
- [x] `/heroes/[slug]` + `/teams/[id]` + `/matches` (filter tướng, link đội) — verify live (Sinestrea 231p/61.5%, SGP 12-3, 506 link tướng ở meta).
- [x] i18n vi/en đủ 215/215 keys, không thiếu phía nào.
- [x] Gates: lint 0 error/0 warning · vitest 87/87 · `npm run build` xanh.
- [x] **README viết lại** — song ngữ (Việt chính + English tóm tắt), 4 screenshot chụp từ production (`docs/screenshots/`), nguồn Liquipedia + coverage + link site + hướng dẫn dev/import.
- [x] **SEO/OG + sửa typo** — typo `"thờigian"` đã sửa; `openGraph` + `twitter` đầy đủ (title/description/url/site_name/locale/og:image 1200×630 `public/og.png`); verify qua SSR HTML: đủ `og:*`/`twitter:*` tags.
- [x] **Trang "về dữ liệu"** — `/about`: nguồn Liquipedia, coverage sống (7 giải / 334 series / 1295 ván / 133 tướng, render từ `useAovData`), 4 giới hạn (pro-meta, `pick_index` xấp xỉ, ngưỡng mẫu, không có player stats); link "Về dữ liệu" trong navbar desktop + mobile; verify render trên prod build.
- [x] **Dọn workflow chết** — đã xoá `.github/workflows/deploy.yml` + cancel run queued `37038297798`; Actions không còn treo.

## Someday (chưa vào version nào)

- Cập nhật `AGENTS.md`: mục Testing vẫn ghi "không có test runner" (thực tế vitest 12 file/87 test); xoá phần deploy VPS.
- Browser console error `Store does not have a valid reducer` — Redux store setup cũ.
- `formatSec` edge: giây làm tròn có thể hiển thị `60`.
- `duoLaneKey` sort hero độc lập lane — nếu sau này cần "hero A ở lane A với hero B ở lane B" thì đổi key.
- Chuẩn bị vs đội X (draft sim lọc theo đối thủ) + team Elo vào scoreDraft (opt-in khi chọn đội).
- Hero archetype tags (damage_type/role/range) → comp balance trong scoreDraft.
- Bracket/upcoming matches từ Liquipedia; bổ sung VOD cho AOG/APL.

## Lịch sử version

| Version | Đích | Đóng lúc | Evidence |
|---|---|---|---|
| v1.0 | Public cho cộng đồng LQM — site live đủ tin cậy để đăng | 2026-10-02 | commit `f16d8a0` · 10/10 checklist verify trên production: `/about` 200, 10 og tags, 87/87 test, 7 giải/334 series/1295 ván |
| v1.1 | Độ tin cậy thuật toán/repo | 2026-10-02 | commit `4deabfd` · 4/4: duoLaneKey gắn hero↔lane (UI badge lane), formatSec không ra :60 (test), Redux console sạch, AGENTS.md cập nhật |
