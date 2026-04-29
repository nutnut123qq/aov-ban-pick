"use client"

import React, { useEffect, useState } from "react"
import { Award, BookOpen } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    getPrograms,
    getLearningPaths,
} from "@/mocks"
import type { TrainingProgramEntity, LearningPathEntity } from "@/mocks"

import {
    ProgramCard,
    LearningPathCard,
    ProgramCardSkeleton,
    LearningPathCardSkeleton,
} from "@/features/programs"

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
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <ProgramCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : programs.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <LearningPathCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : learningPaths.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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
