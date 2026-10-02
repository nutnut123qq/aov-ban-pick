# W3 — Chấm điểm đội hình + copy draft ở `/draft`

## A. Contract — implement `scoreDraft` trong `src/modules/aov/compScore.ts` (signature/types đã chốt)
Input: 5 pick mỗi bên `{heroId, lane}` + `Tally` (từ `getTally`, có sẵn `pick`, `pair`, `matchup`, `blueBase`).

Heuristic chuẩn hoá từng tín hiệu về −1..1 rồi cộng trọng số:
- `laneEdge` = mean(adjRate của pick Xanh) − mean(adjRate Đỏ). `adjRate` theo công thức đang dùng trong `assist.ts` (side-adjusted: `(wins − expWins + 0.5n)/n` với `expWins = redN·redBase + (n−redN)·blueBase`); hero|lane không có trong tally → 0.5. Chuẩn hoá: edge thô /0.5 clamp về −1..1.
- `synergyEdge` = mean WR các cặp nội bộ Xanh (C(5,2)=10 cặp, lookup `t.pair` key sort `a+b`, bỏ cặp n<5) − tương tự Đỏ; /0.5 clamp.
- `matchupEdge` = mean `t.matchup.get(`${b}|${r}`)` WR (b∈blue, r∈red, bỏ n<5) − 0.5 baseline; /0.5 clamp — dương = Xanh thắng kèo.
- `probBlue` = 0.5 + 0.4·laneEdge + 0.3·synergyEdge + 0.3·matchupEdge, clamp 0.05..0.95.
- Trả null nếu tally.totalMatches < 50 hoặc một bên chưa đủ pick hợp lệ (chấm được kể cả chưa đủ 5 pick — chấm trên phần đã có; nhưng nếu cả hai bên 0 pick → null).

## B. UI — trong `src/features/draft-sim/`
- Card nhỏ "Đánh giá đội hình" (`draft.score.*`) render khi có ≥1 pick mỗi bên: thanh bar 2 chiều + `% nghiêng Xanh/Đỏ` (`score.blueFavored`/`score.redFavored` với prob = % bên nghiêng) + breakdown 3 dòng nhỏ (lane/synergy/matchup edge dạng ±số hoặc mũi tên). Dùng `getTally(filteredSeries, tournamentNames.join("|"))` từ `@/modules/aov` — tally đã cache LRU, không sợ recompute. Đặt card trong SuggestionPanel hoặc cạnh nó — đọc `DraftSimView.tsx`/`SuggestionPanel.tsx` hiện tại và đặt hợp lý nhất, không phá layout 3 cột.
- Nút `draft.copyDraft`: copy text draft `Xanh: A(lane)·B… | Đỏ: X… | Ban: …` vào clipboard, hiện `draft.copied` ~2s (đã có i18n keys). Đặt cạnh nút Hoàn tác/Làm lại.

## Tests — `src/modules/aov/__tests__/compScore.test.ts`
Mock tally nhỏ hoặc dựng từ mock series (reuse helper của `assist.test.ts` nếu export được, không thì tự mock tối thiểu): probBlue∈(0,1); đội toàn pick WR cao → edge dương; null khi không đủ data.

## DoD
`npm run lint` 0 error · `npx vitest run` pass · card score hiện khi draft có pick (coordinator verify browser).
