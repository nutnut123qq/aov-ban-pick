# S2 — Meta UI: duration column + duo theo lane + phase + so sánh 2 giải

Boundary (chỉ được sửa):
- `src/features/meta-stats/**` (MetaView.tsx + component con tách ra nếu file phình)
- KHÔNG đụng `src/modules/**`, không đụng messages (keys đã dựng sẵn — liệt kê dưới)

Đọc trước: `implementation-specs/AGENT-START-HERE.md`, `src/features/meta-stats/MetaView.tsx`, `src/modules/aov/aggregate.ts` (MetaRow), `src/modules/aov/assist.ts` (Tally), `src/modules/aov/durationStats.ts`, `src/modules/aov/lanes.ts`, `src/components/TournamentMultiSelect.tsx`.

## Contract từ S1 (đang implement song song — code theo interface, đừng đợi)

- `MetaRow.avgWinSec: number | null` — TB giây/ván thắng của (hero,lane).
- `tally.duoLane: Map<string, PickCell>` — key `${laneA}|${laneB}|${heroA}+${heroB}` (lane sort theo LANE_ORDER, hero sort).
- `tally.phasePick: Map<string, PickCell>` — key `${heroId}|${"early"|"mid"|"late"}` (pick_index 1-3 / 4-6 / 7-10); `pickPhaseOf(idx)` export sẵn.
- `getDurationStats(series): DurationStats` — `.metaAvgSec`, `.hero` `.team` là `DurationRow{id,winN,loseN,avgWinSec,avgLoseSec}`.

## Task 1 — cột duration trong bảng meta

- Thêm cột sau `blueRedWr`: header `t("durationTitle")`, cell `avgWinSec` format `m′ss″` (vd `12′34″` — tự viết formatter nhỏ `formatSec`), null → `—`.
- Mobile card cũng hiện (dòng nhỏ).
- Nếu khác meta TB (`metaAvgSec` từ `getDurationStats`) >60s: hiển thị kèm tag nhỏ `fasterThanMeta`/`slowerThanMeta` (text-xs, màu muted).

## Task 2 — "Duo theo cặp lane" section

- Card mới dưới section Combo & Kèo hiện tại. Title `duoLanesTitle`, desc `duoLanesDesc`.
- Select (native `select` hoặc ui/select hiện có) chọn cặp lane: 10 cặp C(5,2), label = `tLane(laneA) + " × " + tLane(laneB)`.
- Bảng top 20 cặp: icon+tên 2 tướng (link `/heroes/[slug]` như PairTable hiện có), `n` ván, `wins/n` % — tô xanh khi ≥60%. Chỉ cặp n≥5.
- Query `tally.duoLane` — lấy tally qua `getTally(filteredSeries, key)` giống cách MetaView đang lấy cho Combo & Kèo (đọc code hiện có).
- Empty state: `pairEmpty`.

## Task 3 — cột/phase hiển thị

- Bảng meta thêm cột "Phase" (header `phaseTitle`) sau duration: 3 số nhỏ `E/M/L` = % pick rơi vào từng phase của hero đó (từ `phasePick`), vd `40/35/25`. Nếu tổng pick của hero đó <10 → `—`.
- Tooltip title attr: `phaseEarly`/`phaseMid`/`phaseLate`.
- Trên mobile: gộp vào dòng phụ.

## Task 4 — Chế độ So sánh 2 giải (compare)

- Toggle `compareEnable` (button/checkbox) ở filter bar. Khi bật: hiện **2 bộ filter giải** A và B (`compareA`/`compareB` — dùng lại `TournamentMultiSelect`, cho phép chọn nhiều giải mỗi bên).
- Chạy `aggregateMeta` 2 lần: `aggregateMeta(series, heroes, {...filter, tournamentNames: A})` và tương tự B.
- Join theo `heroId|lane` — hiện các row có ở **ít nhất 1** bên. Cột: Tướng | Lane | `n A` | `WR A` | `n B` | `WR B` | `delta` (`wrA - wrB`, `%`, tô xanh dương/đỏ, `—` khi 1 bên thiếu mẫu <5 pick).
- Sort theo |delta| desc; giữ filter lane/search hiện có áp cho cả 2 bên.
- Khi compare bật: ẩn các section pair/duo/phase (chỉ bảng compare) — giữ UI gọn.
- Mobile: giữ table scroll ngang (`overflow-x-auto`) là đủ, không cần card riêng.

## i18n keys đã có sẵn (vi + en), KHÔNG thêm mới

`meta.durationTitle, avgWin, avgLose, fasterThanMeta, slowerThanMeta, duoLanesTitle, duoLanesDesc, phaseTitle, phaseEarly, phaseMid, phaseLate, compareTitle, compareA, compareB, compareEnable, delta`.

## Gates

- `npm run lint` 0 lỗi · `npx vitest run` pass (không cần viết test mới nếu chỉ là UI, nhưng không được phá test cũ).
- KHÔNG dev/build/commit/push.

## Evidence

- File đã sửa, lint + vitest output.
