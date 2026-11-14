# Done — AOV DraftMind

Khán giả/mục đích: **public cho cộng đồng Liên Quân Mobile** — bản đầu đủ tin cậy để đăng site/repo ra ngoài mà không xấu hổ.

Version đang mở: **— (v1.2 đã đóng, đang ở trạng thái bảo trì)**

## Checklist v1.2 — ✅ ĐÃ ĐÓNG 2026-11-15

- [x] `merge.mjs` tính lại winner (hoà → winner của export) + cập nhật format (không hạ dưới ván lớn nhất) khi gộp vào series đã có — `scripts/__tests__/merge.test.mjs`.
- [x] Importer: `bestof` kế thừa từ `|bestof=` gần nhất trên trang; đếm thắng cả ván LP lỗi draft; nhịp `action=parse` 30s; cờ `--offline` đọc cache. `validate:data` chặn ván > BO và winner lệch số ván thắng.
- [x] Cào lại toàn bộ 7 giải — 2026-10-28 LP chặn IP (do nhịp 4s cũ), 5/7 giải sửa từ cache (225 format + 1 winner); 2026-11-15 LP mở lại, cào nốt ở nhịp 30s: AOG Leg 1 + APL (47 format), playoffs AOG (đủ 8/8) + chung kết GCS 31/10, APL 18/07 BT–FPT ván 7 `is_blind_pick` (merge `--force` riêng series đó). `validate:data` xanh: 415 series / 1641 ván, 0 ván > BO.
- [x] "Đồng đội hay thắng cùng" chỉ hiện cặp thắng nhiều hơn thua (test 0/5, 3/6 loại, 4/5 giữ) — Evita giờ hiện "Chưa đủ dữ liệu cặp".
- [x] Xem `/draft` (gợi ý nguồn 1623 ván), `/matches` (412 series, BO3-quá-ván 177 → 29), `/heroes/evita` trên dev server.
- [x] Tài liệu: README bỏ `lp-relay.mjs`, TASKS.md tick đúng, Someday bỏ mục đã làm.

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

- Chuẩn bị vs đội X (draft sim lọc theo đối thủ) + team Elo vào scoreDraft (opt-in khi chọn đội).
- Hero archetype tags (damage_type/role/range) → comp balance trong scoreDraft.
- Bracket/upcoming matches từ Liquipedia; bổ sung VOD cho AOG/APL.
- Bảng "Combo đồng đội" ở `/meta` (`MetaView.tsx` ~165) không lọc cặp thua nhiều hơn thắng (bảng kèo ngay dưới có lọc).
- "Combo hay dùng" ở trang đội (`teamStats.ts` ~171) sort theo số ván thắng chứ không theo số lần dùng.
- Empty state "Chưa đủ dữ liệu cặp" cũng hiện khi có đủ mẫu nhưng mọi cặp đều thua — câu chữ chưa sát.

## Lịch sử version

| Version | Đích | Đóng lúc | Evidence |
|---|---|---|---|
| v1.0 | Public cho cộng đồng LQM — site live đủ tin cậy để đăng | 2026-10-02 | commit `f16d8a0` · 10/10 checklist verify trên production: `/about` 200, 10 og tags, 87/87 test, 7 giải/334 series/1295 ván |
| v1.1 | Độ tin cậy thuật toán/repo | 2026-10-02 | commit `4deabfd` · 4/4: duoLaneKey gắn hero↔lane (UI badge lane), formatSec không ra :60 (test), Redux console sạch, AGENTS.md cập nhật |
| v1.2 | Pipeline data đáng tin | 2026-11-15 | commit `89fb38e` + data · 6/6: merge tính lại winner/format (test), importer đọc bestof + nhịp LP 30s, 7 giải cào lại đủ (0 ván > BO, validate xanh), teammates lọc cặp thua, UI verify, docs |
