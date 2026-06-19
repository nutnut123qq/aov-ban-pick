@AGENTS.md

# AOV DraftMind — Frontend

> Trợ lý cấm/chọn (ban/pick) cho Liên Quân Mobile: thống kê meta + gợi ý draft theo thời gian thực.
> Sản phẩm là **Front-End thuần**, không backend riêng cho phần draft — dữ liệu trận đấu là **JSON tĩnh** đi kèm site, tính toán chạy trong browser. Xem [`.claude/design/01-product-overview.md`](.claude/design/01-product-overview.md).

⚠️ **Đọc trước khi code Next.js:** Đây là Next.js 16 (App Router) — API và quy ước có thể khác với dữ liệu huấn luyện. Đọc guide liên quan trong `node_modules/next/dist/docs/` trước khi viết code (xem [AGENTS.md](AGENTS.md)).

---

## Codebase đang trong giai đoạn chuyển đổi

Repo này được fork từ một nền tảng học tập ("TEDO/StarCI Academy") và đang được **chuyển mục đích** sang AOV DraftMind. Vì vậy:

- Nhiều file/route của sản phẩm cũ (courses, learning-paths, community, quiz…) đang **bị xoá** trong working tree — đừng dựa vào chúng.
- Hạ tầng giữ lại: auth (Keycloak), i18n, Redux, SWR/Apollo, hệ component, các provider.
- File `.cursor/rules/starci-academy-fe.mdc` là **rule cũ, một phần đã lỗi thời** (vd nói `src/app`, thực tế route nằm ở `app/`). Khi mâu thuẫn, tin vào `.claude/pattern/*` và source thực tế.

---

## Tài liệu (đọc theo nhu cầu)

**`.claude/design/`** — thiết kế sản phẩm/nghiệp vụ (cái *gì* và *tại sao*), chắt lọc từ `aov_draftmind_proposal.md`:

| File | Nội dung |
|------|----------|
| [`01-product-overview.md`](.claude/design/01-product-overview.md) | Định vị sản phẩm, kiến trúc FE-only, nguyên tắc thiết kế |
| [`02-draft-format.md`](.claude/design/02-draft-format.md) | Luật cấm/chọn chính thức: chọn bên, trình tự, luật cấm chọn quốc tế, blind pick |
| [`03-data-model.md`](.claude/design/03-data-model.md) | JSON schema, tổ chức file dữ liệu, dữ liệu dẫn xuất |
| [`04-features.md`](.claude/design/04-features.md) | Đặc tả tính năng cốt lõi (Simulator, Dashboard, Assist, Matchup, Report) |
| [`05-statistics.md`](.claude/design/05-statistics.md) | Cỡ mẫu nhỏ, làm mượt Bayes, Wilson interval, lộ trình thuật toán |
| [`06-roadmap-kpi.md`](.claude/design/06-roadmap-kpi.md) | Roadmap theo phiên bản + KPI |

**`.claude/pattern/`** — pattern code (cái *như thế nào*), chắt lọc từ source thực tế:

| File | Nội dung |
|------|----------|
| [`01-architecture.md`](.claude/pattern/01-architecture.md) | Stack, bản đồ thư mục, cây provider, ranh giới client/server |
| [`02-singleton-hooks.md`](.claude/pattern/02-singleton-hooks.md) | Pattern singleton hook (`core/` + `impls/` + Context) |
| [`03-components-styling.md`](.claude/pattern/03-components-styling.md) | Hai hệ component (HeroUI `AovX` vs shadcn `ui/`), styling, theme |
| [`04-state-data-api.md`](.claude/pattern/04-state-data-api.md) | Redux, SWR, Apollo GraphQL, REST, env |
| [`05-types-conventions.md`](.claude/pattern/05-types-conventions.md) | Entities, code style, JSDoc, imports |
| [`06-app-router-i18n.md`](.claude/pattern/06-app-router-i18n.md) | App Router (`app/`), `[locale]`, next-intl |

---

## Lệnh thường dùng

```bash
npm run dev      # next dev (http://localhost:3000)
npm run build    # next build
npm run start    # next start (sau build)
npm run lint     # eslint — phải pass trước khi coi là xong
```

---

## Quy ước cốt lõi (chi tiết trong `.claude/pattern/`)

- **Path alias:** `@/*` → `src/*`. Route nằm ở `app/` (root), không phải `src/app`.
- **Code style:** 4 space indent, double quotes, hầu như không dùng dấu `;`, JSDoc `/** */` cho mọi field/hook công khai, `Array<T>` thay vì `T[]` ở type dùng chung, `import type` cho import chỉ-type.
- **`"use client"`:** đặt ở ranh giới nhỏ nhất cần browser API/state/event; mặc định để Server Component.
- **i18n:** `next-intl`, locale `en`/`vi`, **mặc định `vi`**; route dưới `app/[locale]/`. Chuỗi UI lấy từ `src/messages/{en,vi}.json`.
- **Component mới:** ưu tiên dùng lại `src/components/atomic/Aov*` (HeroUI) hoặc `src/components/ui/*` (shadcn) — **giữ nhất quán trong một feature**, đừng trộn bừa.
- **State/Data:** Redux Toolkit cho global state; SWR/Apollo cho data; hook dùng chung theo pattern singleton (mục `.claude/pattern/02`).
- **Đừng thêm dependency** nếu không thật cần — stack đã khá đầy đủ (gồm `simple-statistics` + `decimal.js` cho phần thống kê Bayes/Wilson).

Khi sửa nhiều file theo một style, đọc `eslint.config.mjs` trước rồi chạy `npm run lint`.
