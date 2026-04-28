"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Users, BookOpen, Clock, Award } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    getPrograms,
    getLearningPaths,
} from "@/mocks"
import type { TrainingProgramEntity, LearningPathEntity } from "@/mocks"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
}

const formatPrice = (price: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(price)
}

const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const days = Math.floor(hours / 8) // Assuming 8 hours per day
    if (days > 0) {
        return `${days} ngày`
    }
    return `${hours}h`
}

const ProgramCard = ({ program }: { program: TrainingProgramEntity }) => {
    return (
        <Link href={`/programs/${program.slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                        src={program.thumbnail || "/placeholder-program.jpg"}
                        alt={program.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="mb-2 bg-primary text-primary-foreground">
                            Chương trình {program.courseCount} khóa
                        </Badge>
                        <h3 className="text-white font-bold text-lg line-clamp-2">
                            {program.title}
                        </h3>
                    </div>
                </div>
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {program.shortDescription}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {program.enrollmentCount} học viên
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(program.duration)}
                        </span>
                    </div>
                    {/* Course list preview */}
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Khóa học bao gồm:</p>
                        <div className="space-y-2">
                            {program.curriculumItems.slice(0, 2).map((item) => (
                                <div key={item.id} className="flex items-center gap-2 text-sm">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    <span className="line-clamp-1">{item.course?.title}</span>
                                </div>
                            ))}
                            {program.curriculumItems.length > 2 && (
                                <p className="text-xs text-muted-foreground">
                                    +{program.curriculumItems.length - 2} khóa học khác
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {program.discountPrice ? (
                            <>
                                <span className="text-lg font-bold text-primary">
                                    {formatPrice(program.discountPrice)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(program.price)}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-primary">
                                {formatPrice(program.price)}
                            </span>
                        )}
                    </div>
                    <Button size="sm" variant="ghost" className="gap-1">
                        Xem chi tiết <ArrowRight className="w-3 h-3" />
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )
}

const LearningPathCard = ({ path }: { path: LearningPathEntity }) => {
    return (
        <Link href={`/learning-paths/${path.slug}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                        src={path.thumbnail || "/placeholder-path.jpg"}
                        alt={path.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                        <Badge variant="secondary" className="mb-2">
                            Learning Path
                        </Badge>
                        <h3 className="text-white font-bold text-lg line-clamp-2">
                            {path.title}
                        </h3>
                    </div>
                </div>
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {path.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {path.courses.length} khóa học
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {path.enrollmentCount}
                        </span>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Button size="sm" variant="outline" className="w-full gap-1">
                        Khám phá <ArrowRight className="w-3 h-3" />
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )
}

const ProgramCardSkeleton = () => (
    <Card className="h-full">
        <Skeleton className="aspect-[16/9] rounded-none" />
        <CardContent className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-1/2" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Skeleton className="h-6 w-20" />
        </CardFooter>
    </Card>
)

const ProgramsPage = () => {
    const [programs, setPrograms] = useState<TrainingProgramEntity[]>([])
    const [learningPaths, setLearningPaths] = useState<LearningPathEntity[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [programsData, pathsData] = await Promise.all([
                    getPrograms({ limit: 20 }),
                    getLearningPaths(),
                ])
                setPrograms(programsData.data)
                setLearningPaths(pathsData)
            } catch (error) {
                console.error("Error loading programs:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    return (
        <div className="min-h-screen">
            {/* Header */}
        

            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="programs" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="programs" className="gap-2">
                            <Award className="w-4 h-4" />
                            Chương trình đào tạo
                        </TabsTrigger>
                        <TabsTrigger value="paths" className="gap-2">
                            <BookOpen className="w-4 h-4" />
                            Learning Paths
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="programs">
                        {isLoading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <ProgramCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : programs.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {programs.map((program) => (
                                    <ProgramCard key={program.id} program={program} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">Chưa có chương trình đào tạo nào</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="paths">
                        {isLoading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <ProgramCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : learningPaths.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {learningPaths.map((path) => (
                                    <LearningPathCard key={path.id} path={path} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">Chưa có learning path nào</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default ProgramsPage
