# AGENT-START-HERE — luật chung cho mọi worker

Repo: **AOV DraftMind** — Next.js 16 App Router + React 19 + TS strict, FE-only (data JSON tĩnh trong `public/data/`).

Đọc `AGENTS.md` ở repo root trước khi code. Luật bắt buộc:

- **Code style**: 4-space indent, double quotes, KHÔNG dùng `;` cuối câu, `Array<T>` thay `T[]`, `import type` cho type-only, JSDoc `/** */` cho mọi interface field + exported fn. Path alias `@/*` → `src/*`. Route ở `app/[locale]/` (KHÔNG phải src/app).
- **UI**: dùng `src/components/ui/*` (shadcn/radix) + Tailwind. Không trộn HeroUI. Icon: `lucide-react` (brand icons như Youtube đã bị xoá khỏi lib — dùng `MonitorPlay` cho VOD).
- **i18n**: KHÔNG hard-code text. Mọi key cần thiết **đã có sẵn** trong `src/messages/{vi,en}.json` — dùng đúng key được giao trong spec, đừng thêm key mới.
- **Data**: `useAovData()` trả `{ heroes, series }`. Types ở `@/modules/types` (`Series`, `Match`, `DraftAction`, `Lane`, `TeamSide`). `teamDisplayName()` và `leagueOf()`/`groupTournamentsByRegion()` ở `@/modules/aov/leagues` — dùng lại, đừng viết lại.
- **Contract modules** (`src/modules/aov/heroStats.ts`, `teamStats.ts`, `compScore.ts`): types + signature đã chốt sẵn — implement đúng contract, KHÔNG đổi public shape. Pair stats: min sample n≥5 cho suggestion, n≥8 cho bảng hiển thị.
- **KHÔNG**: commit, push, sửa file ngoài write boundary, đổi contract/signature không báo, chạy `npm run build` (coordinator chạy sau), thêm dependency.
- **Gates bắt buộc trước khi báo xong**: `npm run lint` (0 error) + `npx vitest run` (pass). KHÔNG chạy `npm run dev`/`build` — tránh đụng `.next` khi worker khác cũng đang chạy.
- **Evidence**: báo lại (1) danh sách file đã sửa/tạo, (2) output tail của lint + test, (3) note UI cần coordinator verify bằng browser.
