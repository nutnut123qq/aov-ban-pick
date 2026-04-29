"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, Clock, Users, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

import { getLearningPathBySlug } from "@/mocks"
import type { LearningPathEntity } from "@/mocks"


const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    if (hours > 0) return `${hours}h`
    return `${Math.floor(seconds / 60)}m`
}

const LearningPathDetailPage = () => {
    const params = useParams()
    const slug = params.slug as string
    
    const [path, setPath] = useState<LearningPathEntity | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadPath = async () => {
            try {
                const data = await getLearningPathBySlug(slug)
                setPath(data)
            } catch (error) {
                console.error("Error loading learning path:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadPath()
    }, [slug])

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-8 w-1/2 mb-6" />
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!path) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-2xl font-bold mb-2">Không tìm thấy lộ trình</h1>
                    <Link href="/programs">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const totalDuration = path.courses.reduce(
        (acc, c) => acc + (c.course?.duration || 0),
        0
    )
    const hours = Math.floor(totalDuration / 3600)
    const requiredCourses = path.courses.filter(c => c.isRequired).length

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <Link href="/programs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                    <Badge variant="secondary" className="mb-2">Learning Path</Badge>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{path.title}</h1>
                    <p className="text-muted-foreground max-w-2xl mb-6">{path.description}</p>

                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8">
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {path.courses.length} khóa học
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {hours > 0 ? `${hours} giờ` : `${Math.floor(totalDuration / 60)} phút`}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {path.enrollmentCount} học viên
                        </span>
                    </div>
                </motion.div>

                <Separator className="my-8" />

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <div className="text-2xl font-bold">{path.courses.length}</div>
                            <div className="text-xs text-muted-foreground">Khóa học</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <div className="text-2xl font-bold">
                                {hours > 0 ? `${hours}h` : `${Math.floor(totalDuration / 60)}m`}
                            </div>
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
                </div>

                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Lộ trình khóa học</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Lộ trình bao gồm {path.courses.length} khóa học
                        </p>
                        <div className="space-y-3">
                            {path.courses
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
                                            <h4 className="font-semibold line-clamp-1">{item.course?.title}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDuration(item.course?.duration || 0)}
                                                </span>
                                                {item.isRequired && (
                                                    <Badge variant="secondary" className="text-xs">Bắt buộc</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Link href={`/courses/${item.course?.slug}`}>
                                            <Button size="sm" variant="outline">Xem khóa học</Button>
                                        </Link>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default LearningPathDetailPage
