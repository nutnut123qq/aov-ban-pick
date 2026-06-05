import React from "react"
import { CheckCircle, Award } from "lucide-react"
import type { CourseEntity } from "@/modules/types"

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

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Yêu cầu</h2>
                    <ul className="space-y-2">
                        {course.prerequisites.map((prereq) => (
                            <li key={prereq.id} className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span>{prereq.content}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Value Propositions */}
            {course.valuePropositions && course.valuePropositions.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Bạn sẽ học được gì</h2>
                    <ul className="grid md:grid-cols-2 gap-3">
                        {course.valuePropositions.map((vp) => (
                            <li key={vp.id} className="flex items-start gap-2">
                                <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span>{vp.content}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
