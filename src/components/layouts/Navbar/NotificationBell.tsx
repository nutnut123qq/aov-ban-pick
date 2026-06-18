"use client"

import React from "react"
import Link from "next/link"
import { Bell, CheckCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthToken } from "@/hooks"
import {
    listNotifications,
    getUnreadNotificationCount,
    markAllNotificationsRead,
    type NotificationItem,
} from "@/modules/api"
import { formatRelativeTime } from "@/modules/utils"

export const NotificationBell = () => {
    const { token, isAuthenticated } = useAuthToken()
    const [count, setCount] = React.useState(0)
    const [items, setItems] = React.useState<NotificationItem[]>([])
    const [open, setOpen] = React.useState(false)

    const refreshCount = React.useCallback(async () => {
        if (!token) return
        try {
            const res = await getUnreadNotificationCount({ token })
            setCount(res.count ?? 0)
        } catch {
            // silent — bell is non-critical
        }
    }, [token])

    React.useEffect(() => {
        if (!token) {
            setCount(0)
            return
        }
        refreshCount()
        const id = setInterval(refreshCount, 60_000)
        return () => clearInterval(id)
    }, [token, refreshCount])

    const loadRecent = React.useCallback(async () => {
        if (!token) return
        try {
            const res = await listNotifications({ token, page: 0, size: 8 })
            setItems(res.items)
        } catch {
            // silent
        }
    }, [token])

    const handleOpenChange = (next: boolean) => {
        setOpen(next)
        if (next) loadRecent()
    }

    const handleMarkAll = async () => {
        if (!token) return
        setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
        setCount(0)
        try {
            await markAllNotificationsRead({ token })
        } catch {
            // silent
        }
    }

    if (!isAuthenticated) return null

    return (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
                    aria-label="Thông báo"
                >
                    <Bell className="size-4" />
                    {count > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
                            {count > 99 ? "99+" : count}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <span className="text-sm font-semibold">Thông báo</span>
                    {count > 0 && (
                        <button
                            onClick={handleMarkAll}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Đọc tất cả
                        </button>
                    )}
                </div>

                <div className="max-h-80 overflow-auto">
                    {items.length === 0 ? (
                        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                            Không có thông báo
                        </div>
                    ) : (
                        items.map((n) => (
                            <Link
                                key={n.id}
                                href="/notifications"
                                onClick={() => setOpen(false)}
                                className={`block px-3 py-2.5 border-b last:border-0 hover:bg-muted/50 transition-colors ${
                                    n.isRead ? "" : "bg-primary/5"
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    {!n.isRead && (
                                        <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                                    )}
                                    <div className={n.isRead ? "pl-4" : ""}>
                                        <p className="text-sm font-medium line-clamp-1">
                                            {n.title}
                                        </p>
                                        {n.message && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {n.message}
                                            </p>
                                        )}
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {formatRelativeTime(n.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                <Link
                    href="/notifications"
                    onClick={() => setOpen(false)}
                    className="block text-center text-sm text-primary py-2.5 border-t hover:bg-muted/50 transition-colors"
                >
                    Xem tất cả
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
