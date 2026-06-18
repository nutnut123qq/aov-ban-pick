"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    Award,
    Download,
    ShieldCheck,
    Calendar,
    LogIn,
    ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import {
    listCertificates,
    getMyAccount,
    queryMyEnrollments,
    type CertificateEntity,
    type CertificateStatus,
} from "@/modules/api"
import { useAuthToken } from "@/hooks"
import { formatDate } from "@/modules/utils"

const statusConfig: Record<
    CertificateStatus,
    { label: string; className: string }
> = {
    issued: { label: "Đã cấp", className: "bg-emerald-500/10 text-emerald-600" },
    expired: { label: "Hết hạn", className: "bg-amber-500/10 text-amber-600" },
    revoked: { label: "Đã thu hồi", className: "bg-red-500/10 text-red-600" },
}

interface CourseRef {
    title: string
    slug: string | null
}

const CertificateCard = ({
    cert,
    course,
}: {
    cert: CertificateEntity
    course?: CourseRef
}) => {
    const status = statusConfig[cert.status] ?? statusConfig.issued

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <Card className="overflow-hidden h-full flex flex-col">
                <div className="relative h-28 bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                    <Award className="w-12 h-12 text-primary-foreground/90" />
                    <Badge
                        className={`absolute top-2 right-2 border-0 ${status.className}`}
                    >
                        {status.label}
                    </Badge>
                </div>
                <CardContent className="flex-1 flex flex-col p-4">
                    <h3 className="font-semibold line-clamp-2 mb-1">
                        {course?.title ?? "Chứng chỉ hoàn thành"}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                        Số: {cert.certificateNo}
                    </p>
                    <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                        <p className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Cấp ngày {formatDate(cert.issuedAt)}
                        </p>
                        {cert.expiredAt && (
                            <p className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                Hết hạn {formatDate(cert.expiredAt)}
                            </p>
                        )}
                        <p className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Mã xác minh: {cert.verifyToken.slice(0, 12)}…
                        </p>
                    </div>
                    <div className="mt-auto flex gap-2">
                        {cert.pdfUrl ? (
                            <Button asChild size="sm" className="flex-1 gap-1">
                                <a href={cert.pdfUrl} target="_blank" rel="noreferrer">
                                    <Download className="w-4 h-4" />
                                    Tải PDF
                                </a>
                            </Button>
                        ) : (
                            <Button size="sm" className="flex-1" disabled>
                                Đang xử lý PDF
                            </Button>
                        )}
                        {course?.slug && (
                            <Button asChild size="sm" variant="outline" className="gap-1">
                                <Link href={`/courses/${course.slug}`}>
                                    <ExternalLink className="w-4 h-4" />
                                    Khóa học
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

const CertificatesPage = () => {
    const { token, isLoading: authLoading, login } = useAuthToken()

    const [certs, setCerts] = useState<CertificateEntity[]>([])
    const [courseMap, setCourseMap] = useState<Record<string, CourseRef>>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        let cancelled = false
        const load = async () => {
            setIsLoading(true)
            try {
                const account = await getMyAccount({ token })
                const [list, enrollRes] = await Promise.all([
                    listCertificates({ token, userId: account.id }),
                    queryMyEnrollments({ token }).catch(() => null),
                ])
                if (cancelled) return
                setCerts(list)
                const map: Record<string, CourseRef> = {}
                for (const e of enrollRes?.data?.myEnrollments?.data ?? []) {
                    if (e.courseId && e.course) {
                        map[e.courseId] = {
                            title: e.course.title,
                            slug: e.course.slug ?? null,
                        }
                    }
                }
                setCourseMap(map)
            } catch (err) {
                console.error("Error loading certificates:", err)
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [token, authLoading])

    if (!token && !authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <Card className="max-w-sm w-full text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Award className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Đăng nhập để xem chứng chỉ của bạn.
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
            <div className="container mx-auto max-w-5xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-1">Chứng chỉ của tôi</h1>
                    <p className="text-sm text-muted-foreground">
                        Các chứng chỉ bạn đã đạt được khi hoàn thành khóa học
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-64 w-full rounded-xl" />
                        ))}
                    </div>
                ) : certs.length === 0 ? (
                    <div className="text-center py-16">
                        <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="font-semibold mb-1">Chưa có chứng chỉ</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Hoàn thành khóa học để nhận chứng chỉ đầu tiên của bạn.
                        </p>
                        <Button asChild>
                            <Link href="/my-learning">Tới khóa học của tôi</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {certs.map((cert) => (
                            <CertificateCard
                                key={cert.id}
                                cert={cert}
                                course={cert.courseId ? courseMap[cert.courseId] : undefined}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CertificatesPage
