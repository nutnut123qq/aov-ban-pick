"use client"
import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    LogIn,
    Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    listNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    type NotificationItem,
} from "@/modules/api"
import { useAuthToken } from "@/hooks"
import { formatRelativeTime } from "@/modules/utils"

/** Maps a notification to its destination, if the linked entity is reachable. */
const notificationHref = (n: NotificationItem): string | null => {
    if (!n.entityType || !n.entityId) return null
    switch (n.entityType) {
        case "course":
            return `/courses/${n.entityId}`
        case "enrollment":
            return "/my-learning"
        case "certificate":
            return "/certificates"
        case "event":
            return "/calendar"
        default:
            return null
    }
}

const NotificationRow = ({
    item,
    onRead,
}: {
    item: NotificationItem
    onRead: (id: string) => void
}) => {
    const href = notificationHref(item)

    const body = (
        <div
            className={`flex items-start gap-3 p-4 transition-colors ${
                item.isRead ? "bg-background" : "bg-primary/5"
            } hover:bg-muted/50`}
        >
            <div
                className={`mt-1 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    item.isRead
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                }`}
            >
                <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                </div>
                {item.message && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {item.message}
                    </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(item.createdAt)}
                </p>
            </div>
            {!item.isRead && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    title="Đánh dấu đã đọc"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onRead(item.id)
                    }}
                >
                    <Check className="w-4 h-4" />
                </Button>
            )}
        </div>
    )

    return href ? (
        <Link href={href} onClick={() => !item.isRead && onRead(item.id)}>
            {body}
        </Link>
    ) : (
        body
    )
}

const NotificationsPage = () => {
    const { token, isLoading: authLoading, login } = useAuthToken()

    const [items, setItems] = useState<NotificationItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(false)
    const [onlyUnread, setOnlyUnread] = useState(false)
    const PAGE_SIZE = 20

    const fetchPage = useCallback(
        async (nextPage: number, unread: boolean, replace: boolean) => {
            if (!token) return
            try {
                const res = await listNotifications({
                    token,
                    page: nextPage,
                    size: PAGE_SIZE,
                    unread,
                })
                setItems((prev) =>
                    replace ? res.items : [...prev, ...res.items],
                )
                setHasMore(nextPage + 1 < res.meta.totalPages)
                setPage(nextPage)
            } catch (err) {
                console.error("Error loading notifications:", err)
            }
        },
        [token],
    )

    useEffect(() => {
        if (!token) return
        let active = true
        const run = async () => {
            setIsLoading(true)
            await fetchPage(0, onlyUnread, true)
            if (active) setIsLoading(false)
        }
        run()
        return () => {
            active = false
        }
    }, [token, onlyUnread, fetchPage])

    const handleLoadMore = async () => {
        setIsLoadingMore(true)
        await fetchPage(page + 1, onlyUnread, false)
        setIsLoadingMore(false)
    }

    const handleRead = async (id: string) => {
        setItems((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        )
        if (!token) return
        try {
            await markNotificationRead({ token, id })
        } catch (err) {
            console.error("Error marking notification read:", err)
        }
    }

    const handleMarkAll = async () => {
        setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
        if (!token) return
        try {
            await markAllNotificationsRead({ token })
            if (onlyUnread) fetchPage(0, true, true)
        } catch (err) {
            console.error("Error marking all read:", err)
        }
    }

    const hasUnread = items.some((n) => !n.isRead)

    if (!token && !authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <Card className="max-w-sm w-full text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Đăng nhập để xem thông báo của bạn.
                    </p>
                    <Button onClick={() => login()} className="gap-2">
                        <LogIn className="w-4 h-4" />
                        Đăng nhập
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-2xl px-4 py-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Thông báo</h1>
                        <p className="text-sm text-muted-foreground">
                            Cập nhật mới nhất về khóa học và hoạt động của bạn
                        </p>
                    </div>
                    {hasUnread && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 shrink-0"
                            onClick={handleMarkAll}
                        >
                            <CheckCheck className="w-4 h-4" />
                            Đọc tất cả
                        </Button>
                    )}
                </div>

                <Tabs
                    value={onlyUnread ? "unread" : "all"}
                    onValueChange={(v) => setOnlyUnread(v === "unread")}
                    className="mb-4"
                >
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="all">Tất cả</TabsTrigger>
                        <TabsTrigger value="unread">Chưa đọc</TabsTrigger>
                    </TabsList>
                </Tabs>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-xl" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <BellOff className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="font-semibold">
                            {onlyUnread ? "Không có thông báo chưa đọc" : "Chưa có thông báo"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Thông báo của bạn sẽ xuất hiện ở đây.
                        </p>
                    </motion.div>
                ) : (
                    <>
                        <Card className="overflow-hidden divide-y p-0">
                            {items.map((item) => (
                                <NotificationRow
                                    key={item.id}
                                    item={item}
                                    onRead={handleRead}
                                />
                            ))}
                        </Card>
                        {hasMore && (
                            <div className="flex justify-center mt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="gap-2"
                                >
                                    {isLoadingMore && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    Tải thêm
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default NotificationsPage
