import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import type { CourseEntity } from "@/mocks"

interface CourseInstructorProps {
    course: CourseEntity
}

export const CourseInstructor: React.FC<CourseInstructorProps> = ({ course }) => {
    const instructor = course.instructors?.[0]

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="w-20 h-20">
                        <AvatarImage src={instructor?.user?.avatar || ""} />
                        <AvatarFallback className="text-xl">
                            {instructor?.user?.firstName?.charAt(0) || "I"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold">
                            {instructor?.user?.firstName} {instructor?.user?.lastName}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {instructor?.title || "Giảng viên"}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                4.9 Rating
                            </span>
                            <span>•</span>
                            <span>500+ Reviews</span>
                            <span>•</span>
                            <span>2000+ Students</span>
                        </div>
                    </div>
                </div>
                {instructor?.bio && (
                    <div className="mt-6 pt-6 border-t">
                        <p className="text-muted-foreground">{instructor.bio}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
