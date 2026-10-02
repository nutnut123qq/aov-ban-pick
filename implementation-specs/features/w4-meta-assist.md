# W4 — Meta thêm WR theo bên + gợi ý cấm counter ở phase 2

## A. WR theo bên — `src/modules/aov/aggregate.ts` + `MetaView.tsx`
- `MetaRow` thêm `wrBlue: number | null` và `wrRed: number | null` (WR của hero+lane khi pick ở bên Xanh / bên Đỏ; null khi mẫu <5).
- aggregateMeta: đếm theo (hero,lane,side) — `draft_actions` pick có `team_side` + `lane_position`; won như quy ước hiện có.
- MetaView: thêm cột `meta.blueRedWr` ("WR Xanh/Đỏ") hiển thị dạng `61% / 48%` (xanh/đỏ); cell trống `—` khi null. Thêm vào cả desktop table và StatCard mobile (nhỏ, secondary). Không cần sortable.
- Cập nhật `aggregate.test.ts` nếu có assert shape MetaRow (đọc test hiện có trước).

## B. Ban phase 2 gợi ý cấm counter — `src/modules/aov/assist.ts` `suggestBans`
Hiện `suggestBans` chỉ xếp theo ban-rate+flex. Thêm tín hiệu: **tướng khắc chế pick mình đã lộ** — khi `ctx.alliesPicked.length>0` (pick phase 1 của mình xong, đang ban phase 2):
- Với mỗi candidate `c` trong scored list: `denyScore` = mean qua các ally `a` của `t.matchup.get(`${c}|${a.heroId}`)` WR (c thắng a), chỉ cell n≥5.
- Boost score theo `denyScore` (deny = kèo địch có thể pick để counter ta → nên cấm). Trọng số ±0.15 max, chỉ áp khi ban ở phase trễ (`ctx.alliesPicked.length >= 2`) để ban đầu vẫn theo meta.
- Reason: nếu có pair đủ mẫu → thêm ` · counter ${allyName} ${w}/${n}` (lấy pair mạnh nhất).
- Cân nhắc thêm: cũng có thể cấm counter của enemyRevealed? KHÔNG — chỉ deny counter cho pick mình, giữ scope nhỏ.
- Tweak nhẹ sort: giữ banRate làm trục chính, cộng denyBoost vào score cuối cùng trước sort (hiện sort inline trong map → refactor sang rows có score như suggestPicks nếu cần, giữ output shape `Array<Suggestion>`).

## Tests — `assist.test.ts` + `aggregate.test.ts`
- assist: series mock có matchup mạnh → khi alliesPicked chứa hero bị counter, candidate counter đó lên top / reason chứa "counter".
- aggregate: wrBlue/wrRed đúng; null khi n<5.

## DoD
`npm run lint` 0 error · `npx vitest run` pass (gồm cả 38 test cũ) · cột mới hiện ở `/meta` (coordinator verify).
