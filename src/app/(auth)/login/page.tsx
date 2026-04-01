"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useSignInFormik } from "@/hooks/singleton/formik"
import { useKeycloak } from "@/hooks/singleton"
import { useQueryUserSwrCore } from "@/hooks/singleton/swr/core/api/graphql/queries/useQueryUserSwr"
import { useAppDispatch } from "@/redux/hooks"
import { setAuthenticated, setUser } from "@/redux/slices"
import { TedoInput } from "@/components/ui/TedoInput"
import { TedoButton } from "@/components/ui/TedoButton"

const LoginPage = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const formik = useSignInFormik()
    const keycloak = useKeycloak()
    const userSwr = useQueryUserSwrCore()

    React.useEffect(
        () => {
            const userEntity = userSwr.data?.me.data?.data
            if (userEntity) {
                dispatch(setUser(userEntity))
                dispatch(setAuthenticated(true))
                router.push("/")
            }
        },
        [
            userSwr.data,
            dispatch,
            router,
        ]
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await formik.submitForm()
        if (keycloak.data) {
            await keycloak.data.login({
                loginHint: formik.values.email,
            })
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center">
            <section className="w-full max-w-md rounded-2xl border border-default-200 bg-content1/60 p-8 shadow-sm backdrop-blur">
                <header className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold">
                        Đăng nhập StarCI Academy
                    </h1>
                    <p className="mt-1 text-sm text-default-500">
                        Sử dụng tài khoản Keycloak được cấp để tiếp tục.
                    </p>
                </header>

                <form
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >
                    <div className="space-y-1.5">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium"
                        >
                            Email
                        </label>
                        <TedoInput
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className="text-xs text-red-500">
                                {formik.errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Mật khẩu
                        </label>
                        <TedoInput
                            id="password"
                            name="password"
                            type="password"
                            placeholder="********"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <p className="text-xs text-red-500">
                                {formik.errors.password}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="inline-flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formik.values.rememberMe}
                                onChange={formik.handleChange}
                                className="h-4 w-4 rounded border-default-300"
                            />
                            <span>Ghi nhớ đăng nhập</span>
                        </label>
                    </div>

                    <TedoButton
                        type="submit"
                        isDisabled={formik.isSubmitting || keycloak.isLoading}
                        className="w-full justify-center"
                    >
                        Đăng nhập
                    </TedoButton>
                </form>
            </section>
        </main>
    )
}

export default LoginPage

