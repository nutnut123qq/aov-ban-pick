# Kế hoạch cải thiện UI AOV DraftMind cho Claude

Ngày khảo sát: 14/11/2026, Asia/Saigon. Trạng thái: **đã nghiệm thu local (14–15/11/2026); user cho phép chốt và phát hành đợt này ngày 15/11/2026** — kết quả commit/push/deploy/production ở mục "Chốt và phát hành" cuối file.

## Bối cảnh và snapshot

- Repo đúng: `D:/code/lienquan/aov-draftmind-frontend`; branch `main`; HEAD `f0cfff8c95d9aec71c31e3973cae16a234a2fd32`. `D:/code/lienquan` chỉ là thư mục cha.
- Working tree ban đầu sạch. Lượt này chỉ thêm tài liệu/bằng chứng trong thư mục này; không sửa source, không chạy Claude, không commit/push/deploy.
- Đã đọc `AGENTS.md`, `CLAUDE.md`, tài liệu product/styling, phần hiện hành `DONE.md`, `TASKS.md` và source các màn liên quan.
- `DONE.md` đang mở v1.2 về pipeline dữ liệu, còn hạng mục chờ Liquipedia. Đây là đề xuất UI riêng; không tự resume, đổi checklist hay đóng version đó.
- App chạy local từ checkout này bằng Next.js 16.2.1 trên `127.0.0.1:3127`. Đã xem `/vi`, `/vi/draft`, `/vi/meta`; chụp desktop 1440×900 và mobile 390×844 CSS px. Server khảo sát đã dừng; không có worker còn chạy.
- User đã chọn: **ưu tiên màn cấm/chọn và thống kê, giữ nhận diện hiện tại**. Chưa có reference ngoài; không mở hướng branding mới. Giữ sản phẩm công cụ phân tích, nền trung tính, dark/light và màu đội Xanh/Đỏ. Lựa chọn phạm vi không có nghĩa user đã duyệt một bản visual chưa được dựng.

## Đích của đợt UI

Người dùng biết lượt draft hiện tại và có gợi ý gần thao tác; người xem Meta lọc/sắp xếp được trên điện thoại và tìm thấy phân tích cặp tướng mà không cuộn qua hàng trăm kết quả. Trang chủ/dashboard và đổi lớn điều hướng không thuộc đợt này.

Giữ nguyên FE-only, JSON tĩnh, luật draft, thuật toán/thống kê, browser-side state, URL chia sẻ, lịch sử, vi/en, dark/light và các route hiện có. Không đổi font/branding toàn site, không thêm backend, dependency, tính năng thống kê hay dữ liệu giả.

## Phát hiện có bằng chứng

| Ưu tiên | Quan sát | Hướng xử lý |
|---|---|---|
| P1 | Draft mobile xếp toàn bộ Đội Xanh, rồi gợi ý, rồi Đội Đỏ. Gợi ý đầu tiên ở khoảng y=1344 CSS px, ngoài viewport 390×844; toàn trang khoảng 2722 px. | Đưa lượt hiện tại, thao tác chọn tướng và gợi ý liên quan lên trước danh sách đầy đủ. Desktop vẫn giữ khả năng nhìn hai đội đồng thời. |
| P1 | `MetaView.tsx` chỉ có `setLane` trong table header thuộc `hidden lg:block`; sort cũng nằm ở header đó. Mobile chuyển sang cards nên mất các controls này. | Toolbar dùng được trên cả mobile/desktop, tái dùng state/filter/sort hiện tại. |
| P1 | Desktop Meta render 206 dòng; phần Combo đồng đội/Kèo đối đầu bắt đầu khoảng y=10715; trang dài khoảng 11715 px. | Phân trang phần tướng và đưa các nhóm phân tích hiện có vào các view/tab có nhãn, truy cập từ đầu màn. |
| P2 | Draft lồng card, slot border và button border; toolbar mobile quấn thành nhiều dòng, chiếm chỗ của công việc chính. | Giảm lớp viền, nén vùng cấm, tách thao tác chính/phụ; vẫn giữ đủ 18 bước và trạng thái future/active/filled. |
| Để sau | Home gần như toàn khoảng trống, một CTA dẫn tới `/dashboard` rồi mới vào draft. Navbar vẫn dùng `GraduationCap` từ sản phẩm học tập cũ. | Ghi nhận để user quyết đợt sau; không redesign Home/dashboard hay thay branding trong scope draft/meta này. |
| P2 | AX mobile có nút language/menu không có tên rõ; nhãn thương hiệu bị ẩn trên màn nhỏ. | Bổ sung accessible names qua i18n, kiểm menu bằng bàn phím; giữ tên sản phẩm đọc được khi đủ chỗ. |

