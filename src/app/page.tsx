import React from "react"
import Link from "next/link"

const HomePage = () => {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <h1 className="text-2xl font-semibold">
                    StarCI Academy Frontend
                </h1>
                <p className="text-default-500">
                    Go to the login page to start the Keycloak flow.
                </p>
                <Link
                    href="/login"
                    className="text-primary underline"
                >
                    Đến trang đăng nhập
                </Link>
            </div>
        </main>
    )
}

export default HomePage

