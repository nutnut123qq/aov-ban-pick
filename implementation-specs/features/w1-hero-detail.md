# W1 — Trang Hero Detail `/[locale]/heroes/[slug]`

## Mục tiêu
Trang chi tiết cho 1 tướng: stats theo lane/giải, combo & kèo, trận gần nhất có VOD.

## Contract — implement `getHeroDetail` trong `src/modules/aov/heroStats.ts`
Signature + types ĐÃ CHỐT trong file đó (đọc file). Quy tắc:
- Quét `series[].matches[]`: pick = `draft_actions` có `action_type==="pick"` và `hero_id===slug` (bắt buộc `lane_position`); ban tương tự `action_type==="ban"`.
- `won` = `m.winner_team_id === (a.team_side==="blue" ? m.team_blue_id : m.team_red_id)`.
- `byLane`: group theo `lane_position`.
- `teammates`: cùng `team_side` trong cùng match với hero → key heroId đồng đội; chỉ giữ n≥5.
- `beats`/`losesTo`: hero khác phía bên kia trong cùng match; `beats` = WR của hero ta vs đối thủ (wins/n), chỉ n≥5, sort desc; `losesTo` = đối thủ có WR vs hero ta cao (sort desc theo WR đối thủ = 1 - wr ta).
- `byTournament`: group theo `s.tournament_name`, giữ thứ tự xuất hiện.
- `games`: mỗi match có pick hero → 1 ref; sort `played_at` desc, cap 30; `vodUrl` = `m.vod_url`.
- `null` nếu slug không có pick nào.

## UI — `src/features/hero-detail/HeroDetailView.tsx` + `app/[locale]/heroes/[slug]/page.tsx`
Route mỏng: `export default function Page(){ return <HeroDetailView/> }` (client component dùng `useParams()` lấy slug).
Layout (reuse Card/Table/Skeleton/badge của `src/components/ui`, style giống MetaView):
- Header: icon lớn `/images/heroes/${file}` + tên + số liệu tổng (picks/bans/WR).
- Card "Theo lane": table lane|picks|WR (i18n `lanes.*` cho tên lane).
- Card "Theo giải" (`hero.byTournament`): table giải|picks|bans|WR — đây là phần "trend theo mùa" (không cần chart, table đủ).
- 2 card cặp: `hero.teammates` (Đồng đội hay thắng cùng) và `hero.beats`/`hero.losesTo` — mỗi dòng icon+tên tướng, n, WR% (xanh ≥60%, đỏ <45%).
- Card "Trận gần nhất": list series — đối thủ (`teamDisplayName`), ngày, W/L, nút VOD (`MonitorPlay` icon, link `vodUrl`) nếu có. Click row → `/matches` (không cần deep-link).
- States: loading skeleton; slug không có → `hero.notFound`; mỗi bảng rỗng → `hero.pairEmpty`.
- i18n: namespace `hero.*` và `lanes.*` đã đủ sẵn.
- `Link` về `/meta` dùng `hero.backToMeta`. Link từ chỗ khác vào trang này do coordinator lo — worker KHÔNG sửa MetaView/MatchesView.

## Tests — `src/modules/aov/__tests__/heroStats.test.ts`
Mock series nhỏ (theo style `assist.test.ts`/`createMockSeries`): assert picks/bans/wins đếm đúng, teammates/matchups đúng chiều, games sort desc, slug lạ → null.

## DoD
`npm run lint` 0 error · `npx vitest run` pass · trang render được ở `/vi/heroes/sinestrea` (coordinator verify bằng browser sau).
