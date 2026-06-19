"use client"
import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Swords, BarChart3, ShieldBan, FilePlus2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const FeatureCard = ({
    icon: Icon,
    title,
    description,
    href,
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    href: string
}) => (
    <Link href={href}>
        <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    </Link>
)

const DashboardPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-5xl px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold mb-1">AOV DraftMind 👋</h1>
                    <p className="text-sm text-muted-foreground">
                        Trợ lý cấm/chọn Liên Quân — bắt đầu từ một trong các công cụ bên dưới.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FeatureCard
                        icon={Swords}
                        title="Mô phỏng Draft"
                        description="Dựng lại lượt cấm/chọn theo đúng thể thức và nhận gợi ý ở mỗi lượt."
                        href="/draft"
                    />
                    <FeatureCard
                        icon={BarChart3}
                        title="Thống kê Meta"
                        description="WR / PR / BR theo patch và lane, kèm cỡ mẫu và độ tin cậy."
                        href="/meta"
                    />
                    <FeatureCard
                        icon={ShieldBan}
                        title="Global-Ban Tracker"
                        description="Theo dõi pool tướng đã dùng của hai đội trong series."
                        href="/draft"
                    />
                    <FeatureCard
                        icon={FilePlus2}
                        title="Nhập dữ liệu Draft"
                        description="Nhập lượt cấm/chọn một ván và xuất JSON đúng schema dữ liệu."
                        href="/draft-input"
                    />
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
