# S3 — Draft sim: kèo theo lane trong score card + share URL + history

Boundary (chỉ được sửa):
- `src/modules/aov/compScore.ts` + `__tests__/compScore.test.ts`
- `src/modules/aov/draftUrl.ts` (implement stub có sẵn) + `__tests__/draftUrl.test.ts`
- `src/features/draft-sim/**` (DraftSimView, DraftControls, DraftScoreCard, hooks/useDraftEngine, component con mới nếu cần)
- KHÔNG đụng assist.ts, MetaView, messages (keys dựng sẵn dưới)

Đọc trước: `implementation-specs/AGENT-START-HERE.md`, `src/modules/aov/compScore.ts`, `src/modules/aov/draftUrl.ts`, `src/features/draft-sim/DraftSimView.tsx`, `components/DraftScoreCard.tsx`, `components/DraftControls.tsx`, `hooks/useDraftEngine.ts`, `src/modules/aov/assist.ts` (Tally.matchup).

## Task 1 — `laneEdges` trong CompScore (compScore.ts)

- Thêm vào `CompScore`: `laneEdges: Array<LaneEdge>` với `interface LaneEdge { lane: Lane; edge: number; n: number; blueHero: string | null; redHero: string | null }`.
- Trong `scoreDraft`: với mỗi lane trong 5 lane, nếu cả 2 bên đều có pick hợp lệ ở lane đó → tra `t.matchup.get(`${blueHero}|${redHero}`)`:
  - có cell và `n >= 5` → `edge = clampEdge((cell.wins/cell.n - 0.5) / 0.5)` (dương = Xanh thắng kèo), `n = cell.n`
  - không đủ mẫu → `edge = 0`, `n = cell?.n ?? 0`
- Lane thiếu pick 1 bên → vẫn push row với `blueHero`/`redHero` null bên thiếu, edge 0.
- Sort theo `LANE_ORDER` (import từ `./lanes` hoặc định nghĩa giống heroStats).
- **Backward-compat**: field mới required → sửa `compScore.test.ts` nếu literal CompScore thiếu field.
- Thêm test: draft có kèo đủ mẫu → laneEdges đúng lane/edge; kèo thiếu mẫu → edge 0.

## Task 2 — Per-lane bars trong DraftScoreCard.tsx

- Dưới breakdown 3 tín hiệu, thêm block `t("score.perLane")`: 5 hàng, mỗi hàng = tên lane + mini bar 2 chiều (kiểu bar tổng hiện có nhưng h-1.5) + `%`.
- `n < 5` → hiện `—` (muted). Edge dương → thanh xanh lệch phải... chuẩn: bên Xanh bên trái giống bar tổng — edge>0 tô `bg-blue-500` chiếm `edge` phần bên trái. Đơn giản nhất: tái dùng pattern bar tổng với width `50 + edge*50 %`.
- Hiện tên hero 2 đầu nếu có (`blueHero`/`redHero` — map qua manifest name; truyền map heroBySlug vào props hoặc component nhận `heroBySlug`).
- Mobile co lại ok (hàng flex-col text-xs).

## Task 3 — draftUrl.ts (implement stub)

- `encodeDraft(slots)`: chỉ ô `heroId` khác null; token `${index}:${heroId}` hoặc `${index}:${heroId}:${lane}` khi có lane; join `,`. Rỗng → `""`.
- `decodeDraft(raw)`: split `,` → từng token parse `index:number`, `heroId:string` (non-empty), `lane?` phải nằm trong 5 lane hợp lệ (import danh sách lane từ types/lanes). Token hỏng → bỏ. `index` ngoài 0..17 → bỏ. `raw` null/""/`undefined` → `[]`.
- Test `draftUrl.test.ts`: roundtrip encode→decode, token xấu bị skip, index ngoài range, lane invalid bỏ lane nhưng giữ pick (hoặc bỏ cả — chọn 1 và ghi rõ; khuyến nghị: giữ pick, lane=null), chuỗi rỗng.
- URL-safe: heroId là slug `[a-z0-9-]` nên không cần encode thêm.

## Task 4 — Share + history trong DraftSimView

- **Share URL**: `useSearchParams`/`useRouter` từ next/navigation. Khi mount: đọc `searchParams.get("d")` → `decodeDraft` → nếu non-empty, điền vào `filled` (thêm hàm `loadDraft(slots)` trong useDraftEngine hoặc set trực tiếp qua API hook hiện có — đọc hook trước, đừng hack). 
  - Mỗi khi `filled` đổi → `router.replace` với `?d=<encoded>` (giữ param khác nếu có). Dùng `useEffect` + `encodeDraft`; skip khi encoded `""`.
- **Nút "Sao chép link"** trong DraftControls cạnh "Sao chép draft": `navigator.clipboard.writeText(window.location.href)` → state `linkCopied` 2s (pattern `copied` hiện có, tái dùng).
- **History**: localStorage key `aov-draft-history` — mảng `{ slots: Array<DraftSlot>, savedAt: number, label: string }` (label = `${bluePicks[0]}·${redPicks[0]}...` hoặc tóm tắt tự chọn, giữ ≤20 entries, newest-first, dedupe theo encoded string).
  - Lưu khi draft **đủ 18 bước** (filled đầy đủ) — hook một lần qua effect.
  - UI: popover/collapsible nhỏ trong panel phải (dưới SuggestionPanel hoặc trong DraftControls) — list tối đa 20, mỗi entry: label + nút `historyLoad` (load vào draft) + `historyDelete`.
  - `historyEmpty` khi rỗng.
- Vì `filled` hiện là state trong hook — kiểm tra cách apply suggestion hoạt động và tái dùng đúng cơ chế (không tạo state song song).

## i18n keys đã có sẵn

`draft.copyLink, linkCopied, historyTitle, historyEmpty, historyLoad, historyDelete, score.perLane` + `lanes.*`.

## Gates

- `npm run lint` 0 lỗi · `npx vitest run` pass, test mới cho compScore + draftUrl.
- KHÔNG dev/build/commit/push.

## Evidence

- File đã sửa, lint + vitest output, note cách loadDraft được tích hợp vào useDraftEngine.
