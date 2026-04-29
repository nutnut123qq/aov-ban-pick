import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Lock, Play } from "lucide-react"
import type { CourseSectionEntity } from "@/mocks"
import { formatDurationLong, formatDuration, getLessonIcon } from "./utils"

interface CourseCurriculumProps {
    sections: CourseSectionEntity[]
    expandedSections: Set<string>
    onToggleSection: (sectionId: string) => void
    courseSlug: string
}

export const CourseCurriculum: React.FC<CourseCurriculumProps> = ({
    sections,
    expandedSections,
    onToggleSection,
    courseSlug,
}) => {
    const totalLessons = sections.reduce((acc, section) => {
        return acc + section.chapters?.reduce((chAcc, chapter) => {
            return chAcc + (chapter.lessons?.length || 0)
        }, 0) || 0
    }, 0)

    const totalDuration = sections.reduce((acc, section) => {
        return acc + section.chapters?.reduce((chAcc, chapter) => {
            return chAcc + (chapter.lessons?.reduce((lesAcc, lesson) => lesAcc + (lesson.duration || 0), 0) || 0)
        }, 0) || 0
    }, 0)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {sections.length} phần • {totalLessons} bài học • {formatDurationLong(totalDuration)}
                </p>
                <Link
                    href={`/learn/${courseSlug}`}
                    className="text-sm text-primary hover:underline font-medium"
                >
                    Học ngay
                </Link>
            </div>

            {/* Sections */}
            {sections.map((section) => (
                <Card key={section.id}>
                    <button
                        className="w-full p-2 px-3 flex items-center justify-between text-left"
                        onClick={() => onToggleSection(section.id)}
                    >
                        <div>
                            <h3 className="font-semibold">{section.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                {section.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0} bài học
                            </p>
                        </div>
                        {expandedSections.has(section.id) ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </button>

                    {expandedSections.has(section.id) && section.chapters && (
                        <CardContent className="pt-0 pb-4">
                            {section.chapters.map((chapter) => (
                                <div key={chapter.id} className="border-t first:border-0">
                                    <p className="text-sm font-medium p-3 bg-muted/50">
                                        {chapter.title}
                                    </p>
                                    {chapter.lessons?.map((lesson) => (
                                        <Link
                                            key={lesson.id}
                                            href={`/learn/${courseSlug}?lesson=${lesson.id}`}
                                            className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                {getLessonIcon(lesson.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">{lesson.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {lesson.type === "VIDEO" && lesson.duration && formatDuration(lesson.duration)}
                                                    {lesson.type === "QUIZ" && "Quiz"}
                                                    {lesson.type === "TEXT" && "Bài đọc"}
                                                </p>
                                            </div>
                                            {lesson.isFree ? (
                                                <Badge variant="secondary">Miễn phí</Badge>
                                            ) : (
                                                <Lock className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
    )
}
