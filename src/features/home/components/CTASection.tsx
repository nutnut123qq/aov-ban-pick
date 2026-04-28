"use client"

import React from "react"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
}

interface CTASectionProps {
    title?: string
    description?: string
}

export function CTASection({ 
    title = "Sẵn sàng bắt đầu hành trình của bạn?",
    description = "Đăng ký ngay hôm nay và nhận ưu đãi học phí cho khóa học đầu tiên của bạn."
}: CTASectionProps) {
    return (
        <motion.section 
            className="bg-primary text-primary-foreground rounded-3xl p-10 md:p-16 text-center" 
            {...fadeInUp}
        >
            <div className="container mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    {title}
                </h2>
                <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
                    {description}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg" variant="secondary" className="gap-2">
                        Đăng ký ngay <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                    >
                        Liên hệ tư vấn
                    </Button>
                </div>
            </div>
        </motion.section>
    )
}

export default CTASection
