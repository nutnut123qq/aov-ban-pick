# 05 — Types & Code conventions

## Code style (quan sát từ source — theo y hệt)

- **4 space** indent.
- **Double quotes** cho string.
- **Hầu như không dùng `;`** cuối câu (ASI).
- **JSDoc `/** */`** cho mọi field interface, hook/util công khai, action redux — repo này comment rất dày, mỗi field một dòng `/** ... */`. Giữ mật độ đó.
- `Array<T>` (không `T[]`) cho type ở file dùng chung.
- `import type { ... }` cho import chỉ-type.
- `interface` cho shape object; `type` cho union/alias.

## Types dùng chung — `src/modules/types/`

```
entities/
  abstract.ts    # AbstractEntity { id, createdAt, updatedAt }
  user.ts        # UserEntity extends AbstractEntity
  category.ts
  index.ts
enums/index.ts
index.ts         # barrel — import từ "@/modules/types"
```

- Mọi entity **kế thừa `AbstractEntity`** (`id`/`createdAt`/`updatedAt` là string).
- Comment field non-obvious. Vd:

```ts
export interface UserEntity extends AbstractEntity {
    /** The username of the user. */
    username: string
    /** The email of the user. */
    email: string | null
    /** The Keycloak ID of the user. */
    keycloakId: string
    ...
}
```

- Type cho **AOV domain** (heroes, patches, teams, players, series/match, draft_actions — xem [`../design/03-data-model.md`](../design/03-data-model.md)) khi thêm: đặt cùng chỗ `src/modules/types/entities/`, kế thừa pattern này, JSDoc đầy đủ. Lưu ý `id` domain AOV là **chuỗi có nghĩa**, không phải uuid.

## Imports

- Path alias **`@/`** → `src/` (`@/components/...`, `@/modules/...`, `@/hooks/...`).
- Thứ tự: external packages → `@/` → relative, gom theo nhóm logic.
- Tái xuất public surface của một folder qua `index.ts` (barrel) — theo pattern khắp repo (`components/atomic`, `modules/types`, `redux/slices`, `hooks/singleton/*`).

## Utils & tính toán

- `src/modules/utils/computations/` — phép số dùng `decimal.js` (amount, percentage, round, bps…). Dùng lại cho phần thống kê thay vì float thô.
- `src/modules/utils/regression.ts` — `getSafeLinearRegression` (đã chống cạnh: < 2 điểm, x trùng, NaN) trên `simple-statistics`. Mẫu tốt cho các hàm thống kê an toàn của draft.
- `format.ts`, `truncate.ts`, `sanitize.ts`, `misc.ts` — tiện ích chung.

## Comments (theo "spirit" của backend)

- Component: comment ngắn đầu file/trên export nếu hành vi non-obvious (client boundary, a11y note).
- Handler phức tạp: `//` giữa các bước chính (validate → call API → update state).
- Hook/util công khai: JSDoc với `@param` / `@returns`.

## ESLint

Phải pass: đọc `eslint.config.mjs` trước khi đổi style hàng loạt, chạy `npm run lint` và fix trước khi coi là xong.
