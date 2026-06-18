"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { 
    ArrowLeft, 
    BookOpen, 
    Clock, 
    Users, 
    CheckCircle, 
    Award,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

import { queryTrainingProgram } from "@/modules/api"
import { useAuthToken } from "@/hooks"
import type { TrainingProgramEntity } from "@/modules/types"


const formatPrice = (price: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(price)
}

const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const days = Math.floor(hours / 8)
    if (days > 0) return `${days} ngày`
    return `${hours}h`
}

const ProgramDetailPage = () => {
    const params = useParams()
    const slug = params.slug as string
    const token = useAuthToken().token
    
    const [program, setProgram] = useState<TrainingProgramEntity | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadProgram = async () => {
            try {
                if (!token) {
                    setProgram(null)
                    return
                }

                const data = await queryTrainingProgram({
                    id: slug,
                    token,
                })
                setProgram(data)
            } catch (error) {
                console.error("Error loading program:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadProgram()
    }, [slug, token])

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <div className="relative h-64 md:h-80">
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        </div>
                        <div>
                            <Skeleton className="h-96 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!program) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Không tìm thấy chương trình</h1>
                    <p className="text-muted-foreground mb-4">
                        Chương trình đào tạo này không tồn tại hoặc đã bị xóa.
                    </p>
                    <Link href="/programs">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại danh sách
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const curriculumItems = program.curriculumItems ?? []
    const totalDuration = curriculumItems.reduce(
        (acc, item) => acc + (item.estimatedDuration || item.course?.duration || 0),
        0
    )
    const requiredCourses = curriculumItems.filter(item => item.isRequired).length

    return (
        <div className="min-h-screen">
            <div className="relative h-64 md:h-80">
                <Image
                    src={program.thumbnail || "/placeholder-program.jpg"}
                    alt={program.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40" />
                
                <div className="absolute inset-0 flex items-end">
                    <div className="container mx-auto px-4 pb-8">
                        <Link href="/programs">
                            <Button variant="ghost" size="sm" className="gap-1 mb-4 text-white hover:text-white hover:bg-white/20">
                                <ArrowLeft className="w-4 h-4" />
                                Quay lại
                            </Button>
                        </Link>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <Badge className="mb-2 bg-white/20 text-white border-white/30 hover:bg-white/30">Chương trình đào tạo</Badge>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {program.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    {program.courseCount} khóa học
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatDuration(totalDuration)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {program.enrollmentCount} học viên
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Giới thiệu chương trình</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {program.description}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{program.courseCount}</div>
                                    <div className="text-xs text-muted-foreground">Khóa học</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
                                    <div className="text-xs text-muted-foreground">Tổng thời gian</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{requiredCourses}</div>
                                    <div className="text-xs text-muted-foreground">Bắt buộc</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{program.enrollmentCount}</div>
                                    <div className="text-xs text-muted-foreground">Học viên</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Lộ trình khóa học</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Chương trình bao gồm {program.courseCount} khóa học, trong đó {requiredCourses} khóa bắt buộc
                                </p>
                                <div className="space-y-3">
                                    {curriculumItems
                                        .sort((a, b) => a.order - b.order)
                                        .map((item, index) => (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-primary font-bold">{index + 1}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <h4 className="font-semibold line-clamp-1">{item.course?.title}</h4>
                                                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {formatDuration(item.estimatedDuration || item.course?.duration || 0)}
                                                                </span>
                                                                {item.isRequired && (
                                                                    <Badge variant="secondary" className="text-xs">Bắt buộc</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Link href={`/courses/${item.course?.slug}`}>
                                                            <Button size="sm" variant="outline" className="gap-1">
                                                                Xem khóa học
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-4">
                            <Card className="overflow-hidden">
                                <div className="aspect-video relative">
                                    <Image
                                        src={program.thumbnail || "/placeholder-program.jpg"}
                                        alt={program.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <CardContent className="p-6">
                                    <div className="text-center mb-6">
                                        {program.discountPrice ? (
                                            <div className="space-y-1">
                                                <div className="text-3xl font-bold text-primary">
                                                    {formatPrice(program.discountPrice)}
                                                </div>
                                                <div className="text-lg text-muted-foreground line-through">
                                                    {formatPrice(program.price)}
                                                </div>
                                                <Badge variant="destructive" className="mt-2">
                                                    Tiết kiệm {formatPrice(program.price - program.discountPrice)}
                                                </Badge>
                                            </div>
                                        ) : (
                                            <div className="text-3xl font-bold text-primary">
                                                {formatPrice(program.price)}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {(() => {
                                        const firstSlug = [...curriculumItems]
                                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                            .map((i) => i.course?.slug)
                                            .find(Boolean)
                                        return firstSlug ? (
                                            <Button asChild className="w-full mb-4" size="lg">
                                                <Link href={`/courses/${firstSlug}`}>
                                                    Bắt đầu học
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button className="w-full mb-4" size="lg" disabled>
                                                Sắp ra mắt
                                            </Button>
                                        )
                                    })()}

                                    <Separator className="my-4" />

                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Học mọi lúc, mọi nơi</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Chứng chỉ hoàn thành</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Hỗ trợ 24/7</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Cập nhật miễn phí</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProgramDetailPage
