# S1 — Stats layer: duration + duoLane + phasePick

Boundary (chỉ được sửa trong phạm vi này):
- `src/modules/aov/durationStats.ts` (implement stub có sẵn)
- `src/modules/aov/assist.ts` (chỉ phần `tally()` + helper liên quan; KHÔNG đổi logic suggest*)
- `src/modules/aov/aggregate.ts` (fill `avgWinSec`)
- `src/modules/aov/__tests__/durationStats.test.ts` + `assist.test.ts` + `aggregate.test.ts` (thêm case, không xoá case cũ)

Đọc trước: `implementation-specs/AGENT-START-HERE.md`, `src/modules/aov/assist.ts`, `src/modules/aov/aggregate.ts`, `src/modules/types/entities/aov.ts`.

## Task 1 — `getDurationStats` (durationStats.ts)

Contract đã stub sẵn trong file. Implement:

- Bỏ qua ván `duration_seconds` undefined/null/<=0.
- **Team rows**: mỗi ván → winner team += 1 win sample, loser += 1 lose sample.
- **Hero rows**: mỗi pick (`action_type==="pick"`, có `lane_position`) → hero đó += 1 sample vào win hoặc lose tuỳ bên pick thắng/thua. Một ván có thể đóng góp tối đa 10 sample hero (5/bên).
- `metaAvgSec` = trung bình duration của mọi ván hợp lệ.
- Mẫu tối thiểu: `winN >= 5` mới trả `avgWinSec` (không thì null); tương tự `avgLoseSec` với `loseN >= 5`. Export hằng `MIN_SAMPLE = 5` để test dùng.
- Sort `hero`/`team`: theo `avgWinSec` tăng dần, null xuống cuối, tie-break theo `id` asc.
- Test: file `durationStats.test.ts` — case empty, case duration missing, case <5 ván trả null, case đủ mẫu tính đúng trung bình, case thua tính vào loseN.

## Task 2 — `duoLane` trong tally (assist.ts)

- Field đã khai trong `Tally` + khởi tạo rỗng sẵn. Implement đếm.
- Với mỗi ván đủ ≥5 pick mỗi bên (cùng điều kiện với `pair`), lấy picks **kèm lane** của từng bên: `(heroId, lane)`.
- Với mỗi cặp cùng bên `i<j`: key = `${laneA}|${laneB}|${heroA}+${heroB}` — **lane sort trước** (`LANE_ORDER` trong `lanes.ts`: ta_than<rung<giua<rong_xa<rong_ho_tro), rồi hero sort trong cùng key. Nếu 2 pick trùng lane (flex), bỏ qua cặp đó.
- Cell PickCell giống pair: `n++`, `wins++` khi bên đó thắng, `redN` khi pick thuộc bên đỏ.
- Ván có pick thiếu lane: skip pick đó khỏi duoLane (nhưng vẫn vào pair nếu đủ 5).
- Thêm export nhỏ: `duoLaneKey(laneA, laneB, heroA, heroB)` hoặc export `LANE_ORDER` nếu S2 cần — S2 tự xây key theo đúng format trên, worker chỉ cần đảm bảo format key đúng spec.

## Task 3 — `phasePick` trong tally (assist.ts)

- key = `${heroId}|${phase}` với phase: `pick_index` 1-3 → `early`, 4-6 → `mid`, 7-10 → `late`; `pick_index` null → bỏ qua.
- Cell: `n++`, `wins++` theo bên pick thắng, `redN` khi bên đỏ.
- Đây là pick mọi lane (không filter lane — phase quan tâm thời điểm, không phải lane).
- Export type: `export type PickPhase = "early" | "mid" | "late"` + `export const pickPhaseOf = (idx: number | null): PickPhase | null`.

## Task 4 — `avgWinSec` trong aggregate (aggregate.ts)

- `MetaRow.avgWinSec` đã có sẵn (hiện null). Trong `PickAcc` thêm `winDurSum`, `winDurN`.
- Khi pick thắng và `m.duration_seconds > 0`: `winDurSum += duration_seconds`, `winDurN++`.
- `avgWinSec = winDurN >= MIN_SIDE_SAMPLE ? winDurSum / winDurN : null` — tái dùng `MIN_SIDE_SAMPLE`.

## Gates

- `npm run lint` — 0 lỗi (warning cũ thì giữ).
- `npx vitest run` — toàn bộ pass; thêm test mới cho mỗi task.
- KHÔNG `npm run dev`/`npm run build` (đụng `.next` của coordinator), KHÔNG commit/push.

## Evidence trả về

- List file đã sửa/tạo, kết quả lint + vitest (số test pass), 1-2 ví dụ output thật nếu debug được bằng vitest.
