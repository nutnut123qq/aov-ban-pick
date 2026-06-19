# 04 — State, Data fetching & API

> Lưu ý phạm vi: phần **lõi draft** của sản phẩm là **FE-only / JSON tĩnh** (xem [`../design/01-product-overview.md`](../design/01-product-overview.md)) — load JSON từ `public/data/` và tính trong browser, **không** đi qua GraphQL/REST dưới đây. Hạ tầng API/auth bên dưới là từ nền tảng gốc, dùng cho auth/user nếu cần. Đừng biến tính năng draft thành phụ thuộc backend.

## Global state — Redux Toolkit

```
src/redux/
  store.ts          # configureStore (serializableCheck: false)
  slices/           # tabs.ts, user.ts — createSlice
  hooks.ts          # typed useAppDispatch / useAppSelector
  ReduxProvider.tsx
```

- Slice theo mẫu `createSlice` với JSDoc cho mọi field/action (xem [`slices/user.ts`](../../src/redux/slices/user.ts)).
- Export `RootState`, `AppDispatch`, `AppStore` từ `store.ts`.
- Đăng ký reducer mới trong `store.ts` và export action/slice từ `slices/index.ts`.
- Dùng global state cho thứ thật sự toàn cục (user, auth flag, tab). State cục bộ → React state.

## Data fetching — SWR

- Config SWR tập trung ở provider (`SwrProvider`), không lặp config ở mỗi hook.
- Hook bọc `useSWR` cho logic không tầm thường: **một hook một file**; nếu cần singleton (fetch 1 lần cho cả app) thì theo pattern ở [02-singleton-hooks.md](02-singleton-hooks.md) (vd `useKeycloakCore` dùng SWR key cố định `"KEYCLOAK_SWR"`).

## GraphQL — Apollo Client

`src/modules/api/graphql/` — link composition trong [`clients/client.ts`](../../src/modules/api/graphql/clients/client.ts):

- `createApolloClient(options)` lắp các link: `retry → [auth] → error → timeout → http`.
- Auth link tự chèn `Authorization: Bearer <token>` khi có token.
- Error link log tập trung GraphQL/protocol/network error; bắt `Unauthorized`/`UNAUTHENTICATED`.
- Sẵn các instance: `client`, `noCacheClient`, `noCacheCredentialClient`; helper `createApolloClientAndHeaders(token, headers)` cho call nhạy cảm (auth + credentials + no-cache).
- Queries/mutations đặt trong `graphql/queries/`, `graphql/mutations/`.

## REST — fetch wrapper

[`src/modules/api/rest/client.ts`](../../src/modules/api/rest/client.ts) — `restRequest<T>(path, options)`:

- Base = `publicEnv().api.http` (mặc định `/api/v1`).
- Tự chèn `X-Tenant-ID` + `Authorization` (khi có token); serialize JSON body.
- **Unwrap envelope** `{ success, message, data }` → trả thẳng `data`.
- **Retry 1 lần khi 401**: gọi `refreshAccessToken()` rồi thử lại.
- `RestPaginated<T>` = `{ items, meta: { page, size, total, totalPages } }`.

## Auth — Keycloak

- Init qua singleton `useKeycloak` ([02-singleton-hooks.md](02-singleton-hooks.md)); service ở `src/services/auth/` (`loginWithKeycloak`, `refreshTokens`, `authStorageService`).
- Hook tiện ích: `@/hooks` → `useAuthToken`, `useTokenRefresh`, `useKeycloakTokenSync`.
- User entity dựng từ token parsed (`src/modules/keycloak/userEntityFromTokenParsed.ts`), đẩy vào redux `user` slice qua effect `useSyncReduxUser`.

## Env

[`src/resources/env/public.ts`](../../src/resources/env/public.ts) — `publicEnv()` trả object cấu hình gom từ `process.env.NEXT_PUBLIC_*` (api urls, graphql retry/timeout, computation fraction digits, keycloak, tenant). `internal.ts` cho server-only.

- **Luôn đọc env qua `publicEnv()`/`internalEnv()`**, đừng rải `process.env` khắp nơi.
- Mỗi config có default hợp lý cho local dev.
