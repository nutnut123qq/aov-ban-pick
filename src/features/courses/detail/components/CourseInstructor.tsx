import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import type { CourseEntity } from "@/modules/types"

interface CourseInstructorProps {
    course: CourseEntity
}

export const CourseInstructor: React.FC<CourseInstructorProps> = ({ course }) => {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold">
                            Giảng viên
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Thông tin giảng viên sẽ được cập nhật sau
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                {course.rating?.toFixed(1) ?? "0.0"} Rating
                            </span>
                            <span>•</span>
                            <span>{course.reviewCount} Reviews</span>
                            <span>•</span>
                            <span>{course.enrollmentCount} Students</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
