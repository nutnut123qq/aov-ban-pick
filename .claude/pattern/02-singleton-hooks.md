# 02 — Pattern Singleton Hook

Đây là pattern **đặc trưng nhất** của repo. Dùng khi một hook cần **chạy đúng một lần cho cả app** (vd init Keycloak, một instance Formik dùng chung, một SWR subscription) rồi chia sẻ kết quả xuống mọi nơi qua Context.

## Cấu trúc thư mục (mỗi "domain" một folder)

```
src/hooks/singleton/<domain>/
  core/                  # LOGIC THẬT — hook gốc, chạy 1 lần trong Provider
    useXxx.ts            #   export const useXxxCore = () => { ... }
    index.ts
  impls/                 # ACCESSOR mỏng — chỉ useContext rồi trả ra
    useXxx.ts            #   export const useXxx = () => useContext(XxxContext)!.xxx
    index.ts
  <Domain>Context.tsx    # createContext + Provider gọi các *Core() đúng 1 lần
  index.ts               # export * from "./impls" + "./<Domain>Context"
```

Các domain hiện có: `keycloak/`, `formik/`, `swr/`, `discloresure/` (disclosure modal state).

## Ba mảnh ghép

### 1. Core hook — logic thật, đặt trong `core/`

```ts
// formik/core/useSignInFormik.ts
export const useSignInFormikCore = () =>
    useFormik<SignInFormikValues>({ initialValues, validationSchema, onSubmit })
```

```ts
// keycloak/core/useKeycloak.ts — dùng SWR để chỉ fetch 1 lần cho cả app lifecycle
export const useKeycloakCore = () =>
    useSWR("KEYCLOAK_SWR", async () => { /* createKeycloak().init(...) */ },
        { revalidateOnFocus: false, revalidateOnReconnect: false })
```

### 2. Context + Provider — gọi `*Core()` đúng MỘT lần

```tsx
// formik/FormikContext.tsx
export interface FormikContextType {
    signInFormik: ReturnType<typeof useSignInFormikCore>
    signUpFormik: ReturnType<typeof useSignUpFormikCore>
}
export const FormikContext = createContext<FormikContextType | null>(null)

export const FormikProvider = ({ children }: PropsWithChildren) => {
    const signInFormik = useSignInFormikCore()
    const signUpFormik = useSignUpFormikCore()
    const value = useMemo(() => ({ signInFormik, signUpFormik }), [signInFormik, signUpFormik])
    return <FormikContext.Provider value={value}>{children}</FormikContext.Provider>
}
```

### 3. Impl accessor — mỏng, đặt trong `impls/`

```ts
// formik/impls/useSignInFormik.ts
export const useSignInFormik = () => {
    const { signInFormik } = useContext(FormikContext)!
    return signInFormik
}
```

## Lắp ráp

Mọi Provider gom trong [`SingletonHookProvider`](../../src/hooks/singleton/SingletonHookProvider.tsx) và bọc trong `InnerLayout`:

```tsx
<DiscloresureProvider>
  <KeycloakProvider>
    <SwrProvider>
      <FormikProvider>{children}</FormikProvider>
    </SwrProvider>
  </KeycloakProvider>
</DiscloresureProvider>
```

## Quy tắc khi thêm domain mới

1. Viết logic ở `core/useXxx.ts` → `useXxxCore`.
2. Thêm field vào `<Domain>Context.tsx` (type = `ReturnType<typeof useXxxCore>`), gọi 1 lần trong Provider, `useMemo` cho value.
3. Viết accessor `impls/useXxx.ts` chỉ `useContext(...)!`.
4. Re-export qua các `index.ts`; thêm Provider vào `SingletonHookProvider` đúng thứ tự phụ thuộc.
5. **Component khác luôn import từ `impls` (qua `@/hooks/singleton`), không gọi `*Core` trực tiếp.** Gọi Core ở nhiều nơi = phá tính singleton.

> Lưu ý chính tả trong codebase: folder tên `discloresure` (sai chính tả của "disclosure") — giữ nguyên để khớp import hiện có.
