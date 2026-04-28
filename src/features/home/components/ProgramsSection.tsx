"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ProgramCard } from "./ProgramCard"
import { Skeleton } from "@/components/ui/skeleton"
import type { TrainingProgramEntity } from "@/mocks"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
}

interface ProgramsSectionProps {
    title?: string
    subtitle?: string
    programs: TrainingProgramEntity[]
    isLoading?: boolean
    skeletonCount?: number
}

export function ProgramsSection({ 
    title = "Chương trình đào tạo",
    subtitle = "Lộ trình học tập toàn diện từ cơ bản đến chuyên sâu",
    programs, 
    isLoading = false,
    skeletonCount = 3
}: ProgramsSectionProps) {
    return (
        <motion.section {...fadeInUp}>
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">{title}</h2>
                        <p className="text-muted-foreground mt-1">{subtitle}</p>
                    </div>
                    <Button variant="ghost" className="gap-1">
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array.from({ length: skeletonCount }).map((_, i) => (
                            <Skeleton key={i} className="h-64 rounded-xl" />
                        ))
                    ) : (
                        programs.map((program) => (
                            <ProgramCard key={program.id} program={program} />
                        ))
                    )}
                </div>
            </div>
        </motion.section>
    )
}

export default ProgramsSection
