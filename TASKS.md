# TASKS â€” orchestrate Tier 1+2 (meta/hero/team/draft)

Contract layer: `implementation-specs/` Â· Stub modules + i18n keys + `teamDisplayName` Ä‘Ă£ dá»±ng sáºµn (phase 0).

- [x] **W1 â€” Hero detail page** `/vi/heroes/[slug]`
  - Spec: implementation-specs/features/w1-hero-detail.md
  - Boundary: `app/[locale]/heroes/`, `src/features/hero-detail/**`, `src/modules/aov/heroStats.ts`, `src/modules/aov/__tests__/heroStats.test.ts`
  - Gates: lint 0 err, vitest pass
- [x] **W2 â€” Team profile page** `/vi/teams/[id]` + lá»c tráº­n theo tÆ°á»›ng
  - Spec: implementation-specs/features/w2-team-profile.md
  - Boundary: `app/[locale]/teams/`, `src/features/team-profile/**`, `src/modules/aov/teamStats.ts`, `src/modules/aov/__tests__/teamStats.test.ts`, `src/features/matches/MatchesView.tsx`
  - Gates: lint 0 err, vitest pass
- [x] **W3 â€” Draft score + copy/share** á»Ÿ `/draft`
  - Spec: implementation-specs/features/w3-draft-score.md
  - Boundary: `src/modules/aov/compScore.ts`, `src/modules/aov/__tests__/compScore.test.ts`, `src/features/draft-sim/**`
  - Gates: lint 0 err, vitest pass
- [x] **W4 â€” Meta WR theo bĂªn + ban phase 2 counter**
  - Spec: implementation-specs/features/w4-meta-assist.md
  - Boundary: `src/modules/aov/aggregate.ts`, `src/modules/aov/assist.ts`, `src/modules/aov/__tests__/assist.test.ts`, `src/modules/aov/__tests__/aggregate.test.ts`, `src/features/meta-stats/MetaView.tsx`
  - Gates: lint 0 err, vitest pass
- [x] **INT â€” tĂ­ch há»£p + gates Ä‘áº§y Ä‘á»§ + E2E** (coordinator)
  - Link hero name â†’ /heroes/[slug] á»Ÿ MetaView/PairTable; link team â†’ /teams/[id] náº¿u W2 chÆ°a lĂ m; Navbar náº¿u cáº§n
  - `npm run build` + Playwright E2E táº¥t cáº£ route má»›i
