# W2 — Trang Team Profile `/[locale]/teams/[id]` + lọc trận theo tướng ở `/matches`

## A. Team profile

### Contract — implement `getTeamDetail` trong `src/modules/aov/teamStats.ts` (signature/types đã chốt)
- Đội chơi trong series khi `s.team_blue_id===id || s.team_red_id===id` (lưu ý: mỗi ván có `team_blue_id`/`team_red_id` riêng — đội có thể đổi bên theo ván; dùng per-match sides).
- `heroPool`: picks/wins của ĐỘI này (draft_actions pick có team_side khớp bên đội trong match đó) + `bansByTeam` (ban do đội thực hiện) + `bansAgainst` (ban của phe kia nhắm hero đó — tức ban phe đối diện trong cùng match). Sort theo picks desc.
- `combos`: cặp pick cùng đội trong cùng match, n≥3, sort wins/n desc, cap 15.
- `seasons`: group theo tournament_name: seriesWon/Lost + gameWon/Lost.
- `opponents`: per team_id đối thủ, series W-L.
- `recent`: các series của đội, sort played_at desc, cap 10.
- `null` nếu team không xuất hiện.

### UI — `src/features/team-profile/TeamProfileView.tsx` + `app/[locale]/teams/[id]/page.tsx` (route mỏng, `useParams()`)
- Header: `teamDisplayName(teamId)` + record `team.seriesWl`/`team.gameWl`.
- Card `team.heroPool`: table tướng (icon+tên) | picks | WR | bansByTeam | bansAgainst.
- Card `team.combos`: A+B, n, WR%.
- Card `team.seasons`: giải | series W-L | ván W-L.
- Card `team.opponents`: đội | W-L.
- Card `team.recentMatches`: ngày, giải, vs đối thủ, kết quả — reuse style list của MatchesView card (giữ đơn giản).
- States: loading skeleton; `team.notFound` khi null; i18n `team.*` đã có sẵn; tên đội qua `teamDisplayName` từ `@/modules/aov/leagues`.

## B. MatchesView — lọc theo tướng + link sang profile
File `src/features/matches/MatchesView.tsx` (được phép sửa):
- Filter card có sẵn: thêm Select "Tướng" (`matches.filter.hero`, option đầu `matches.filter.allHeroes`) — options = mọi hero có pick/ban trong data (từ data.heroes). Chọn hero → danh sách series chỉ giữ series có ít nhất 1 match chứa hero đó trong draft_actions.
- Tên đội trong list card (và header standings) bọc `Link` → `/<locale>/teams/<teamId>` — lấy locale qua `useLocale()` (đã import sẵn). Giữ styling (hover underline nhẹ).
- Trong `SeriesDetailView`/`MatchDraftView` (cùng file) cũng bọc tên đội thành Link tương tự nếu dễ — optional.

## Tests — `src/modules/aov/__tests__/teamStats.test.ts`
Mock nhỏ: assert heroPool/combos/opponents/seasons đúng, team lạ → null.

## DoD
`npm run lint` 0 error · `npx vitest run` pass · `/vi/teams/team_saigon_phantom` render (coordinator verify).
