"use client"
import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Swords, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function HomeScreen() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-muted/30 to-background px-4">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl text-center"
            >
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Swords className="h-7 w-7" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                    AOV DraftMind
                </h1>
                <p className="text-muted-foreground mb-8">
                    Trợ lý cấm/chọn Liên Quân Mobile — thống kê và gợi ý draft theo thời
                    gian thực dựa trên dữ liệu giải chuyên nghiệp và rank cao.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Button asChild className="gap-2">
                        <Link href="/dashboard">
                            Bắt đầu <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