Bằng chứng: `evidence/baseline.json`, `home-desktop.jpg`, `draft-desktop.jpg`, `draft-mobile.jpg`, `meta-desktop.jpg`, `meta-mobile.jpg`, `meta-mobile-checks.json`. Screenshot raster có thể nhỏ hơn CSS viewport do cơ chế capture; dùng cùng CSS viewport và cách chụp cho ảnh sau.

Điểm cần giữ: ảnh tướng thật, phân biệt hai đội, highlight lượt đang thao tác, gợi ý có lý do/cỡ mẫu, Meta desktop là bảng và mobile đã có card, tìm kiếm tướng hoạt động (206 dòng xuống 1 với Y'bneth). Số liệu lúc khảo sát là 1623 ván; không hard-code số này vào UI.

## Skill và cách phối hợp

| Skill | Vai trò trong đợt này |
|---|---|
| `agentic-design-system` | Skill điều phối chính. Chốt task/surface và preserve-list, sửa cấu trúc rồi craft trong một vòng, nghiệm thu trên app thật. |
| `ux-baseline-check` | Contract responsive, current/future/selected/disabled, filter parity, keyboard/focus, loading/error/empty khi có thay đổi liên quan. |
| `ui-polish-pass` | Spacing, hierarchy, control height, border/surface, số liệu và typography; tái dùng shadcn/Radix đang có trên draft/meta. |
| `design-review` | Đối chiếu before/after, đọc được công việc chính, nhất quán giữa màn và phạm vi đã giao. |
| `e2e-verify` | Nghiệm thu flow draft và Meta đã thay đổi bằng browser; lưu ảnh và kết quả thật. |
| `ponytail` | Giữ thay đổi nhỏ nhưng đủ; không chuyển thành tái kiến trúc UI hay migration component library. |
| `modern-web-guidance` | Agent tự chọn khi có câu hỏi cụ thể về browser behavior, dialog/focus, responsive API hoặc compatibility mà repo chưa giải đáp. Không bắt buộc cho đổi class Tailwind và không thêm stage vào cycle. |

Không chạy mỗi skill thành một nghi thức hay vòng lặp riêng. Không cần `/cycle` hoặc `/orchestrate` cho plan này. `ui-benchmark`/`visual-reference-calibration` chỉ thêm khi user chọn reference thật; hiện chưa có reference để dùng chúng làm tiêu chuẩn fidelity. Không mặc định cần subagent.

## Thứ tự triển khai đề xuất

### 1. Draft là workspace chính

- Desktop: hai đội dễ so sánh, vùng hỗ trợ ở giữa; banner lượt hiện tại và tiến độ gắn đúng `activeStep`. Gộp vùng cấm cho gọn, pick có avatar/tên/lane rõ. Reorder phần trình bày phải giữ nhãn lượt theo `DRAFT_SEQUENCE`, không đổi thứ tự engine.
- Mobile: current-turn summary và hành động chọn tướng lên trước; có ít nhất một gợi ý trong viewport đầu. Bên dưới là overview hai đội và chi tiết roster. Có thể dùng tab/disclosure hiện có để giảm chiều dài, nhưng không giấu bên đang thao tác hoặc ngữ cảnh đối thủ.
- Giữ đủ controls cho các bước tương lai/đã đi qua, chọn lane, xoá, undo/reset, global ban từ ván 2, source tournament, score, share và lịch sử. Thao tác thường xuyên trên mobile có target 48px khi khả thi, không phụ thuộc hover.
- Không tạo engine riêng cho mobile hoặc nhân đôi state. Với HeroPicker dùng chung, chỉ chỉnh phần trình bày/accessibility cần thiết và kiểm lại draft-input nếu đụng component đó.

### 2. Meta có thứ bậc và parity

- Đưa lane và sort ra khỏi header chỉ có desktop; tournament/search/lane/sort có nhãn rõ, thao tác được ở 390px. Dùng lại state và hàm lọc/sort hiện có.
- Phần tướng: 25 kết quả/trang cho cả table và mobile cards; lọc/sort toàn bộ tập trước khi phân trang, giữ tổng kết quả, reset/clamp page hợp lý khi filter đổi. Không tính trên riêng 25 dòng và không làm mất kết quả còn lại.
- Các nhóm Tướng, Combo đồng đội, Kèo đối đầu, Duo theo lane truy cập được bằng view/tab có tên ở đầu màn. Giữ compare 2 giải và đầy đủ metric hiện có; số liệu phụ có thể ở chi tiết row/card thay vì chữ quá nhỏ.
- Phân biệt phạm vi bộ lọc: tournament hiện ảnh hưởng nhiều phân tích, search/lane/sort không mặc nhiên áp cho mọi cặp tướng. Chỉ hiện controls phù hợp từng view hoặc giải thích rõ. Giữ A/B độc lập trong compare, không âm thầm đổi ý nghĩa thống kê.
- Quay lại view trước giữ query/selection khi phù hợp; tabs và pagination điều khiển được bằng bàn phím.

### 3. Craft dùng chung và điều hướng cần thiết

- Dùng font, token và icon family hiện có. Nền trung tính, text/action rõ, xanh/đỏ dành cho ý nghĩa đội. Giảm card lồng card trong draft/meta, không thêm neon/gradient trang trí hay hệ icon mới.
- Navbar chỉ chỉnh accessible names, focus/tap targets cần thiết cho menu/language/theme trên hai màn chính; giữ tên sản phẩm, cấu trúc điều hướng và locale. Không thay logo hay sắp xếp lại toàn bộ IA trong đợt này.
- Không làm lại Home/dashboard hoặc đưa chúng thành tiêu chí bắt buộc. Các quan sát của chúng được giữ ở mục để sau.

### 4. Nghiệm thu một lần trên toàn phần đã đổi

- Chụp lại cùng viewport/state; xem ảnh thật, không dùng kết quả build hoặc source scanner làm bằng chứng visual.
- Đi các flow bên dưới, sửa lỗi nằm trong diff. Giới hạn trong một hướng thiết kế; không tự mở một đợt redesign mới khi gần xong.

## Ranh giới file

Chủ yếu: `src/components/layouts/Navbar/index.tsx` chỉ phần controls liên quan, `app/globals.css` nếu token thật sự cần sửa, `src/features/draft-sim/DraftSimView.tsx`, `SuggestionPanel.tsx`, `components/*`, `src/features/meta-stats/MetaView.tsx`, `CompareTable.tsx`, và `src/messages/{vi,en}.json`.

Có thể tách component trình bày nhỏ trong đúng feature. Shared primitive hoặc `TournamentMultiSelect`/HeroPicker chỉ sửa khi cần cho UI này, đọc caller và smoke-test consumer bị ảnh hưởng. Không migrate toàn bộ thư viện hoặc đổi toàn bộ `src/components/ui` cho tiện.

Không sửa `public/data/**`, scripts importer/merge, thuật toán trong `src/modules/aov`, draft engine/history/URL contract, luật `DRAFT_SEQUENCE`, provider/auth, dependency/lockfile hoặc deploy config. Nếu có blocker render thật ở ngoài boundary, ghi bằng chứng và giải thích trước khi mở phạm vi; không tiện tay sửa backlog.

## Tiêu chí xong

1. **Điều hướng dùng chung:** controls menu/language/theme trên draft/meta có accessible names và focus/tap target rõ; vi/en và các route cũ còn dùng được. Không thay Home/dashboard hay điều hướng toàn site.
2. **Draft:** ở 1440×900 thấy hai đội, lượt hiện tại và ít nhất 3 gợi ý khi có dữ liệu; ở 390×844 thấy lượt hiện tại, hành động chọn tướng và ít nhất 1 gợi ý mà chưa cuộn. Không mất trạng thái/chức năng hiện có.
3. **Meta:** lọc vị trí, tìm tướng và sort hoạt động trên mobile lẫn desktop; 25 kết quả/trang truy cập đủ toàn bộ kết quả. Combo/kèo/duo truy cập từ đầu màn, không phải cuộn qua toàn bộ bảng tướng.
4. **Responsive/a11y:** không tràn ngang toàn trang ở 390px và 768px; không cắt chữ/tên dài; focus nhìn thấy. Picker/menu/tab có keyboard flow, Escape và focus return đúng khi áp dụng. Đã xem dark/light và vi/en trên các vùng sửa; mobile WebKit nếu runtime hỗ trợ, thiếu thì ghi UNVERIFIED.
5. **Gates:** `npm run lint`, `npm test`, `npx tsc --noEmit`, `npm run build` pass cho nội dung cuối. UI-only state mới như pagination chỉ cần test hành vi có ý nghĩa: filter/sort trước paging, chuyển filter từ page cuối, empty/search-reset. Không thêm test mirror class CSS.
6. **Evidence:** bảng bước/kỳ vọng/thực tế/PASS-FAIL-UNVERIFIED; before/after cho draft, meta cùng viewport/state; ghi vấn đề còn lại và dừng khi các tiêu chí đạt. Không tự commit/push/deploy.

Flow tối thiểu: bắt đầu draft → ban/pick bằng picker và gợi ý → chọn lane → undo → reset → global ban ván 2 → hoàn thành draft hợp lệ → URL share/restore và history; Meta tìm/lọc lane/sort → page kế → đổi filter → đổi view phân tích → compare A/B → mở trang tướng. Nếu dữ liệu hoặc điều kiện không tạo được một trạng thái thì ghi thiếu, không bịa PASS.

Nếu đổi global tokens/nav, smoke-test thêm `/vi/matches`, `/vi/draft-input`, một trang tướng/đội và `/en/draft`; không redesign các màn đó.

## Baseline fail và giới hạn của khảo sát

Đã chạy `npm run validate:data`, exit 1:

```text
Series 's_arena_of_glory_winter_2026_2026_08_29_box_gamingvsgam_esports' có ván 4 nhưng format BO3.
```

Lỗi phù hợp trạng thái dữ liệu v1.2 đang dở trong `DONE.md`. Không sửa dataset/importer để làm đợt UI xanh. Nếu dataset không đổi, báo baseline fail còn nguyên và tách nó khỏi kết quả lint/test/build/UI; không gọi toàn dự án production-ready hoặc đóng v1.2.

Khảo sát này chưa chạy lint/unit/typecheck/build/full E2E; chưa kiểm light, tiếng Anh hay WebKit; chỉ thử search trên Meta và xem layout dark các route nêu trên. Plan không phải bằng chứng đã hoàn thành các tiêu chí UI.

## Bàn giao

Claude mở đúng repo, đọc `CLAUDE_PROMPT.md` trong thư mục này. Trước sửa, kiểm HEAD/status và owner/process thật; nếu source khác snapshot thì cập nhật baseline phần bị ảnh hưởng, không reset/stash việc của người khác. Trạng thái thi công/evidence tiếp theo ghi ngay trong plan này hoặc nguồn task do repo/user chỉ định, không tạo thêm một version/checklist song song và không sửa board v1.2 thay người đang làm dữ liệu.

## Kết quả thi công — 14/11/2026 (Claude Code)

**Nhận việc:** `main@f0cfff8`, working tree chỉ có thư mục plan này (untracked); cổng 3000/3127 trống, không có process nào khác đang chạy. Dev server nghiệm thu do Claude khởi chạy (`next dev`, cổng 3000, từ đúng checkout này) và đã dừng khi xong. Không commit/push/deploy, không đụng `DONE.md`/`TASKS.md`/v1.2.

**Skill dùng thực tế:** `agentic-design-system` (vòng chính), `ux-baseline-check` + `ui-polish-pass` (áp trong cùng lượt sửa), `e2e-verify` + `design-review` (nghiệm thu), `ponytail` (giữ diff nhỏ). Không dùng `modern-web-guidance` (không có câu hỏi browser/API nào repo + Radix chưa trả lời). Không cycle/orchestrate/subagent.

### Thay đổi

| Vùng | File | Nội dung |
|---|---|---|
| Draft | `draft-sim/components/TurnBanner.tsx` (mới) | Bên + hành động lượt hiện tại, "Bước x/18", thanh tiến độ, nút "Chọn tướng" (mở picker đúng bước hiện tại) và "Hoàn tác" (khoá khi chưa có lượt); 48px trên mobile. |
| Draft | `DraftSimView.tsx` | Thứ tự DOM: gợi ý → Xanh → Đỏ → điểm/lịch sử (mobile thấy gợi ý ngay sau lượt); desktop dùng grid giữ Xanh \| gợi ý + điểm + lịch sử \| Đỏ. Không đổi engine/URL/history. |
| Draft | `components/SideColumn.tsx` | 4 ô cấm → lưới 2×2 dưới nhãn CẤM (hàng 1 = cấm lượt 1, hàng 2 = cấm lượt 2, đúng `DRAFT_SEQUENCE`); hàng chọn bỏ khung viền ngoài; highlight lượt nằm trên chính ô; tên truy cập "CHỌN 3: Rouie", "Lane · CHỌN 3"; tên/lane dài xuống dòng thay vì cắt; focus ring. |
| Draft | `components/DraftControls.tsx` | Hoàn tác chuyển ra banner; Sao chép draft/link chỉ còn icon dưới 640px (giữ `aria-label`); label "Ván" gắn với select. |
| Draft | `SuggestionPanel.tsx`, `GlobalBanSection.tsx` | Bỏ `lg:sticky` (vô hiệu trong ô grid mới), focus ring cho gợi ý; nút xoá global ban có tên. |
| Picker dùng chung | `draft-input/HeroPickerDialog.tsx`, `HeroPickerSheet.tsx`, `HeroPickerGrid.tsx` | Tự nhớ nút đã mở và trả focus khi đóng; bỏ `autoFocus` (Radix vẫn focus ô tìm khi mở). **Lý do mở phạm vi:** trước đây đóng picker bằng Escape → focus rơi về `body` (đo 8/8 lần, desktop + sheet), trái tiêu chí 4. Đã smoke lại draft-input. |
| Meta | `meta-stats/MetaView.tsx` | Tab Tướng / Combo đồng đội / Kèo đối đầu / Duo theo cặp lane ngay dưới bộ lọc giải; toolbar Tìm tướng / Vị trí / Sắp xếp (+ đảo chiều) có label, dùng được ở 390px, chỉ hiện ở view Tướng (chế độ so sánh: tìm + vị trí, không sort vì bảng so sánh xếp theo chênh); 25 dòng/trang cho cả table và card; về trang 1 khi đổi giải/vị trí/tìm/sort; `aria-sort` ở header; bỏ khung cuộn lồng `max-h-96` của bảng cặp; select cặp lane có tên; nút So sánh có `aria-pressed`. Bộ lọc giải ghi rõ "Áp dụng cho mọi nhóm phân tích bên dưới". |
| Meta | `meta-stats/metaRows.ts` (mới), `__tests__/metaRows.test.ts` (mới) | `filterSortRows` (logic cũ dời ra, không đổi nghĩa) + `paginate`; 4 test: sort toàn tập trước khi cắt trang, lọc trước khi cắt trang, kẹp trang khi tập ngắn lại, tập rỗng. |
| Nav | `layouts/Navbar/index.tsx` | Tên i18n cho ngôn ngữ/theme/menu, `aria-expanded`/`aria-controls` cho menu mobile, Escape đóng menu + trả focus, tên sản phẩm hiện từ 360px (hẹp hơn thì `sr-only`), `nav` có `aria-label` i18n. **Sửa nút đổi ngôn ngữ:** trước đây `router.replace({ pathname: newLocale })` đưa `/vi/draft` → `/vi/en` (404); giờ giữ route + query (`?d=`). Lý do mở phạm vi: tiêu chí 1 (vi/en dùng được từ control). |
| i18n | `messages/{vi,en}.json` | `draft.stepProgress/draftComplete/chooseHero`, `meta.filterScope/viewsLabel/heroesTab/sort*/page*/paginationLabel/duoLanePair`, `nav.mainNav/language/themeTo*/openMenu/closeMenu`. |

Không sửa `public/data/**`, scripts, `src/modules/aov`, engine/history/URL contract, `DRAFT_SEQUENCE`, provider/auth, dependency/lockfile, config.

### Gates (nội dung cuối)

| Gate | Kết quả |
|---|---|
| `npm run lint` | PASS (exit 0) |
| `npm test` | PASS: 15 file / 102 test (baseline trước sửa 14 / 98; +4 test phân trang) |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |
| `npm run validate:data` | **FAIL, baseline có sẵn, không đổi:** `Series 's_arena_of_glory_winter_2026_2026_08_29_box_gamingvsgam_esports' có ván 4 nhưng format BO3.` Không sửa dataset/importer, không đóng v1.2. Dự án chưa thể gọi là production-ready vì lỗi dữ liệu này. |

### Before/after (cùng script `evidence/tools/capture.cjs`, Chromium, chụp viewport, cùng CSS viewport)

| Chỉ số | Before | After |
|---|---|---|
| Draft 390×844: gợi ý đầu | y=1352, 0 gợi ý trong viewport đầu | y=532, 4 gợi ý; banner + nút "Chọn tướng" 48px kết thúc ở y=353 |
| Draft 390×844: chiều cao trang | 2740 | 1976 |
| Draft 768×1024: gợi ý trong viewport đầu | 0 | 6 |
| Draft 1440×900 | 2 đội + 6 gợi ý, cao 965 | 2 đội + banner lượt + 6 gợi ý, cao 965 |
| Meta 1440×900: dòng render / chiều cao | 206 / 11757 | 25 (9 trang) / 1961 |
| Meta: vị trí Combo đồng đội | y=10757 (desktop), 35387 (mobile) | tab ở y=362 (desktop), 432 (mobile) |
| Meta 390: lọc vị trí + sort | không có (chỉ ở header bảng desktop) | có, kèm label |
| Combobox thiếu tên (draft / meta) | 11 / 2 | 0 / 0 |
| Nút thiếu tên (mobile) | menu; ngôn ngữ dưới `lg` | 0 |
| Tràn ngang 390 / 768 / 1440 | không | không |

Ảnh: `evidence/before/*.png`, `evidence/after/*.png` (tên = route-viewport-locale-theme; đủ dark/light × vi/en cho desktop + mobile, tablet vi-dark), `metrics.json` mỗi bên. Chữ dài (tên + lane dài nhất, cả en "Abyssal Dragon"): `after/draft-long-*.png`. Ảnh `evidence/*.jpg` gốc của khảo sát giữ nguyên.

### E2E (`evidence/after/e2e/e2e.json`, script `evidence/tools/e2e.cjs`, Chromium 151 qua Playwright 1.61): 62 PASS, 0 FAIL, 1 UNVERIFIED

| Nhóm | Bước | Kỳ vọng / thực tế | Kết quả | Ảnh |
|---|---|---|---|---|
| Draft 1440 vi dark | Bắt đầu | "Bên Xanh · CẤM", Bước 1/18, Hoàn tác khoá | PASS | `after/draft-desktop-vi-dark.png` |
| | Picker bằng bàn phím | Enter mở, Escape đóng, focus về "Chọn tướng" | PASS | |
| | Focus nhìn thấy | Tab tới gợi ý: `:focus-visible` + ring | PASS | `after/e2e/focus-visible-suggestion.png` |
| | Cấm bằng picker, 3 lượt bằng gợi ý | → "Bên Xanh · CHỌN 1", Bước 5/18 | PASS | |
| | Lane | gợi ý pick điền lane (Tà thần); chọn thủ công Rừng | PASS | |
| | Hoàn tác / xoá ô | Hoàn tác → 5/18; xoá ô cấm đầu → lượt về 1/18 | PASS | |
| | Hoàn thành | 18/18, banner hoàn tất, score card, lịch sử (1) | PASS | `after/e2e/draft-desktop-complete.png` |
| | Share / restore | link `?d=` → tab mới khôi phục đủ 18 ô giống hệt | PASS | |
| | Làm lại / lịch sử | 1/18, Hoàn tác khoá; tải lại từ lịch sử khớp 18 ô | PASS | |
| | Ván 2 | global ban 10 tướng; xoá 1 còn 9; tướng Xanh pick ở ván 1 bị khoá trong picker | PASS | `after/e2e/draft-desktop-van2.png` |
| Draft 390 dark | Viewport đầu | banner bottom 353, nút 48px, gợi ý 1 bottom 590 | PASS | `after/draft-mobile-vi-dark.png` |
| | Sheet / gợi ý / hoàn tác | cấm bằng bottom sheet, áp gợi ý, hoàn tác; nút chỉ-icon có tên; không tràn | PASS | `after/e2e/draft-mobile-fullpage.png` |
| Meta 1440 vi dark | Phân trang | 25/206, Trang 1/9; duyệt 9 trang = 206 dòng duy nhất | PASS | `after/meta-desktop-vi-dark.png` |
| | Đổi filter từ trang cuối | từ Trang 9/9 chọn Rừng → Trang 1/2, 43 dòng, toàn Rừng | PASS | |
| | Sort | WR giảm trên toàn tập (đầu trang 2 47.7% ≤ cuối trang 1 48.2%), `aria-sort`; đảo chiều | PASS | `after/e2e/meta-desktop-sorted.png` |
| | Tìm / rỗng | Y'bneth → 1 dòng; "zzzz" → thông báo rỗng, ẩn phân trang | PASS | |
| | Tabs | click + ←/→; đổi cặp lane duo; quay lại tab Tướng giữ ô tìm "an" | PASS | `after/e2e/meta-desktop-duo.png` |
| | So sánh A/B | `aria-pressed`, ẩn tab, 62 dòng có Chênh; tắt so sánh trả lại tab | PASS | `after/e2e/meta-desktop-compare.png` |
| | Trang tướng | mở `/vi/heroes/dolia`, h1 Dolia | PASS | |
| Meta 390 en light | Parity | lane + sort hiện, 25 card, tab trong viewport đầu, lọc Jungle, sort WR, Page 2, không tràn | PASS | `after/e2e/meta-mobile-en-light-jungle-wr.png` |
| Navbar 390 | Menu | tên + `aria-expanded`; Escape đóng, focus về nút | PASS | |
| | Theme / ngôn ngữ | tên i18n; đổi theme; vi→en giữ `/draft?d=` và ô cấm; en→vi; tên sản phẩm hiện | PASS | |
| Smoke 390 | Routes | `/vi/matches`, `/vi/draft-input`, `/en/draft`, `/en/meta`, `/vi/heroes/florentino`, `/vi/teams/team_saigon_phantom`: 200, không tràn | PASS | |
| | draft-input picker | input focus khi mở, chọn tướng vào ô, Escape trả focus về ô | PASS | |
| Runtime | Mobile WebKit | máy chỉ có Chromium (`ms-playwright/chromium-1234`); cài WebKit cần tải về, chưa được phép | UNVERIFIED | |

Console: chỉ có lỗi sẵn có `IntlError MALFORMED_ARGUMENT` từ `draftInput.importPlaceholder` (trang draft-input), không do đợt này. Chạy lại: dev server ở cổng 3000 rồi `node evidence/tools/capture.cjs <outDir>` và `node evidence/tools/e2e.cjs <outDir>` (dùng Playwright cài global + đường dẫn Chromium cố định trong script).

### Đối chiếu 6 tiêu chí

1. Điều hướng dùng chung: **PASS** (tên + focus + target 44px cho ngôn ngữ/theme/menu; vi/en giữ route; Home/dashboard/IA không đổi).
2. Draft: **PASS** (1440: 2 đội + lượt + 6 gợi ý; 390: lượt, nút chọn tướng, 4 gợi ý chưa cuộn; flow đầy đủ không mất chức năng).
3. Meta: **PASS**.
4. Responsive/a11y: **PASS trên Chromium**; mobile WebKit **UNVERIFIED**. Đã xem dark/light và vi/en trên ảnh after. Tab containment trong picker dựa vào Radix FocusScope, không đo riêng.
5. Gates: **PASS** (lint/test/tsc/build); `validate:data` fail baseline tách riêng.
6. Evidence: mục này. Không commit/push/deploy.

Verdict (ADS): **ready** cho phạm vi đợt này ở mức local candidate. Chưa commit, chưa deploy, chưa có người duyệt visual.

### Còn lại, ngoài phạm vi (ghi nhận, chưa làm)

1. Lý do gợi ý luôn tiếng Việt ở `/en` ("Ban-rate 65% · flex 3 lane (khó đoán bài)"), sinh trong `src/modules/aov`.
2. Panel gợi ý báo "Chưa có gợi ý (chưa đủ dữ liệu trận đấu)" cả khi dữ liệu đang tải lẫn khi draft đã đủ 18 bước; nay nằm ở viewport đầu mobile nên dễ thấy hơn.
3. HeroPicker hard-code tiếng Việt "Chọn tướng" / "Tìm tướng…" ở `/en` (draft + draft-input).
4. `draftInput.importPlaceholder` sai cú pháp ICU → IntlError console ở `/draft-input`.
5. ~~Meta: rời trang (mở trang tướng rồi Back) mất tab/bộ lọc/trang; state chưa vào URL.~~ **Đã giải quyết** ở mục "Sửa 3 lỗi hồi quy" bên dưới (state Meta nằm trên URL).
6. Score card cắt tên ở "Kèo theo lane" ("Điêu Thu…"); nút xoá global ban chỉ 16px.
7. `TournamentMultiSelect`: label "Giải đấu" chưa gắn programmatic với nút (tên đọc là "Tất cả giải").
8. Để sau từ khảo sát: Home/dashboard, logo `GraduationCap`.

## Sửa 3 lỗi hồi quy từ review Codex — 14/11/2026

Review độc lập (`evidence/review-codex/`, verdict *needs repair*) tái hiện 3 lỗi mà E2E 62 bước ở trên không bắt được; verdict "ready" ở mục trước vì vậy không còn đúng cho tới lượt sửa này. Chi tiết, nguyên nhân, test và số liệu: `evidence/fix-review-3issues/result.json`.

| Lỗi | Sửa | Kiểm chứng |
|---|---|---|
| Meta: xoá ô tìm làm sống lại trang 2 | Trang là state thật; đổi giải/vị trí/tìm/sort qua `changeFilter` luôn về trang 1 (`useMetaParams.ts`) | `useMetaParams.test.ts` + E2E reg-1: PASS |
| Meta: Back từ trang tướng về trang 1, mất bộ lọc | Tab/giải/vị trí/tìm/sort/trang/duo/so sánh nằm trên URL (`useSearchParams` + `history.replaceState`), query lạ về mặc định | `useMetaParams.test.ts` + E2E reg-2 (5 ca, gồm mở trực tiếp trang tướng): PASS |
| Draft: chọn lượt cuối qua banner, focus rơi về BODY | `useReturnFocus` dùng chung Dialog/Sheet; opener mất thì focus vùng banner hoàn tất | `useReturnFocus.test.ts` + E2E reg-3 desktop + mobile + smoke draft-input: PASS |

Gates chạy tuần tự trên nội dung cuối: lint 0, test 17 file / 112 test, tsc 0, build 0. E2E: 72 PASS, 0 FAIL, 1 UNVERIFIED (mobile WebKit). `validate:data` vẫn fail baseline, không đổi dữ liệu. Chưa commit/push/deploy.

Review độc lập lần 2 (`evidence/review-codex-fixes-2026-11-15/`, Codex, 15/11/2026): verdict **PASS cho 3 lỗi trên Chromium**; tự chạy lại lint/tsc/build exit 0, test 17 file / 112 test; 8 ca trọng tâm trên production build local (`checks.json`). Codex không chạy lại toàn bộ 72 bước, không WebKit, không sửa source.

## Chốt và phát hành — 15/11/2026

User cho phép cập nhật tài liệu, commit, push và deploy đợt UI này; ủy quyền mới thay giới hạn "không commit/push/deploy" ở tiêu chí 6 và các lượt trước. Phạm vi: chỉ đóng đợt UI draft/Meta, giữ nhận diện hiện tại. Không redesign thêm, không sửa backlog bên trên, không mở version mới và không đóng v1.2 dữ liệu trong `DONE.md`.

**Nghiệm thu local trước phát hành:** source khớp 20/20 hash trong `review-codex-fixes-2026-11-15/verification.json`; origin/main `50b7a39`, local `main` đi trước 2 commit, không lệch nhánh. Gates chạy tuần tự trên nội dung commit (15/11/2026, không có dev server dùng chung `.next`):

| Gate | Kết quả |
|---|---|
| `npm run lint` | exit 0 |
| `npm test` | exit 0, 17 file / 112 test |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0 |
| `npm run validate:data` | exit 1, **baseline đã biết, không phải lỗi mới:** `Series 's_arena_of_glory_winter_2026_2026_08_29_box_gamingvsgam_esports' có ván 4 nhưng format BO3.` Validator dừng ở lỗi đầu; `public/data/**` và `scripts/**` không đổi so với HEAD `f0cfff8` nơi đo baseline. Toàn dự án chưa thể gọi là production-ready vì lỗi dữ liệu này; v1.2 vẫn mở. |

Lúc chốt có một session khác đang chạy importer Liquipedia và sửa `exports/aog-w26-*.json` trong working tree (việc dữ liệu v1.2). Các file đó không được stage hay commit trong đợt UI.

**Phát hành cùng đợt UI (đã có sẵn trên `main`, chưa push trước lượt này, giữ nguyên lịch sử):**

- `89fb38e` fix(pipeline): `merge.mjs` tính lại winner/format, importer đọc `bestof` đúng, `validate:data` chặn ván > BO và winner lệch; "Đồng đội hay thắng cùng" chỉ giữ cặp thắng nhiều hơn thua (`heroStats.ts`); `DONE.md` mở v1.2.
- `f0cfff8` fix(data): sửa format BO cho 225 series GCS + RPL, winner RPL 11/09 Bacon Time vs FULL SENSE.

**Commit:** `df8b6f7` feat(ui), gồm UI + test + tài liệu/bằng chứng đợt này, stage tường minh 108 file (draft/meta/picker/navbar/messages, README, thư mục này). Không có `exports/`, `public/data/` hay file của session khác.

**Push:** 15/11/2026 01:45 (+07), push thường `50b7a39..df8b6f7 main -> main`, đưa lên cùng `89fb38e` và `f0cfff8`. Fetch ngay trước push: origin/main vẫn `50b7a39`, fast-forward, không force.

**Deploy (Vercel auto-deploy từ `main`, không dùng CLI, không đổi project/domain/env):** commit status pending 01:45:57 → success 01:46:39 (+07). GitHub deployment `7792185794`, environment Production, Vercel `VrygpoAFkXnRVm9Fd7busJYyPLYa`, URL `https://aov-ban-pick-a41ojwa9w-nutnut123qqs-projects.vercel.app`.

**Smoke production** trên https://aov-ban-pick.vercel.app, 01:47–01:51 (+07), Chromium 151. Bằng chứng ở `evidence/release-2026-11-15/` (`result.json`, `prod-capture/`, `prod-e2e/`). Chạy lại nguyên script 72 bước của lượt sửa lỗi, chỉ đổi `baseUrl`: **72 PASS, 0 FAIL, 1 UNVERIFIED**, 0 lỗi console.

| Yêu cầu kiểm production | Bằng chứng | Kết quả |
|---|---|---|
| Draft desktop/mobile: lượt hiện tại, nút chọn, gợi ý, picker | E2E draft-desktop 21/21, draft-mobile 6/6; `prod-capture/draft-*` | PASS |
| Lượt chọn cuối: banner hoàn tất nhận focus sau khi picker đóng | E2E reg-3 desktop + mobile 4/4 | PASS |
| Meta lọc/sort/phân trang; trang 2 → tìm → xoá về trang 1 | E2E meta-desktop 14/14, meta-mobile 6/6, reg-1 | PASS |
| Mở tướng rồi Back giữ trang/bộ lọc/tab | E2E reg-2 5/5 | PASS |
| vi/en, dark/light, điều hướng liên quan | E2E navbar 8/8, smoke 7 route; `prod-capture/` 21 ảnh | PASS |
| Mobile WebKit | chưa cài runtime | UNVERIFIED |

Số đo `prod-capture/metrics.json` trùng `after/metrics.json` local (gợi ý trong viewport đầu, vị trí banner/tab, 25 dòng, không tràn ngang, 0 control thiếu tên). Chỉ khác: trang Meta ngắn hơn 13px trên production ở mọi viewport. Nguyên nhân chưa xác định; ảnh không cho thấy mất nội dung.

**Kết luận:** đợt UI draft/Meta **đã chốt và phát hành** lên production. Giới hạn còn nguyên: mobile WebKit UNVERIFIED; `validate:data` fail baseline tại `df8b6f7`. Đợt này không đóng v1.2 dữ liệu: session dữ liệu tự đóng trong `3aa8073` (push riêng 15/11 08:26 +07). Commit đó ghi `validate:data` xanh, đợt này chưa kiểm lại. Smoke ở trên chạy trên deploy `df8b6f7`; production sau `3aa8073` chưa smoke lại. Không tuyên bố toàn dự án production-ready. Backlog ngoài phạm vi ở trên chưa làm.

Commit receipt này kích hoạt thêm một deploy production chỉ có tài liệu. Trạng thái của deploy đó báo trong bàn giao, không ghi lại vào repo để tránh vòng receipt → commit → deploy.
