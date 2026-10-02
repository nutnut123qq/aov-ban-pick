# TASKS — orchestrate vòng 2 (items 1,2,3,5,7,8)

Contract layer: `implementation-specs/features/s*.md` · stub `durationStats.ts`/`draftUrl.ts` + `Tally.duoLane/phasePick` + `MetaRow.avgWinSec` + i18n keys đã dựng sẵn (phase 0, coordinator).

- [ ] **S1 — Stats layer: duration + duoLane + phasePick + avgWinSec**
  - Spec: implementation-specs/features/s1-stats.md
  - Boundary: `src/modules/aov/durationStats.ts`, `assist.ts` (chỉ tally), `aggregate.ts`, `__tests__/durationStats|assist|aggregate.test.ts`
  - Gates: lint 0 err, vitest pass
- [ ] **S2 — Meta UI: cột duration + duo theo lane + phase + compare 2 giải**
  - Spec: implementation-specs/features/s2-meta-ui.md
  - Boundary: `src/features/meta-stats/**`
  - Phụ thuộc: contract S1 (code theo interface, không đợi)
- [ ] **S3 — Draft UI: laneEdges + per-lane bar + share URL + history**
  - Spec: implementation-specs/features/s3-draft-ui.md
  - Boundary: `src/modules/aov/compScore.ts`, `draftUrl.ts`, `__tests__/compScore|draftUrl.test.ts`, `src/features/draft-sim/**`
- [ ] **INT — coordinator: gates đầy đủ + build + E2E Playwright + push**
