"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    BookOpen,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    Award,
    PlayCircle,
    CalendarDays,
    Bell,
    ChevronRight,
    Clock,
    LogIn,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

import { useKeycloak } from "@/hooks/singleton"
import { useAuthToken } from "@/hooks"
import { loadMyTraining, type MergedEnrollment } from "@/features/training"
import {
    listCertificates,
    listCalendarEvents,
    listNotifications,
    type CalendarEvent,
    type NotificationItem,
} from "@/modules/api"
import { formatDate, formatDateTime, formatRelativeTime } from "@/modules/utils"

interface DashboardData {
    fullName: string | null
    enrollments: MergedEnrollment[]
    certificates: number
    events: CalendarEvent[]
    notifications: NotificationItem[]
}

const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    bg,
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string | number
    color: string
    bg: string
}) => (
    <Card>
        <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
            </div>
        </CardContent>
    </Card>
)

const MiniCourseRow = ({ e }: { e: MergedEnrollment }) => (
    <Link
        href={`/learn/${e.courseSlug}`}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
    >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <PlayCircle className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-1">{e.courseTitle}</p>
            <div className="flex items-center gap-2 mt-1">
                <Progress value={e.progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground shrink-0">
                    {Math.round(e.progress)}%
                </span>
            </div>
        </div>
        {e.dueDate && (
            <Badge
                variant="outline"
                className={`shrink-0 gap-1 ${
                    e.isOverdue ? "text-red-600 border-red-300" : ""
                }`}
            >
                <Clock className="w-3 h-3" />
                {formatDate(e.dueDate)}
            </Badge>
        )}
    </Link>
)

const DashboardPage = () => {
    const { token, isLoading: authLoading, login } = useAuthToken()
    const { profile } = useKeycloak()
    const [data, setData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        let cancelled = false
        const run = async () => {
            setIsLoading(true)
            try {
                const training = await loadMyTraining(token)
                const [certs, events, notis] = await Promise.all([
                    training.userId
                        ? listCertificates({ token, userId: training.userId }).catch(() => [])
                        : Promise.resolve([]),
                    listCalendarEvents({ token }).catch(() => []),
                    listNotifications({ token, page: 0, size: 5 })
                        .then((r) => r.items)
                        .catch(() => []),
                ])
                if (cancelled) return
                setData({
                    fullName: training.fullName,
                    enrollments: training.enrollments,
                    certificates: certs.length,
                    events,
                    notifications: notis,
                })
            } catch (err) {
                console.error("Error loading dashboard:", err)
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }
        run()
        return () => {
            cancelled = true
        }
    }, [token])

    if (!token && !authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <Card className="max-w-sm w-full text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Đăng nhập để xem bảng điều khiển học tập của bạn.
                    </p>
                    <Button onClick={() => login()} className="gap-2">
                        <LogIn className="w-4 h-4" />
                        Đăng nhập
                    </Button>
                </Card>
            </div>
        )
    }

    const enrollments = data?.enrollments ?? []
    const inProgress = enrollments.filter(
        (e) => e.status === "ENROLLED" && e.progress < 100,
    )
    const completed = enrollments.filter((e) => e.status === "COMPLETED")
    const assignedDue = enrollments
        .filter((e) => e.isAssigned && e.status !== "COMPLETED")
        .sort((a, b) => {
            if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1
            if (!a.dueDate) return 1
            if (!b.dueDate) return -1
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
    const overdueCount = enrollments.filter(
        (e) => e.isOverdue && e.status !== "COMPLETED",
    ).length
    const avgProgress =
        enrollments.length > 0
            ? Math.round(
                enrollments.reduce((acc, e) => acc + e.progress, 0) /
                      enrollments.length,
            )
            : 0
    const upcomingEvents = (data?.events ?? [])
        .filter((ev) => new Date(ev.endAt).getTime() >= Date.now())
        .slice(0, 3)

    const greeting = data?.fullName || profile?.displayName || "bạn"

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-5xl px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6"
                >
                    <h1 className="text-2xl font-bold mb-1">Xin chào, {greeting} 👋</h1>
                    <p className="text-sm text-muted-foreground">
                        Tổng quan hành trình học tập của bạn
                    </p>
                </motion.div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
                        ))
                    ) : (
                        <>
                            <StatCard
                                icon={BookOpen}
                                label="Đang học"
                                value={inProgress.length}
                                color="text-blue-500"
                                bg="bg-blue-500/10"
                            />
                            <StatCard
                                icon={CheckCircle2}
                                label="Hoàn thành"
                                value={completed.length}
                                color="text-emerald-500"
                                bg="bg-emerald-500/10"
                            />
                            <StatCard
                                icon={AlertTriangle}
                                label="Quá hạn"
                                value={overdueCount}
                                color="text-red-500"
                                bg="bg-red-500/10"
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="Tiến độ TB"
                                value={`${avgProgress}%`}
                                color="text-amber-500"
                                bg="bg-amber-500/10"
                            />
                            <StatCard
                                icon={Award}
                                label="Chứng chỉ"
                                value={data?.certificates ?? 0}
                                color="text-primary"
                                bg="bg-primary/10"
                            />
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Cần hoàn thành sớm */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    Cần hoàn thành sớm
                                </CardTitle>
                                <Button asChild variant="ghost" size="sm" className="gap-1">
                                    <Link href="/assigned">
                                        Tất cả <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {isLoading ? (
                                    <div className="space-y-2">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <Skeleton key={i} className="h-14 w-full rounded-lg" />
                                        ))}
                                    </div>
                                ) : assignedDue.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-6 text-center">
                                        Không có khóa được giao nào cần làm. 🎉
                                    </p>
                                ) : (
                                    <div className="space-y-1">
                                        {assignedDue.slice(0, 4).map((e) => (
                                            <MiniCourseRow key={e.id} e={e} />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tiếp tục học */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <PlayCircle className="w-4 h-4 text-blue-500" />
                                    Tiếp tục học
                                </CardTitle>
                                <Button asChild variant="ghost" size="sm" className="gap-1">
                                    <Link href="/my-learning">
                                        Tất cả <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {isLoading ? (
                                    <div className="space-y-2">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <Skeleton key={i} className="h-14 w-full rounded-lg" />
                                        ))}
                                    </div>
                                ) : inProgress.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-6 text-center">
                                        Chưa có khóa đang học.{" "}
                                        <Link href="/courses" className="text-primary hover:underline">
                                            Khám phá khóa học
                                        </Link>
                                    </p>
                                ) : (
                                    <div className="space-y-1">
                                        {inProgress.slice(0, 4).map((e) => (
                                            <MiniCourseRow key={e.id} e={e} />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side column */}
                    <div className="space-y-6">
                        {/* Sự kiện sắp tới */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-primary" />
                                    Sự kiện sắp tới
                                </CardTitle>
                                <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                                    <Link href="/calendar">
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {isLoading ? (
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                ) : upcomingEvents.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                        Không có sự kiện sắp tới
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {upcomingEvents.map((ev) => (
                                            <div key={ev.id} className="text-sm">
                                                <p className="font-medium line-clamp-1">{ev.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateTime(ev.startAt)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Thông báo gần đây */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-primary" />
                                    Thông báo
                                </CardTitle>
                                <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                                    <Link href="/notifications">
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {isLoading ? (
                                    <Skeleton className="h-16 w-full rounded-lg" />
                                ) : (data?.notifications.length ?? 0) === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">
                                        Không có thông báo
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {data?.notifications.map((n) => (
                                            <div key={n.id} className="text-sm">
                                                <p
                                                    className={`line-clamp-1 ${
                                                        n.isRead ? "" : "font-medium"
                                                    }`}
                                                >
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatRelativeTime(n.createdAt)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
