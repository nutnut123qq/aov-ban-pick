# Pattern — Quy ước & pattern code

Thư mục này mô tả **cách code repo này được tổ chức** — pattern và quy ước rút ra từ source thực tế. Khi viết code mới, theo các pattern ở đây để giữ nhất quán.

Thiết kế *sản phẩm* (nghiệp vụ, luật, schema) nằm ở [`../design/`](../design/).

| File | Nội dung |
|------|----------|
| [01-architecture.md](01-architecture.md) | Stack, bản đồ thư mục, cây provider, ranh giới client/server |
| [02-singleton-hooks.md](02-singleton-hooks.md) | Pattern singleton hook (`core/` + `impls/` + Context) |
| [03-components-styling.md](03-components-styling.md) | Hai hệ component (HeroUI `Aov*` vs shadcn `ui/`), styling, theme |
| [04-state-data-api.md](04-state-data-api.md) | Redux, SWR, Apollo GraphQL, REST, env |
| [05-types-conventions.md](05-types-conventions.md) | Entities, code style, JSDoc, imports |
| [06-app-router-i18n.md](06-app-router-i18n.md) | App Router (`app/`), `[locale]`, next-intl |

## Tối quan trọng

- **Đây là Next.js 16** — đọc `node_modules/next/dist/docs/` trước khi viết code Next (xem [AGENTS.md](../../AGENTS.md)). API có thể khác training data.
- **Repo đang chuyển đổi** từ nền tảng học tập sang AOV DraftMind. Tin source thực tế + các file này hơn `.cursor/rules/starci-academy-fe.mdc` (rule cũ, có chỗ lỗi thời — vd nói `src/app`, thực tế là `app/`).
- **Đừng thêm dependency** nếu không thật cần.
