"use client"

import React, { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Play, FileText, FileQuestion, Lock } from "lucide-react"
import { getLessonIcon, formatDuration } from "../utils"
import type { CourseSectionEntity, LessonEntity } from "@/modules/types"

interface DesktopCourseSidebarProps {
    sections: CourseSectionEntity[]
    currentLessonId?: string
    completedLessons?: Set<string>
    onSelectLesson?: (lesson: LessonEntity) => void
    isCollapsed?: boolean
}

export const DesktopCourseSidebar: React.FC<DesktopCourseSidebarProps> = ({
    sections,
    currentLessonId,
    completedLessons = new Set(),
    onSelectLesson,
    isCollapsed = false,
}) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(sections.map((s) => s.id))
    )

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId)
        } else {
            newExpanded.add(sectionId)
        }
        setExpandedSections(newExpanded)
    }

    const isLessonCompleted = (lessonId: string) => completedLessons.has(lessonId)
    const isCurrentLesson = (lessonId: string) => currentLessonId === lessonId

    if (isCollapsed) {
        return (
            <div className="h-full flex flex-col items-center py-4">
                <div className="flex flex-col items-center gap-2 overflow-y-auto flex-1 py-4">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium"
                            title={section.title}
                        >
                            {index + 1}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-sm">Nội dung khóa học</h2>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {sections.map((section) => (
                        <div key={section.id} className="mb-2">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <span className="text-xs font-medium text-left line-clamp-2 flex-1">
                                    {section.title}
                                </span>
                                {expandedSections.has(section.id) ? (
                                    <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
                                ) : (
                                    <ChevronLeft className="w-4 h-4 ml-1 shrink-0" />
                                )}
                            </button>
                            {expandedSections.has(section.id) && (
                                <div className="ml-2 mt-1 space-y-1">
                                    {section.chapters?.map((chapter) => (
                                        <div key={chapter.id}>
                                            <div className="text-xs text-muted-foreground px-2 py-1">
                                                {chapter.title}
                                            </div>
                                            {chapter.lessons?.map((lesson) => (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => onSelectLesson?.(lesson)}
                                                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left ${
                                                        isCurrentLesson(lesson.id)
                                                            ? "bg-primary/10 text-primary"
                                                            : "hover:bg-muted"
                                                    }`}
                                                >
                                                    {isLessonCompleted(lesson.id) ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                                    ) : (
                                                        <Circle className="w-4 h-4 shrink-0" />
                                                    )}
                                                    <span className="text-xs line-clamp-1 flex-1">
                                                        {lesson.title}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
