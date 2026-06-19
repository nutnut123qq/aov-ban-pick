<!-- AGENTS.md — hướng dẫn dành cho AI coding agents. Đọc file này trước khi sửa code. -->

# AOV DraftMind — Frontend

> Trợ lý cấm/chọn (ban/pick) cho **Liên Quân Mobile**: thống kê meta, mô phỏng draft, nhập liệu trận đấu và gợi ý theo thời gian thực.
>
> Đây là **Next.js 16 App Router frontend**. Repo đang trong giai đoạn chuyển đổi từ một nền tảng học tập cũ (StarCI/TEDO Academy) sang sản phẩm AOV DraftMind; nhiều file/route cũ đã bị xoá, còn hạ tầng Next.js/i18n/Redux/provider được giữ lại và tái dụng.

⚠️ **Đọc trước khi viết code Next.js:** Đây là **Next.js 16**, React 19, App Router. API và quy ước có thể khác dữ liệu huấn luyện. Khi nghi ngờ, tra `node_modules/next/dist/docs/` thay vì dựa vào trí nhớ.

---

## 1. Tổng quan sản phẩm

- **Tên:** AOV DraftMind
- **Mô tả:** SPA-style frontend chạy trong browser, hiển thị dữ liệu draft Liên Quân từ file JSON tĩnh.
- **Kiến trúc đã chốt:** **FE-only, không backend riêng** cho phần draft. Dữ liệu trận đấu là JSON tĩnh trong `public/data/`; tính toán và render chạy hoàn toàn trong browser.
- **Luồng dữ liệu:**
  1. Người dùng nhập liệu qua trang `/draft-input` → export JSON.
  2. Vận hành chạy `node scripts/merge.mjs <export.json> --season <id>` để gộp vào `public/data/matches/<id>.json`.
  3. Build & deploy lại site → dữ liệu mới lên production.
- **Trạng thái repo:** Đang chuyển đổi. Nhiều file cũ (courses, learning-paths, community, quiz, auth StarCI…) đã bị xoá khỏi working tree. Chỉ nên dựa vào source thực tế còn lại và các file trong `.claude/design/` / `.claude/pattern/`.

---

## 2. Technology stack

| Lớp | Công nghệ |
|-----|-----------|
| Framework | **Next.js 16.2.1** (App Router), **React 19.2.4** |
| Ngôn ngữ | **TypeScript 5** (`strict: true`) |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) + **HeroUI** (`@heroui/react`) + **shadcn/ui** (radix) |
| Theme | `next-themes` (mặc định `dark`), HeroUI theme ở `app/hero.ts` |
| i18n | `next-intl` — locale `en`/`vi`, **mặc định `vi`** |
| Global state | **Redux Toolkit** (`@reduxjs/toolkit` + `react-redux`) |
| Data fetching | **SWR** + **Apollo Client** (GraphQL) + `fetch`/`axios` (REST) |
| Auth (hạ tầng cũ) | **Keycloak** (`keycloak-js`) — hiện không dùng cho draft FE-only |
| Forms | **Formik** + **Yup** |
| Animation | **framer-motion** |
| Icons | **lucide-react** + **@phosphor-icons/react** |
| Số liệu/thống kê | **simple-statistics** + **decimal.js** + **numeral** |
| Khác | `dayjs`, `superjson`, `swiper`, `cmdk`, `class-variance-authority`, `clsx`, `tailwind-merge` |

---

## 3. Cấu trúc thư mục

