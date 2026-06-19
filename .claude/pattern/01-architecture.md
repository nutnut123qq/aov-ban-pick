# 01 — Kiến trúc & bản đồ thư mục

## Stack

| Lớp | Công nghệ |
|-----|-----------|
| Framework | **Next.js 16** (App Router), **React 19** |
| Ngôn ngữ | **TypeScript 5** (`strict: true`) |
| Styling | **Tailwind CSS v4** + **HeroUI** (`@heroui/react`) + **shadcn/ui** (radix) |
| Theme | `next-themes` (mặc định `dark`), HeroUI theme ở `app/hero.ts` |
| i18n | `next-intl` — locale `en`/`vi`, mặc định `vi` |
| Global state | **Redux Toolkit** (`@reduxjs/toolkit` + `react-redux`) |
| Data fetching | **SWR** + **Apollo Client** (GraphQL) + `fetch`/axios (REST) |
| Auth | **Keycloak** (`keycloak-js`) |
| Forms | **Formik** + **Yup** |
| Animation | **framer-motion** |
| Icons | **lucide-react** + **@phosphor-icons/react** |
| Số liệu/thống kê | **simple-statistics** + **decimal.js** + **numeral** |
| Khác | `dayjs`, `superjson`, `swiper`, `cmdk` |

## Bản đồ thư mục

```
app/                      # App Router — ROUTES nằm ở đây (KHÔNG phải src/app)
  layout.tsx              # root layout: fonts, metadata, NextIntlClientProvider → InnerLayout
  InnerLayout.tsx         # "use client" — cây provider (xem dưới)
  hero.ts                 # HeroUI theme (primary/secondary palette)
  globals.css
  [locale]/               # mọi route public lồng dưới locale
    page.tsx  dashboard/  auth/login/  profile/  settings/  notifications/

src/
  components/
    atomic/AovX/          # wrapper mỏng quanh HeroUI (forwardRef) — xem pattern/03
    ui/                   # shadcn/ui (radix) — xem pattern/03
    layouts/  modals/  providers/  svg/
    ConditionalNavbar.tsx
  hooks/
    singleton/            # pattern singleton hook — xem pattern/02
    effects/  useAuthToken.ts  useLocale.ts  ...
  modules/
    api/                  # graphql (Apollo) + rest (fetch) — xem pattern/04
    types/                # entities + enums dùng chung — xem pattern/05
    utils/                # computations/ (decimal.js), regression.ts, format, ...
    keycloak/  dayjs/  toast/  superjson/
  redux/                  # store, slices, ReduxProvider — xem pattern/04
  resources/env/          # publicEnv() / internalEnv()
  services/auth/          # loginWithKeycloak, refreshTokens, storage
  i18n/                   # routing, request, navigation (next-intl)
  messages/{en,vi}.json   # chuỗi UI
  lib/utils.ts            # cn() = twMerge(clsx(...))
```

Path alias: **`@/*` → `src/*`** (xem `tsconfig.json`). Route files ở `app/` import từ `@/...`.

## Cây provider (app/InnerLayout.tsx)

Thứ tự bọc — nhớ thứ tự này khi thêm provider mới:

```
<Suspense>
  <NextThemesProvider defaultTheme="dark" storageKey="aov-theme">
    <HeroUIProvider>
      <ReduxProvider>
        <SwrProvider>
          <SingletonHookProvider>     {/* gom các singleton hook — xem pattern/02 */}
            <UseEffects />            {/* side-effects toàn cục (sync auth, sync redux user) */}
            <ConditionalNavbar>{children}</ConditionalNavbar>
            <ModalContainer />
          </SingletonHookProvider>
          <ToastProvider />           {/* @heroui/react */}
        </SwrProvider>
      </ReduxProvider>
    </HeroUIProvider>
  </NextThemesProvider>
</Suspense>
```

`app/layout.tsx` (Server Component) chỉ lo `<html>`, fonts (Geist + Figtree), `metadata`, và `NextIntlClientProvider`; toàn bộ phần "use client" nằm trong `InnerLayout`.

## Ranh giới client/server

- Mặc định **Server Component**. Thêm `"use client"` chỉ ở **ranh giới nhỏ nhất** cần browser API / state / effect / event handler / lib client-only.
- Đừng đánh `"use client"` cả cây — đẩy xuống subtree nhỏ nhất.
- Các trang tương tác hiện tại (dashboard, login…) đều là client component vì dùng hook auth/state.
