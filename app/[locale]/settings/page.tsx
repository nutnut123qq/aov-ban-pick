"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useLocale } from "@/hooks"
import { useRouter } from "@/i18n/navigation"
import {
    Sun,
    Moon,
    Globe,
    User,
    LogOut,
    Clock,
    Save,
    ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useKeycloak } from "@/hooks/singleton"
import { useAuthToken } from "@/hooks"
import { getMyProfile, upsertMyProfile } from "@/modules/api"
import { toastSuccess, toastError } from "@/modules/toast"

const timezones = [
    "Asia/Ho_Chi_Minh",
    "Asia/Bangkok",
    "Asia/Singapore",
    "Asia/Tokyo",
    "UTC",
]

const SettingRow = ({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description?: string
    children: React.ReactNode
}) => (
    <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
                <p className="text-sm font-medium">{title}</p>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
        </div>
        <div className="shrink-0">{children}</div>
    </div>
)

const SettingsPage = () => {
    const { token, isAuthenticated } = useAuthToken()
    const { logout } = useKeycloak()
    const locale = useLocale()
    const router = useRouter()

    const [isDark, setIsDark] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [timezone, setTimezone] = useState<string>("Asia/Ho_Chi_Minh")
    const [savedTimezone, setSavedTimezone] = useState<string>("Asia/Ho_Chi_Minh")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setMounted(true)
        setIsDark(document.documentElement.classList.contains("dark"))
    }, [])

    useEffect(() => {
        if (!token) return
        getMyProfile({ token })
            .then((p) => {
                if (p?.timezone) {
                    setTimezone(p.timezone)
                    setSavedTimezone(p.timezone)
                }
            })
            .catch(() => undefined)
    }, [token])

    const toggleTheme = (next: boolean) => {
        const root = document.documentElement
        if (next) {
            root.classList.add("dark")
            localStorage.theme = "dark"
        } else {
            root.classList.remove("dark")
            localStorage.theme = "light"
        }
        setIsDark(next)
    }

    const handleSaveTimezone = async () => {
        if (!token) return
        setIsSaving(true)
        try {
            await upsertMyProfile({
                token,
                input: { timezone, locale },
            })
            setSavedTimezone(timezone)
            toastSuccess("Đã lưu múi giờ.")
        } catch (err) {
            console.error("Error saving timezone:", err)
            toastError("Không lưu được múi giờ.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-2xl px-4 py-8">
                <h1 className="text-2xl font-bold mb-1">Cài đặt</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    Tùy chỉnh giao diện, ngôn ngữ và tài khoản của bạn
                </p>

                {/* Appearance */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-base">Giao diện</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <SettingRow
                            icon={isDark ? Moon : Sun}
                            title="Chế độ tối"
                            description="Bật giao diện nền tối"
                        >
                            {mounted && (
                                <Switch checked={isDark} onCheckedChange={toggleTheme} />
                            )}
                        </SettingRow>
                        <SettingRow
                            icon={Globe}
                            title="Ngôn ngữ hiển thị"
                            description="Ngôn ngữ giao diện ứng dụng"
                        >
                            <Select
                                value={locale}
                                onValueChange={(v) =>
                                    router.replace({ pathname: v as "vi" | "en" })
                                }
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </SettingRow>
                    </CardContent>
                </Card>

                {/* Regional (saved to profile) */}
                {isAuthenticated && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-base">Khu vực</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SettingRow
                                icon={Clock}
                                title="Múi giờ"
                                description="Dùng để hiển thị lịch và sự kiện"
                            >
                                <Select value={timezone} onValueChange={setTimezone}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timezones.map((tz) => (
                                            <SelectItem key={tz} value={tz}>
                                                {tz}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </SettingRow>
                            {timezone !== savedTimezone && (
                                <div className="flex justify-end pt-2">
                                    <Button
                                        size="sm"
                                        className="gap-1"
                                        onClick={handleSaveTimezone}
                                        disabled={isSaving}
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? "Đang lưu..." : "Lưu"}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Account */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Tài khoản</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <Link href="/profile">
                            <div className="flex items-center justify-between gap-4 py-3 hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors cursor-pointer">
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Hồ sơ cá nhân</p>
                                        <p className="text-xs text-muted-foreground">
                                            Chỉnh sửa thông tin hồ sơ của bạn
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </Link>
                        {isAuthenticated && (
                            <SettingRow
                                icon={LogOut}
                                title="Đăng xuất"
                                description="Thoát khỏi tài khoản hiện tại"
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => logout()}
                                >
                                    Đăng xuất
                                </Button>
                            </SettingRow>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default SettingsPage
