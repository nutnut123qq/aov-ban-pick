"use client"

import React from "react"
import { BookOpen, Award, Users } from "lucide-react"
import { Card } from "@/components/ui/card"

interface WhyChooseUsCardProps {
    icon: React.ReactNode
    title: string
    description: string
}

export function WhyChooseUsCard({ icon, title, description }: WhyChooseUsCardProps) {
    return (
        <Card className="text-center p-8 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                {icon}
            </div>
            <h3 className="font-bold text-lg mb-3">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </Card>
    )
}

export const whyChooseUsData = [
    {
        icon: <BookOpen className="w-8 h-8 text-primary" />,
        title: "Tư duy trước stack",
        description: "Công nghệ thay đổi liên tục. Chúng tớ tập trung dạy bản chất, keyword và tư duy để bạn tự research và mở rộng theo bất kỳ stack nào.",
    },
    {
        icon: <Award className="w-8 h-8 text-primary" />,
        title: "Chi phí tối thiểu, chất lượng cao",
        description: "Mô hình tinh gọn, loại bỏ chi phí không cần thiết để giữ học phí ở mức dễ tiếp cận, phù hợp với mọi đối tượng học viên.",
    },
    {
        icon: <Users className="w-8 h-8 text-primary" />,
        title: "From Code to Career",
        description: "Dạy để bạn xây dựng project có giá trị thực sự và hỗ trợ lâu dài trong quá trình phát triển sự nghiệp.",
    },
]

export default WhyChooseUsCard
