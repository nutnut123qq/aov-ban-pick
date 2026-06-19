# 03 — Components & Styling

## ⚠️ Hai hệ component cùng tồn tại

Repo có **hai** bộ component primitive. Biết khi nào dùng cái nào, và **giữ nhất quán trong một feature**:

| Hệ | Vị trí | Là gì | Dùng khi |
|----|--------|-------|----------|
| **HeroUI wrappers** | `src/components/atomic/Aov*` | Wrapper `forwardRef` mỏng quanh `@heroui/react` | Feature dựa trên HeroUI; controls có sẵn trong bộ Aov* |
| **shadcn/ui** | `src/components/ui/*` | Component radix-based (button, card, dialog, command…) | Feature dựng bằng shadcn (vd dashboard hiện tại dùng `ui/button`, `ui/card`) |

> Đây là hệ quả của giai đoạn chuyển đổi. **Đừng trộn hai hệ trong cùng một màn hình** trừ khi có lý do rõ. Khi mở rộng một feature, theo hệ mà feature đó đang dùng.

### Atomic wrapper (`Aov*`) — pattern

```tsx
// src/components/atomic/AovButton/index.tsx
"use client"
import { Button, ButtonProps } from "@heroui/react"
import React, { forwardRef } from "react"

export const AovButton = forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => <Button {...props} ref={ref} />
)
AovButton.displayName = "AovButton"
```

- Một folder = một component, file `index.tsx`, **named export** `Aov<Name>`.
- Tái xuất tất cả qua [`src/components/atomic/index.ts`](../../src/components/atomic/index.ts).
- Wrapper hiện tại chủ yếu pass-through `props` + `ref` — đây là điểm để chèn default/variant chung sau này.

## Styling

- **Tailwind v4** cho layout/spacing/typography/responsive.
- **`cn()`** từ [`@/lib/utils`](../../src/lib/utils.ts) = `twMerge(clsx(...))` để gộp class có điều kiện.
- **HeroUI primitives** cho controls tương tác khi dùng hệ Aov*.
- shadcn dùng token CSS (`bg-primary`, `text-muted-foreground`, …) — giữ token, đừng hard-code màu một lần.
- **Theme HeroUI** ở [`app/hero.ts`](../../app/hero.ts): palette `primary` (#1392ec) + `secondary` (#0ea5e9), có biến thể light/dark. Đổi màu hệ thống ở đây, đừng rải hex.
- **next-themes**: mặc định `dark`, `storageKey="aov-theme"`. Có cả light & dark — test cả hai.

## Quy ước component

- **One concern per folder** (`layouts/Navbar/`, `modals/AuthenticationModal/`, `providers/`).
- Folder là "package" thì tái xuất qua `index.ts` (theo pattern `layouts`, `providers`, `atomic`, `modals`).
- Props: một type `Props` hoặc `{Component}Props` trong cùng file (hoặc `types.ts` nếu lớn). **Không inline nested object type** trong props — tách interface con.
- Default export cho component page-level/layout trong `app/`; trong `components/` named hay default đều được nhưng **nhất quán trong một folder**.

## Icons & motion

- Icons: import lẻ từ `lucide-react` hoặc `@phosphor-icons/react` (tree-shake). Cả hai đều xuất hiện trong repo.
- `framer-motion` chỉ ở nơi cần animation; đừng bọc cả vùng tĩnh lớn.

## A11y

- Ưu tiên HTML ngữ nghĩa (`main`, `nav`, `article`, heading theo thứ tự).
- Element tương tác phải reach được bằng bàn phím — dùng control HeroUI/shadcn/native thay cho `div` + `onClick`.