```
app/                      # App Router — ROUTES nằm ở đây (KHÔNG phải src/app)
  layout.tsx              # Root layout: fonts, metadata, NextIntlClientProvider
  InnerLayout.tsx         # "use client" — cây provider
  hero.ts                 # HeroUI theme (primary/secondary palette)
  globals.css             # Tailwind v4 + CSS variables + theme tokens
  [locale]/               # Mọi route public lồng dưới locale
    page.tsx              # Trang chủ
    dashboard/page.tsx    # Dashboard điều hướng tới các công cụ
    draft/page.tsx        # Mô phỏng draft
    draft-input/page.tsx  # Nhập liệu draft + export JSON
    meta/page.tsx         # Thống kê meta

src/
  components/
    atomic/Aov*/          # Wrapper mỏng quanh HeroUI (AovButton, AovInput, ...)
    ui/                   # shadcn/ui components (button, card, dialog, ...)
    layouts/Navbar/       # Navbar + điều hướng
    providers/            # HeroUIProvider, NextThemesProvider, SwrProvider
    svg/                  # SVG icons (GoogleIcon, Logo)
    ConditionalNavbar.tsx # Ẩn/hiện navbar theo route
  features/               # Các màn hình/tính năng lớn
    draft-input/          # UI + logic nhập liệu draft
    draft-sim/            # Mô phỏng draft + gợi ý
    meta-stats/           # Thống kê meta
  hooks/                  # Custom hooks dùng chung
  modules/
    aov/                  # Load + cache dữ liệu tĩnh AOV (heroes, series)
    api/                  # GraphQL (Apollo) + REST client + types
    types/                # Entities + enums dùng chung
    utils/                # computations/, regression.ts, format, sanitize, ...
  redux/                  # Store, slices, ReduxProvider
  resources/env/          # publicEnv() / internalEnv()
  messages/
    en.json               # Chuỗi i18n tiếng Anh
    vi.json               # Chuỗi i18n tiếng Việt (default)
  lib/
    utils.ts              # cn() = twMerge(clsx(...))

public/
  data/                   # JSON tĩnh: index.json + matches/<season>.json
  images/heroes/          # Ảnh tướng + manifest.json

scripts/
  download-heroes.mjs     # Tải ảnh tướng từ hero-urls.json
  merge.mjs               # Gộp JSON export vào public/data/

.claude/design/           # Thiết kế sản phẩm (product, data model, features, statistics, roadmap)
.claude/pattern/          # Pattern code (architecture, hooks, styling, state, conventions, i18n)
```

Path alias: **`@/*` → `src/*`**.

---

## 4. Lệnh build, dev, test

```bash
# Dev server (Turbopack, http://localhost:3000)
npm run dev

# Production build
npm run build

# Chạy production server (sau build)
npm run start

# Lint — PHẢI PASS trước khi coi là xong
npm run lint

# Gộp JSON export từ draft-input vào dữ liệu tĩnh
node scripts/merge.mjs <export.json> --season <season-id> [--force]

# Tải ảnh tướng (cần hero-urls.json)
node scripts/download-heroes.mjs
```

> **Lưu ý:** Project hiện **không có test runner** (Jest/Vitest/Playwright). Đảm bảo `npm run lint` và `npm run build` pass là yêu cầu tối thiểu trước khi commit.

---

## 5. Runtime architecture

### 5.1 App Router & i18n

- Route nằm ở `app/` (root), **không phải `src/app`**.
- Mọi route public nằm dưới `app/[locale]/`.
- `middleware.ts` chạy `next-intl` middleware và canonicalize redirect URL khi đứng sau Cloudflare Tunnel.
- `src/i18n/routing.ts`: `locales: ["en", "vi"]`, `defaultLocale: "vi"`.
- `src/i18n/request.ts`: load messages từ `src/messages/{locale}.json`.

### 5.2 Cây provider (`app/InnerLayout.tsx`)

Thứ tự bọc:

```
<Suspense>
  <NextThemesProvider defaultTheme="dark" storageKey="aov-theme">
    <HeroUIProvider>
      <ReduxProvider>
        <SwrProvider>
          <ConditionalNavbar>{children}</ConditionalNavbar>
          <ToastProvider />
        </SwrProvider>
      </ReduxProvider>
    </HeroUIProvider>
  </NextThemesProvider>
</Suspense>
```

`app/layout.tsx` là Server Component; `InnerLayout.tsx` là client boundary chứa toàn bộ provider.

### 5.3 Ranh giới client/server

- **Mặc định Server Component.**
- Thêm `"use client"` chỉ ở ranh giới nhỏ nhất cần browser API / state / effect / event handler.
- Các trang tương tác hiện tại (`dashboard`, `draft`, `draft-input`, `meta`, `page.tsx`) đều là client component vì dùng state/hook.

### 5.4 Dữ liệu AOV tĩnh

- `src/modules/aov/loadAovData.ts` fetch 3 thứ: `manifest.json`, `data/index.json`, các file `matches/<id>.json`.
- `src/modules/aov/useAovData.ts` dùng SWR với key cố định `"aov-static-data"` để chỉ tải 1 lần cho cả app.
- Kiểu dữ liệu AOV: `src/modules/types/entities/aov.ts` (không kế thừa `AbstractEntity`, `id` là chuỗi có nghĩa).

### 5.5 State & API

