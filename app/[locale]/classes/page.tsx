"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    GraduationCap,
    CalendarClock,
    MapPin,
    Users,
    BookOpen,
    LogIn,
    Video,
    CheckCircle2,
    UserCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { useAuthToken } from "@/hooks"
import { loadMyTraining } from "@/features/training"
import {
    getClass,
    listClassSchedules,
    listClassMembers,
    getMyClassAttendance,
    selfCheckIn,
    type TrainingClass,
    type ClassSchedule,
    type ClassMember,
    type MyAttendanceSession,
} from "@/modules/api"
import { formatDateTime } from "@/modules/utils"
import { toastSuccess, toastError } from "@/modules/toast"

interface MyClassView {
    cls: TrainingClass
    schedules: ClassSchedule[]
    members: ClassMember[]
    attendance: MyAttendanceSession[]
    courses: { title: string; slug: string | null }[]
}

const initials = (name: string) =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

const isUpcoming = (iso: string) => new Date(iso).getTime() >= Date.now()

const ScheduleRow = ({ s }: { s: ClassSchedule }) => {
    const upcoming = isUpcoming(s.endTime)
    const online = !!s.location && /^https?:\/\//.test(s.location)
    return (
        <div
            className={`flex items-start gap-3 rounded-lg border p-3 ${
                upcoming ? "" : "opacity-60"
            }`}
        >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarClock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">
                    {s.title || "Buổi học"}
                </p>
                <p className="text-xs text-muted-foreground">
                    {formatDateTime(s.startTime)} – {formatDateTime(s.endTime)}
                </p>
                {s.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        {online ? (
                            <Video className="w-3 h-3" />
                        ) : (
                            <MapPin className="w-3 h-3" />
                        )}
                        <span className="line-clamp-1">{s.location}</span>
                    </p>
                )}
            </div>
            {upcoming && online && (
                <Button asChild size="sm" variant="outline" className="shrink-0">
                    <a href={s.location!} target="_blank" rel="noreferrer">
                        Tham gia
                    </a>
                </Button>
            )}
        </div>
    )
}

const statusLabels: Record<string, { label: string; className: string }> = {
    present: { label: "Có mặt", className: "bg-emerald-500/10 text-emerald-600" },
    online_present: { label: "Có mặt (online)", className: "bg-emerald-500/10 text-emerald-600" },
    late: { label: "Đi muộn", className: "bg-amber-500/10 text-amber-600" },
    excused: { label: "Có phép", className: "bg-blue-500/10 text-blue-600" },
    absent: { label: "Vắng", className: "bg-red-500/10 text-red-600" },
}

const CHECKIN_GRACE_MS = 15 * 60 * 1000

