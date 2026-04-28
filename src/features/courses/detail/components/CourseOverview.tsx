import React from "react"
import { CheckCircle, Award } from "lucide-react"
import type { CourseEntity } from "@/mocks"

interface CourseOverviewProps {
    course: CourseEntity
}

export const CourseOverview: React.FC<CourseOverviewProps> = ({ course }) => {
    return (
        <div className="space-y-6">
            {/* Description */}
            <div>
                <h2 className="text-xl font-bold mb-4">Mô tả khóa học</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                    {course.description}
                </div>
            </div>

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Yêu cầu</h2>
                    <ul className="space-y-2">
                        {course.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span>{req}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Outcomes */}
            {course.outcomes && course.outcomes.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Bạn sẽ học được gì</h2>
                    <ul className="grid md:grid-cols-2 gap-3">
                        {course.outcomes.map((outcome, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span>{outcome}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
