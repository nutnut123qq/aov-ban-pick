"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, Clock } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TrainingProgramEntity } from "@/mocks"

const formatPrice = (price: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(price)
}

const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
}

interface ProgramCardProps {
    program: TrainingProgramEntity
}

export function ProgramCard({ program }: ProgramCardProps) {
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

export default ProgramCard
