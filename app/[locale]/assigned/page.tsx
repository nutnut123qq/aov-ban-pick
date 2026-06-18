"use client"
import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    ClipboardList,
    Clock,
    AlertTriangle,
    CheckCircle2,
    PlayCircle,
    LogIn,
    CalendarClock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useAuthToken } from "@/hooks"
import { loadMyTraining, type MergedEnrollment } from "@/features/training"
import { formatDate } from "@/modules/utils"

/** Days until due (negative = overdue). null when no due date. */
const daysUntil = (iso: string | null): number | null => {
    if (!iso) return null
    const ms = new Date(iso).getTime() - Date.now()
    return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

const DueBadge = ({ enrollment }: { enrollment: MergedEnrollment }) => {
    if (enrollment.status === "COMPLETED") {
        return (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Hoàn thành
            </Badge>
        )
    }
    if (!enrollment.dueDate) {
        return (
            <Badge variant="secondary" className="font-normal gap-1">
                <CalendarClock className="w-3 h-3" />
                Không thời hạn
            </Badge>
        )
    }
    const d = daysUntil(enrollment.dueDate)
    if (enrollment.isOverdue || (d !== null && d < 0)) {
        return (
            <Badge className="bg-red-500/10 text-red-600 border-0 gap-1">
                <AlertTriangle className="w-3 h-3" />
                Quá hạn {d !== null ? `${Math.abs(d)} ngày` : ""}
            </Badge>
        )
    }
    if (d !== null && d <= 3) {
        return (
            <Badge className="bg-amber-500/10 text-amber-600 border-0 gap-1">
                <Clock className="w-3 h-3" />
                Còn {d} ngày
            </Badge>
        )
    }
    return (
        <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            Hạn {formatDate(enrollment.dueDate)}
        </Badge>
    )
}

const AssignedCard = ({ enrollment }: { enrollment: MergedEnrollment }) => {
    const done = enrollment.status === "COMPLETED"
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card
                className={`overflow-hidden ${
                    enrollment.isOverdue && !done ? "border-red-300" : ""
                }`}
            >
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                            {enrollment.category && (
                                <span className="text-xs text-muted-foreground">
                                    {enrollment.category}
                                </span>
                            )}
                            <h3 className="font-semibold leading-snug line-clamp-2">
                                {enrollment.courseTitle}
                            </h3>
                        </div>
                        <DueBadge enrollment={enrollment} />
                    </div>

                    <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Tiến độ</span>
                            <span className="font-medium">
                                {Math.round(enrollment.progress)}%
                                {enrollment.lessonsTotal
                                    ? ` · ${enrollment.lessonsCompleted ?? 0}/${enrollment.lessonsTotal} bài`
                                    : ""}
                            </span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    <div className="flex justify-end">
                        {done ? (
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/courses/${enrollment.courseSlug}`}>
                                    Xem lại
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm" className="gap-1">
                                <Link href={`/learn/${enrollment.courseSlug}`}>
                                    <PlayCircle className="w-4 h-4" />
                                    {enrollment.progress > 0 ? "Tiếp tục" : "Bắt đầu"}
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

const AssignedPage = () => {
    const { token, isLoading: authLoading, login } = useAuthToken()
    const [items, setItems] = useState<MergedEnrollment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        let cancelled = false
        const run = async () => {
            setIsLoading(true)
            try {
                const { enrollments } = await loadMyTraining(token)
                if (!cancelled) setItems(enrollments.filter((e) => e.isAssigned))
            } catch (err) {
                console.error("Error loading assigned courses:", err)
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }
        run()
        return () => {
            cancelled = true
        }
    }, [token])

    const byDue = (a: MergedEnrollment, b: MergedEnrollment) => {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }

    const { todo, overdue, completed } = useMemo(() => {
        const sorted = [...items].sort(byDue)
        return {
            todo: sorted.filter((e) => e.status !== "COMPLETED" && !e.isOverdue),
            overdue: sorted.filter((e) => e.status !== "COMPLETED" && e.isOverdue),
            completed: sorted.filter((e) => e.status === "COMPLETED"),
        }
    }, [items])

    if (!token && !authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <Card className="max-w-sm w-full text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Đăng nhập để xem các khóa đào tạo được giao cho bạn.
                    </p>
                    <Button onClick={() => login()} className="gap-2">
                        <LogIn className="w-4 h-4" />
                        Đăng nhập
                    </Button>
                </Card>
            </div>
        )
    }

    const renderGrid = (list: MergedEnrollment[], emptyText: string) => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-44 w-full rounded-xl" />
                    ))}
                </div>
            )
        }
        if (list.length === 0) {
            return (
                <div className="text-center py-16">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{emptyText}</p>
                </div>
            )
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((e) => (
                    <AssignedCard key={e.id} enrollment={e} />
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-1">Đào tạo được giao</h1>
                    <p className="text-sm text-muted-foreground">
                        Các khóa học bắt buộc được phân công cho bạn
                    </p>
                </div>

                {!isLoading && overdue.length > 0 && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-300 bg-red-500/5 px-4 py-3 text-sm text-red-600">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Bạn có <strong>{overdue.length}</strong> khóa đã quá hạn cần hoàn thành.
                    </div>
                )}

                <Tabs defaultValue="todo">
                    <TabsList className="mb-4 bg-muted/50">
                        <TabsTrigger value="todo">Cần làm ({todo.length})</TabsTrigger>
                        <TabsTrigger value="overdue">Quá hạn ({overdue.length})</TabsTrigger>
                        <TabsTrigger value="completed">
                            Hoàn thành ({completed.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="todo">
                        {renderGrid(todo, "Không có khóa nào cần làm. Tốt lắm!")}
                    </TabsContent>
                    <TabsContent value="overdue">
                        {renderGrid(overdue, "Không có khóa nào quá hạn.")}
                    </TabsContent>
                    <TabsContent value="completed">
                        {renderGrid(completed, "Chưa hoàn thành khóa được giao nào.")}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default AssignedPage
