# 06 — App Router & i18n

## App Router — `app/` (KHÔNG phải `src/app`)

Route nằm ở `app/` ở root repo. `tsconfig` alias `@/*` chỉ về `src/*`, nên route import logic từ `@/...`.

```
app/
  layout.tsx        # root: <html>, fonts, metadata
  InnerLayout.tsx   # "use client" — toàn bộ cây provider (xem 01-architecture)
  hero.ts           # HeroUI theme
  globals.css
  [locale]/
    layout.tsx      # validate locale, load messages, NextIntlClientProvider → InnerLayout
    page.tsx
    dashboard/page.tsx
    auth/login/page.tsx
    profile/page.tsx  settings/page.tsx  notifications/page.tsx
```

Quy ước:

- **`page.tsx`** — Server Component mặc định; thêm `"use client"` khi cần state/effect/event (các trang tương tác hiện tại đều client).
- **`layout.tsx`** — chỉ shell + compose provider; phần client đẩy vào `InnerLayout`.
- **Colocate** `loading.tsx`/`error.tsx` cạnh route khi chỉ dùng ở đó.
- **Dynamic route** — tên param mô tả (`[id]`, `[slug]`); type `params`/`searchParams` theo type của Next.
- **Giữ route file mỏng** — UI lớn đẩy vào `src/components/` hoặc `src/features/` rồi import.

> ⚠️ **Next.js 16:** signature của `params`/`searchParams`, caching, và API server có thể khác training data. Đọc `node_modules/next/dist/docs/` trước khi viết (xem [AGENTS.md](../../AGENTS.md)).

## i18n — next-intl

```
src/i18n/
  routing.ts      # defineRouting: locales ["en","vi"], defaultLocale "vi"
  request.ts  navigation.ts  index.ts
src/messages/
  en.json  vi.json
proxy.ts          # next-intl middleware (locale routing); Next.js 16 đổi tên từ middleware.ts
```

- **Locale:** `en` và `vi`, **mặc định `vi`** ([`routing.ts`](../../src/i18n/routing.ts)). Type `Locale = "en" | "vi"`.
- Mọi route public lồng dưới `app/[locale]/`.
- `app/[locale]/layout.tsx` là Server Component: validate locale, gọi `setRequestLocale(locale)`, load messages qua `getMessages()` và bọc `NextIntlClientProvider` → `InnerLayout`.
- `app/layout.tsx` chỉ chứa `<html>`/`<body>`, fonts và metadata; KHÔNG bọc `NextIntlClientProvider` ở đây.
- **Chuỗi UI lấy từ `src/messages/{en,vi}.json`** — đừng hard-code text hiển thị; thêm key vào **cả hai** file. Domain Liên Quân nhiều thuật ngữ tiếng Việt (tên lane, vai trò) → giữ đúng thuật ngữ chính thức (xem [`../design/02-draft-format.md`](../design/02-draft-format.md)).
- Navigation/redirect dùng helper từ `src/i18n/navigation.ts` (locale-aware), không dùng `next/link` thô cho điều hướng cross-locale.
- `proxy.ts` thay thế `middleware.ts` từ Next.js 16; export hàm `proxy` và `config.matcher` tương tự.

## Navbar có điều kiện

`src/components/ConditionalNavbar.tsx` quyết định có hiện Navbar theo route (vd ẩn ở trang auth). Khi thêm route "chrome-less" (như Draft Simulator fullscreen), cập nhật ở đây.