- **Redux Toolkit**: `src/redux/store.ts` với `tabs` và `user` slices. `serializableCheck: false`.
- **SWR**: dùng cho data fetching + cache; config tập trung ở `SwrProvider`.
- **Apollo Client**: `src/modules/api/graphql/clients/client.ts` với retry/auth/error/timeout/http links.
- **REST**: `src/modules/api/` còn infrastructure; base URL mặc định `http://localhost:3001/api/v1` từ `publicEnv()`.
- **Env**: luôn đọc qua `publicEnv()` / `internalEnv()` trong `src/resources/env/`, đừng rải `process.env` khắp nơi.

---

## 6. Code style guidelines

- **Indent:** 4 spaces.
- **Quotes:** double quotes cho string.
- **Semicolons:** hầu như không dùng `;` cuối câu (ASI).
- **JSDoc:** comment `/** */` cho mọi field interface, hook/util công khai, action redux.
- **Array type:** dùng `Array<T>` thay vì `T[]` ở type dùng chung.
- **Imports:** `import type { ... }` cho import chỉ-type.
- **Shape object:** `interface`; union/alias: `type`.
- **Imports order:** external packages → `@/` → relative.
- **Barrel exports:** tái xuất public surface của folder qua `index.ts`.

### Styling

- Tailwind v4 cho layout/spacing/typography/responsive.
- `cn()` từ `@/lib/utils` để gộp class có điều kiện.
- HeroUI theme ở `app/hero.ts`: primary `#1392ec`, secondary `#0ea5e9`.
- Mặc định theme `dark` (`storageKey="aov-theme"`), nhưng vẫn hỗ trợ light.

### Hai hệ component cùng tồn tại

| Hệ | Vị trí | Dùng khi |
|----|--------|----------|
| HeroUI wrappers | `src/components/atomic/Aov*` | Feature dựa trên HeroUI |
| shadcn/ui | `src/components/ui/*` | Feature dựng bằng shadcn/radix |

**Giữ nhất quán trong một feature** — đừng trộn hai hệ trong cùng một màn hình.

---

## 7. Development conventions

### Routing

- Giữ route file mỏng — UI lớn đẩy vào `src/features/` hoặc `src/components/`.
- Thêm route mới dưới `app/[locale]/`.
- Nếu route cần ẩn navbar, cập nhật `src/components/ConditionalNavbar.tsx`.

### Components

- Mỗi component = một folder; file chính `index.tsx`; named export `Aov<Name>` cho HeroUI wrappers.
- Props: type `Props` hoặc `{Component}Props` trong cùng file, hoặc `types.ts` nếu lớn.
- Không inline nested object type trong props — tách interface con.

### State

- Redux cho state thật sự toàn cục (user, tabs).
- React state cho state cục bộ.
- SWR cho remote/static data cache.

### i18n

- Không hard-code text hiển thị.
- Thêm key vào **cả hai** `src/messages/en.json` và `src/messages/vi.json`.
- Dùng thuật ngữ Liên Quân chuẩn trong tiếng Việt.

### Dependencies

- Đừng thêm dependency mới nếu không thật cần. Stack đã khá đầy đủ.
- Nếu cần thêm, cân nhắc bundle size vì đây là FE-only app.

---

## 8. Testing strategy

- Hiện tại project **không có test framework**.
- Quy trình kiểm thử thực tế:
  1. `npm run lint` — phải pass.
  2. `npm run build` — phải pass.
  3. Chạy `npm run dev` và kiểm tra UI trên http://localhost:3000.
  4. Kiểm tra cả theme light/dark.
  5. Kiểm tra routing `/vi/dashboard`, `/en/dashboard`, `/draft`, `/draft-input`, `/meta`.

---

## 9. Deployment process

### Docker build

`Dockerfile` multi-stage cho Next.js 16 standalone:

```dockerfile
# Build args (NEXT_PUBLIC_* được inline at build time)
NEXT_PUBLIC_API_GRAPHQL_BASE_URL
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_KEYCLOAK_URL
NEXT_PUBLIC_KEYCLOAK_REALM
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
NEXT_PUBLIC_KEYCLOAK_SECRET
NEXT_PUBLIC_TENANT_ID
```

Runtime:

```bash
node server.js   # standalone server, port 3000
```

### CI/CD

`.github/workflows/deploy.yml`:

- Trigger: push `main` hoặc `workflow_dispatch`.
- Runner: self-hosted `tedo-vps`.
- Steps:
  1. Checkout.
  2. Docker login.
  3. Source env file `/var/www/tedo-Front-End/.env`.
  4. `docker build` với các build-arg trên.
  5. Push image `sha-<hash>` và `latest`.
  6. `k3s kubectl set image` deployment `tedo-frontend` trong namespace `tedo`.
  7. Wait rollout với timeout 180s.

