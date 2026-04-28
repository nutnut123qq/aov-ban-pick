"use client"

import React from "react"
import { motion } from "framer-motion"
import { WhyChooseUsCard, whyChooseUsData } from "./WhyChooseUsCard"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
}

interface WhyChooseUsSectionProps {
    title?: string
    description?: string
}

export function WhyChooseUsSection({ 
    title = "Điều gì làm cho Tedo khác biệt?",
    description = "Tedo tập trung vào bản chất của ngành IT. Chúng tớ không chỉ dạy kiến thức mà còn đào tạo tư duy lập trình chuẩn mực và khả năng thiết kế hệ thống."
}: WhyChooseUsSectionProps) {
    return (
        <motion.section className="py-16" {...fadeInUp}>
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        {description}
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {whyChooseUsData.map((item, index) => (
                        <WhyChooseUsCard 
                            key={index}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    )
}

export default WhyChooseUsSection
