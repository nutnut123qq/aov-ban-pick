"use client"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    Users,
    TrendingUp,
    CheckCircle2,
    AlertTriangle,
    BookOpen,
    PlayCircle,
    LogIn,
    UserCog,
    Mail,
    Award,
    ClipboardCheck,
    Search,
    Download,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { useAuthToken } from "@/hooks"
import {
    getMyTeamReport,
    getLearnerProfile,
    type MyTeamReport,
    type LearnerRow,
    type LearnerProfile,
    type HealthStatus,
} from "@/modules/api"
import { formatDate } from "@/modules/utils"

/** Escapes a value for a CSV cell (wraps in quotes, doubles inner quotes). */
const csvCell = (v: string | number | null): string => {
    const s = v === null || v === undefined ? "" : String(v)
    return `"${s.replace(/"/g, '""')}"`
}

const healthLabels: Record<HealthStatus, string> = {
    on_track: "Đúng tiến độ",
    at_risk: "Cần chú ý",
    overdue: "Quá hạn",
}

/** Builds and downloads a CSV of the current team's learners (client-side, in-scope). */
const exportTeamCsv = (learners: LearnerRow[]) => {
    const headers = [
        "Họ tên",
        "Email",
        "Mã NV",
        "Phòng ban",
        "Ghi danh",
        "Hoàn thành",
        "Đang học",
        "Quá hạn",
        "Tiến độ TB (%)",
        "Trạng thái",
        "Hoạt động cuối",
    ]
    const rows = learners.map((l) =>
        [
            l.fullName,
            l.email ?? "",
            l.employeeCode ?? "",
            l.departmentName ?? "",
            l.enrollments,
            l.completed,
            l.inProgress,
            l.overdue,
            Math.round(l.avgProgress),
            healthLabels[l.healthStatus] ?? l.healthStatus,
            l.lastActivity ? new Date(l.lastActivity).toLocaleDateString("vi-VN") : "",
        ]
            .map(csvCell)
            .join(","),
    )
    // BOM so Excel detects UTF-8.
    const csv = "﻿" + [headers.map(csvCell).join(","), ...rows].join("\r\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "nhom-cua-toi.csv"
    a.click()
    URL.revokeObjectURL(url)
}

const healthConfig: Record<
    HealthStatus,
    { label: string; className: string }
> = {
    on_track: { label: "Đúng tiến độ", className: "bg-emerald-500/10 text-emerald-600" },
    at_risk: { label: "Cần chú ý", className: "bg-amber-500/10 text-amber-600" },
    overdue: { label: "Quá hạn", className: "bg-red-500/10 text-red-600" },
}

const SummaryCard = ({
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

const LearnerProfileDialog = ({
    userId,
    token,
    onClose,
}: {
    userId: string | null
    token: string
    onClose: () => void
}) => {
    const [profile, setProfile] = useState<LearnerProfile | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!userId) return
        let cancelled = false
        const run = async () => {
            setLoading(true)
            try {
                const p = await getLearnerProfile({ token, userId })
                if (!cancelled) setProfile(p)
            } catch (err) {
                console.error("Error loading learner profile:", err)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        run()
        return () => {
            cancelled = true
        }
    }, [userId, token])

    return (
        <Dialog open={!!userId} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Hồ sơ học viên</DialogTitle>
                </DialogHeader>
                {loading || !profile ? (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div>
                            <h3 className="font-semibold text-lg">{profile.user.fullName}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                                {profile.user.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5" />
                                        {profile.user.email}
                                    </span>
                                )}
                                {profile.user.employeeCode && (
                                    <Badge variant="secondary" className="font-normal">
                                        {profile.user.employeeCode}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-muted p-3 text-center">
                                <ClipboardCheck className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                                <div className="text-lg font-bold">{profile.quiz.attempts}</div>
                                <div className="text-xs text-muted-foreground">
                                    Quiz · TB {Math.round(profile.quiz.avgScore)}%
                                </div>
                            </div>
                            <div className="rounded-lg bg-muted p-3 text-center">
                                <Users className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                                <div className="text-lg font-bold">{profile.attendance.rate}%</div>
                                <div className="text-xs text-muted-foreground">
                                    Điểm danh {profile.attendance.present}/{profile.attendance.total}
                                </div>
                            </div>
                            <div className="rounded-lg bg-muted p-3 text-center">
                                <Award className="w-4 h-4 mx-auto mb-1 text-primary" />
                                <div className="text-lg font-bold">
                                    {profile.certificatesIssued}
                                </div>
                                <div className="text-xs text-muted-foreground">Chứng chỉ</div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">
                                Khóa học ({profile.enrollments.length})
                            </p>
                            <div className="space-y-2">
                                {profile.enrollments.map((e) => (
                                    <div
                                        key={e.id}
                                        className="flex items-center gap-3 rounded-lg border p-3"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-1">
                                                {e.courseTitle}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Progress
                                                    value={e.progressPercent}
                                                    className="h-1.5 flex-1"
                                                />
                                                <span className="text-xs text-muted-foreground shrink-0">
                                                    {Math.round(e.progressPercent)}%
                                                </span>
                                            </div>
                                        </div>
                                        {e.dueDate && (
                                            <Badge variant="outline" className="shrink-0 text-xs">
                                                Hạn {formatDate(e.dueDate)}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

const TeamPage = () => {
    const { token, isLoading: authLoading, login } = useAuthToken()
    const [report, setReport] = useState<MyTeamReport | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [tableSearch, setTableSearch] = useState("")
    const [sortKey, setSortKey] = useState<"name" | "progress" | "overdue">("name")
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

    useEffect(() => {
        if (!token) return
        let cancelled = false
        const run = async () => {
            setIsLoading(true)
            try {
                const r = await getMyTeamReport({ token })
                if (!cancelled) setReport(r)
            } catch (err) {
                console.error("Error loading team report:", err)
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
                        <UserCog className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Đăng nhập để xem tiến độ học tập của đội nhóm.
                    </p>
                    <Button onClick={() => login()} className="gap-2">
                        <LogIn className="w-4 h-4" />
                        Đăng nhập
                    </Button>
                </Card>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-5xl px-4 py-8 space-y-4">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-[72px] rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-72 w-full rounded-xl" />
            </div>
        )
    }

    if (!report?.isManager) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <UserCog className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">Bạn chưa quản lý nhóm nào</h2>
                    <p className="text-sm text-muted-foreground">
                        Trang này dành cho quản lý trực tiếp để theo dõi tiến độ học tập của
                        nhân viên. Nếu bạn cho rằng đây là nhầm lẫn, hãy liên hệ quản trị viên.
                    </p>
                </Card>
            </div>
        )
    }

    const s = report.summary
    const scopeNames = [
        ...report.scope.departments.map((d) => d.name),
        ...report.scope.teams.map((t) => t.name),
    ]

    const toggleSort = (key: "name" | "progress" | "overdue") => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"))
        } else {
            setSortKey(key)
            setSortDir(key === "name" ? "asc" : "desc")
        }
    }

    const term = tableSearch.trim().toLowerCase()
    const displayedLearners = report.learners
        .filter((l) =>
            !term ||
            l.fullName.toLowerCase().includes(term) ||
            (l.email ?? "").toLowerCase().includes(term) ||
            (l.departmentName ?? "").toLowerCase().includes(term),
        )
        .sort((a, b) => {
            const dir = sortDir === "asc" ? 1 : -1
            if (sortKey === "name") return a.fullName.localeCompare(b.fullName) * dir
            if (sortKey === "overdue") return (a.overdue - b.overdue) * dir
            return (a.avgProgress - b.avgProgress) * dir
        })

    const sortArrow = (key: "name" | "progress" | "overdue") =>
        sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : ""

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-5xl px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-start justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Nhóm của tôi</h1>
                        <p className="text-sm text-muted-foreground">
                            Theo dõi tiến độ học tập của{" "}
                            {scopeNames.length > 0 ? scopeNames.join(", ") : "đội nhóm"}
                        </p>
                    </div>
                    {report.learners.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 shrink-0"
                            onClick={() => exportTeamCsv(report.learners)}
                        >
                            <Download className="w-4 h-4" />
                            Xuất CSV
                        </Button>
                    )}
                </motion.div>

                {/* Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
                    <SummaryCard
                        icon={Users}
                        label="Học viên"
                        value={s.totalLearners}
                        color="text-primary"
                        bg="bg-primary/10"
                    />
                    <SummaryCard
                        icon={TrendingUp}
                        label="Tiến độ TB"
                        value={`${Math.round(s.avgProgress)}%`}
                        color="text-amber-500"
                        bg="bg-amber-500/10"
                    />
                    <SummaryCard
                        icon={BookOpen}
                        label="Ghi danh"
                        value={s.totalEnrollments}
                        color="text-blue-500"
                        bg="bg-blue-500/10"
                    />
                    <SummaryCard
                        icon={CheckCircle2}
                        label="Hoàn thành"
                        value={s.completed}
                        color="text-emerald-500"
                        bg="bg-emerald-500/10"
                    />
                    <SummaryCard
                        icon={PlayCircle}
                        label="Đang học"
                        value={s.inProgress}
                        color="text-blue-500"
                        bg="bg-blue-500/10"
                    />
                    <SummaryCard
                        icon={AlertTriangle}
                        label="Quá hạn"
                        value={s.overdue}
                        color="text-red-500"
                        bg="bg-red-500/10"
                    />
                </div>

                {/* Search */}
                {report.learners.length > 0 && (
                    <div className="relative mb-4 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={tableSearch}
                            onChange={(e) => setTableSearch(e.target.value)}
                            placeholder="Tìm học viên..."
                            className="pl-9"
                        />
                    </div>
                )}

                {/* Learner table */}
                <Card>
                    <CardContent className="p-0">
                        {report.learners.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-12">
                                Chưa có học viên nào trong phạm vi quản lý.
                            </p>
                        ) : displayedLearners.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-12">
                                Không tìm thấy học viên phù hợp.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th
                                                className="font-medium px-4 py-3 cursor-pointer select-none hover:text-foreground"
                                                onClick={() => toggleSort("name")}
                                            >
                                                Học viên{sortArrow("name")}
                                            </th>
                                            <th
                                                className="font-medium px-4 py-3 text-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => toggleSort("progress")}
                                            >
                                                Tiến độ{sortArrow("progress")}
                                            </th>
                                            <th
                                                className="font-medium px-4 py-3 text-center hidden sm:table-cell cursor-pointer select-none hover:text-foreground"
                                                onClick={() => toggleSort("overdue")}
                                            >
                                                HT / Đang / Trễ{sortArrow("overdue")}
                                            </th>
                                            <th className="font-medium px-4 py-3 text-center">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedLearners.map((l: LearnerRow) => {
                                            const health = healthConfig[l.healthStatus] ?? healthConfig.on_track
                                            return (
                                                <tr
                                                    key={l.userId}
                                                    className="border-b last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                                                    onClick={() => setSelectedUser(l.userId)}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{l.fullName}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {l.departmentName || l.email || l.employeeCode || ""}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <Progress
                                                                value={l.avgProgress}
                                                                className="h-1.5 w-16"
                                                            />
                                                            <span className="text-xs w-8">
                                                                {Math.round(l.avgProgress)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                                                        <span className="text-emerald-600">{l.completed}</span>
                                                        {" / "}
                                                        <span className="text-blue-600">{l.inProgress}</span>
                                                        {" / "}
                                                        <span className="text-red-600">{l.overdue}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge className={`border-0 ${health.className}`}>
                                                            {health.label}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {token && (
                <LearnerProfileDialog
                    userId={selectedUser}
                    token={token}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    )
}

export default TeamPage