### Env production

Các biến `NEXT_PUBLIC_*` được đọc tại build time và inline vào bundle. Thay đổi env yêu cầu build + deploy lại.

---

## 10. Security considerations

- **FE-only cho draft:** không có server riêng xử lý dữ liệu nhạy cảm; không cần auth cho phần draft.
- **Keycloak (hạ tầng cũ):** nếu bật lại auth, đảm bảo client public + PKCE, redirect URI khớp, token refresh an toàn.
- **Env:** `NEXT_PUBLIC_*` expose ra browser. Không đặt secret thuần server dưới dạng `NEXT_PUBLIC_`.
- **Images:** `next.config.ts` cho phép mọi hostname (`**`) để tránh lỗi unconfigured host trong dev. Cân nhắc thu hẹp khi production ổn định.
- **CORS:** khi gọi API khác origin, đảm bảo backend CORS cho phép origin SPA và header `Authorization`.
- **Input validation:** script `merge.mjs` validate JSON nhập vào trước khi ghi đĩa; trang `draft-input` cũng nên validate ở client.

---

## 11. Dữ liệu & scripts

### `hero-urls.json`

Danh sách `{ name, url }` dùng để tải ảnh tướng. Chạy:

```bash
node scripts/download-heroes.mjs
```

Output: `public/images/heroes/<slug>.jpg|png` + `public/images/heroes/manifest.json`.

### `public/data/`

- `index.json`: `{ matches: ["2024-s1", "2024-s2", ...] }`.
- `matches/<season>.json`: mảng `Series` theo schema `src/modules/types/entities/aov.ts`.

### `scripts/merge.mjs`

Gộp JSON export từ `/draft-input` vào `public/data/`:

```bash
node scripts/merge.mjs <export.json> --season <season-id> [--force]
```

Validate: đủ 8 cấm + 10 chọn, không trùng tướng, có lane cho pick, hero_id tồn tại trong manifest.

---

## 12. Tài liệu tham khảo trong repo

- `.claude/design/01-product-overview.md` — định vị sản phẩm, kiến trúc FE-only.
- `.claude/design/02-draft-format.md` — luật cấm/chọn chính thức.
- `.claude/design/03-data-model.md` — JSON schema, tổ chức file dữ liệu.
- `.claude/design/04-features.md` — đặc tả tính năng (Simulator, Dashboard, Assist, Matchup, Report).
- `.claude/design/05-statistics.md` — cỡ mẫu nhỏ, làm mượt Bayes, Wilson interval.
- `.claude/design/06-roadmap-kpi.md` — roadmap + KPI.
- `.claude/pattern/01-architecture.md` — stack, bản đồ thư mục, cây provider.
- `.claude/pattern/02-singleton-hooks.md` — pattern singleton hook (nếu tái bật auth).
- `.claude/pattern/03-components-styling.md` — hai hệ component, styling, theme.
- `.claude/pattern/04-state-data-api.md` — Redux, SWR, Apollo GraphQL, REST, env.
- `.claude/pattern/05-types-conventions.md` — entities, code style, JSDoc, imports.
- `.claude/pattern/06-app-router-i18n.md` — App Router, `[locale]`, next-intl.
- `doc/KEYCLOAK-FE-API-DEPLOY.md` — luồng OIDC/Keycloak/Nest từ nền tảng cũ (tham khảo khi cần bật lại auth).
- `.cursor/rules/starci-academy-fe.mdc` — **rule cũ, một phần đã lỗi thời** (vd nói `src/app`, thực tế route ở `app/`). Khi mâu thuẫn, tin vào `.claude/pattern/*` và source thực tế.

---

## 13. Checklist trước khi commit

- [ ] `npm run lint` pass.
- [ ] `npm run build` pass.
- [ ] Không hard-code text mới (thêm vào cả `en.json` và `vi.json`).
- [ ] Không trộn HeroUI (`Aov*`) và shadcn (`ui/*`) trong cùng một màn hình mới.
- [ ] Đặt `"use client"` ở ranh giới nhỏ nhất.
- [ ] Cập nhật `AGENTS.md` / `.claude/pattern/` nếu thay đổi quy ước chung.

---

*File này được tổng hợp từ source thực tế của repo. Nếu cấu trúc project thay đổi đáng kể, hãy cập nhật lại AGENTS.md.*