const AttendanceSection = ({
    sessions,
    token,
}: {
    sessions: MyAttendanceSession[]
    token: string
}) => {
    const [state, setState] = useState<MyAttendanceSession[]>(sessions)
    const [busyId, setBusyId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    if (state.length === 0) return null

    const handleCheckIn = async (sessionId: string) => {
        setBusyId(sessionId)
        setError(null)
        try {
            const rec = await selfCheckIn({ token, sessionId })
            setState((prev) =>
                prev.map((s) =>
                    s.id === sessionId
                        ? { ...s, myStatus: rec.status, myCheckinAt: rec.checkinAt }
                        : s,
                ),
            )
            toastSuccess("Điểm danh thành công.")
        } catch (err) {
            console.error("Self check-in error:", err)
            setError("Không thể điểm danh. Buổi có thể chưa mở hoặc đã đóng.")
            toastError("Không thể điểm danh. Buổi có thể chưa mở hoặc đã đóng.")
        } finally {
            setBusyId(null)
        }
    }

    const checkedCount = state.filter((s) => !!s.myStatus).length

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Điểm danh
                </p>
                <span className="text-xs text-muted-foreground">
                    Đã điểm danh {checkedCount}/{state.length} buổi
                </span>
            </div>
            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
            <div className="space-y-2">
                {state.map((s) => {
                    const now = Date.now()
                    const startMs = new Date(s.attendanceAt).getTime()
                    const closed = !!s.closeAt && new Date(s.closeAt).getTime() < now
                    const notOpen = startMs - now > CHECKIN_GRACE_MS
                    const checked = !!s.myStatus
                    const badge = s.myStatus ? statusLabels[s.myStatus] : null
                    return (
                        <div
                            key={s.id}
                            className="flex items-center gap-3 rounded-lg border p-2.5"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">
                                    {s.title || "Buổi điểm danh"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDateTime(s.attendanceAt)}
                                    {checked && s.myCheckinAt && (
                                        <> · Điểm danh lúc {formatDateTime(s.myCheckinAt)}</>
                                    )}
                                </p>
                            </div>
                            {checked ? (
                                <Badge className={`border-0 gap-1 ${badge?.className ?? ""}`}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    {badge?.label ?? "Đã điểm danh"}
                                </Badge>
                            ) : closed ? (
                                <Badge variant="secondary">Đã đóng</Badge>
                            ) : notOpen ? (
                                <Badge variant="outline">Chưa mở</Badge>
                            ) : (
                                <Button
                                    size="sm"
                                    className="gap-1 shrink-0"
                                    disabled={busyId === s.id}
                                    aria-label={`Điểm danh buổi ${s.title || ""}`}
                                    onClick={() => handleCheckIn(s.id)}
                                >
                                    <UserCheck className="w-4 h-4" />
                                    {busyId === s.id ? "..." : "Điểm danh"}
                                </Button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const ClassCard = ({ view, token }: { view: MyClassView; token: string }) => {
    const sorted = [...view.schedules].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    const upcoming = sorted.filter((s) => isUpcoming(s.endTime))
    const shown = (upcoming.length > 0 ? upcoming : sorted).slice(0, 3)

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <CardTitle className="text-base">{view.cls.name}</CardTitle>
                            {view.cls.code && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {view.cls.code}
                                </p>
                            )}
                        </div>
                        <Badge
                            variant={view.cls.status === "active" ? "default" : "secondary"}
                            className="shrink-0"
                        >
                            {view.cls.status === "active" ? "Đang học" : view.cls.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Courses */}
                    {view.courses.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {view.courses.map((c, i) =>
                                c.slug ? (
                                    <Link
                                        key={i}
                                        href={`/learn/${c.slug}`}
                                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs hover:bg-muted/70"
                                    >
                                        <BookOpen className="w-3 h-3" />
                                        {c.title}
                                    </Link>
                                ) : (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
                                    >
                                        <BookOpen className="w-3 h-3" />
                                        {c.title}
                                    </span>
                                ),
                            )}
                        </div>
                    )}

                    {/* Schedules */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                            {upcoming.length > 0 ? "Buổi học sắp tới" : "Lịch học"}
                        </p>
                        {shown.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Chưa có lịch học.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {shown.map((s) => (
                                    <ScheduleRow key={s.id} s={s} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Attendance (self check-in) */}
                    <AttendanceSection sessions={view.attendance} token={token} />

                    {/* Members */}
                    {view.members.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                            <div className="flex -space-x-2">
                                {view.members.slice(0, 5).map((m) => (
                                    <div
                                        key={m.id}
                                        title={m.fullName ?? ""}
                                        className="w-7 h-7 rounded-full bg-primary/10 text-primary border-2 border-background flex items-center justify-center text-[10px] font-semibold"
                                    >
                                        {initials(m.fullName ?? "?")}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {view.members.length} thành viên
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

const ClassesPage = () => {
    const { token, isLoading: authLoading, login } = useAuthToken()
    const [views, setViews] = useState<MyClassView[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        let cancelled = false
        const run = async () => {
            setIsLoading(true)
            try {
                const { enrollments } = await loadMyTraining(token)
                // Distinct class ids the learner is enrolled in.
                const classMap = new Map<string, { title: string; slug: string | null }[]>()
                for (const e of enrollments) {
                    if (!e.classId) continue
                    const list = classMap.get(e.classId) ?? []
                    list.push({ title: e.courseTitle, slug: e.courseSlug })
                    classMap.set(e.classId, list)
                }
                const ids = [...classMap.keys()]
                const results = await Promise.all(
                    ids.map(async (id) => {
                        try {
                            const [cls, schedules, members, att] = await Promise.all([
                                getClass({ token, id }),
                                listClassSchedules({ token, classId: id }).catch(() => []),
                                listClassMembers({ token, classId: id }).catch(() => []),
                                getMyClassAttendance({ token, classId: id }).catch(
                                    () => null,
                                ),
                            ])
                            return {
                                cls,
                                schedules,
                                members,
                                attendance: att?.sessions ?? [],
                                courses: classMap.get(id) ?? [],
                            } as MyClassView
                        } catch {
                            return null
                        }
                    }),
                )
                if (!cancelled) {
                    setViews(results.filter((v): v is MyClassView => v !== null))
                }
            } catch (err) {
                console.error("Error loading classes:", err)
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
                        <GraduationCap className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Đăng nhập để xem các lớp học của bạn.
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
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-1">Lớp học của tôi</h1>
                    <p className="text-sm text-muted-foreground">
                        Lịch học, buổi học và thành viên các lớp bạn tham gia
                    </p>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className="h-56 w-full rounded-xl" />
                        ))}
                    </div>
                ) : views.length === 0 ? (
                    <div className="text-center py-16">
                        <GraduationCap className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="font-semibold mb-1">Bạn chưa tham gia lớp học nào</h3>
                        <p className="text-sm text-muted-foreground">
                            Các lớp học có lịch trình sẽ xuất hiện ở đây khi bạn được xếp lớp.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {views.map((v) => (
                            <ClassCard key={v.cls.id} view={v} token={token!} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClassesPage
