"use client"

import React, { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, ChevronDown, ChevronRight, CheckCircle, Circle, X } from "lucide-react"
import { getLessonIcon, formatDuration } from "../utils"
import type { CourseSectionEntity, LessonEntity } from "@/modules/types"

interface MobileCourseSidebarProps {
    sections: CourseSectionEntity[]
    currentLessonId?: string
    completedLessons?: Set<string>
    onSelectLesson?: (lesson: LessonEntity) => void
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export const MobileCourseSidebar: React.FC<MobileCourseSidebarProps> = ({
    sections,
    currentLessonId,
    completedLessons = new Set(),
    onSelectLesson,
    isOpen = false,
    onOpenChange,
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

    const handleSelectLesson = (lesson: LessonEntity) => {
        onSelectLesson?.(lesson)
        onOpenChange?.(false)
    }

    const isLessonCompleted = (lessonId: string) => completedLessons.has(lessonId)
    const isCurrentLesson = (lessonId: string) => currentLessonId === lessonId

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-[85%] sm:w-[350px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-base font-semibold">Nội dung khóa học</SheetTitle>
                    </div>
                </SheetHeader>
                
                <ScrollArea className="flex-1">
                    <div className="p-2">
                        {sections.map((section) => (
                            <div key={section.id} className="mb-2">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <span className="text-sm font-medium text-left line-clamp-2 flex-1">
                                        {section.title}
                                    </span>
                                    {expandedSections.has(section.id) ? (
                                        <ChevronDown className="w-4 h-4 ml-1 shrink-0" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
                                    )}
                                </button>
                                {expandedSections.has(section.id) && (
                                    <div className="ml-2 mt-1 space-y-1">
                                        {section.chapters?.map((chapter) => (
                                            <div key={chapter.id}>
                                                <div className="text-xs text-muted-foreground px-2 py-1 font-medium">
                                                    {chapter.title}
                                                </div>
                                                {chapter.lessons?.map((lesson) => {
                                                    const Icon = getLessonIcon(lesson.type)
                                                    return (
                                                        <button
                                                            key={lesson.id}
                                                            onClick={() => handleSelectLesson(lesson)}
                                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                                                                isCurrentLesson(lesson.id)
                                                                    ? "bg-primary/10 text-primary"
                                                                    : "hover:bg-muted"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className="shrink-0">
                                                                    {isLessonCompleted(lesson.id) ? (
                                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                                    ) : (
                                                                        <div className="w-5 h-5 flex items-center justify-center">
                                                                            {Icon}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm line-clamp-2 flex-1">
                                                                    {lesson.title}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground shrink-0">
                                                                {formatDuration(lesson.duration || 0)}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
