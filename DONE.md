# Done — AOV DraftMind

Khán giả/mục đích: **public cho cộng đồng Liên Quân Mobile** — bản đầu đủ tin cậy để đăng site/repo ra ngoài mà không xấu hổ.

Version đang mở: **v1.0** — pro-meta analytics + draft sim dùng được, site live.

## Checklist v1.0

- [x] Site live trên Vercel, trả data thật: 334 series / 1295 ván / 133 tướng / 7 giải — `npm run validate:data` xanh, `https://aov-ban-pick.vercel.app/vi` render.
- [x] `/meta`: stats theo lane + WR Xanh/Đỏ + thời lượng + phase pick + duo theo cặp lane + so sánh 2 giải — verify production (duration/phase/duo/compare đều render).
- [x] `/draft`: engine ban/pick, gợi ý, chấm điểm comp + kèo theo lane, share `?d=` + history localStorage — verify production (URL restore đúng, "Đỏ nghiêng 62%", copy link + lịch sử sống).
- [x] `/heroes/[slug]` + `/teams/[id]` + `/matches` (filter tướng, link đội) — verify live (Sinestrea 231p/61.5%, SGP 12-3, 506 link tướng ở meta).
- [x] i18n vi/en đủ 215/215 keys, không thiếu phía nào.
- [x] Gates: lint 0 error/0 warning · vitest 87/87 · `npm run build` xanh.
- [ ] **README viết lại** — hiện là boilerplate `create-next-app`: phải nói được tool là gì, screenshot/danh sách tính năng, nguồn data Liquipedia, link production, cách dev/import data.
- [ ] **SEO/OG + sửa typo** — `app/layout.tsx` description đang viết sai `"thờigian"`; thêm `openGraph`/`twitter` (title, description, og:image) để share link lên FB/Discord có preview; kiểm bằng cách view-source trang production thấy đủ `og:` tags.
- [ ] **Trang/section "về dữ liệu"** — nói rõ: nguồn Liquipedia, coverage thật (7 giải / 334 series / 1295 ván), giới hạn (đây là pro-meta không phải meta ranked, `pick_index`/`is_counter_pick` là xấp xỉ, ngưỡng mẫu tối thiểu); link từ navbar/footer, verify render trên site.
- [ ] **Dọn workflow chết** — xoá hoặc disable `.github/workflows/deploy.yml` (self-hosted `tedo-vps` queued vô hạn); verify trên GitHub tab Actions không còn run queued.

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
