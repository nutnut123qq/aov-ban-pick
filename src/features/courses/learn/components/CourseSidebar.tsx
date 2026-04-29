"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Circle,
    Play,
    FileText,
    FileQuestion,
    Lock,
    Menu,
    X,
    Home,
    PanelRightClose,
    PanelRightOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import type { CourseSectionEntity, CourseChapterEntity, LessonEntity } from "@/mocks"
import { getLessonIcon, formatDuration } from "../utils"

interface CourseSidebarProps {
    sections: CourseSectionEntity[]
    currentLessonId?: string
    completedLessons?: Set<string>
    onSelectLesson?: (lesson: LessonEntity) => void
    isCollapsed?: boolean
    onCollapsedChange?: (collapsed: boolean) => void
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
    sections,
    currentLessonId,
    completedLessons = new Set(),
    onSelectLesson,
    isCollapsed = false,
    onCollapsedChange,
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

    const toggleCollapse = () => {
        onCollapsedChange?.(!isCollapsed)
    }

    const isLessonCompleted = (lessonId: string) => completedLessons.has(lessonId)
    const isCurrentLesson = (lessonId: string) => currentLessonId === lessonId

    if (isCollapsed) {
        return (
            <div className="h-full flex flex-col items-center py-4">
                {/* Collapsed content - just show section dots */}
                <div className="flex flex-col items-center gap-2 overflow-y-auto flex-1 py-4">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                            title={section.title}
                        >
                            <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
                <Link href="/courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    Quay lại khóa học
                </Link>
            </div>

            {/* Sections List */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {sections.map((section) => (
                        <div key={section.id} className="mb-2">
                            {/* Section Header */}
                            <button
                                className="w-full p-3 flex items-center justify-between text-left rounded-lg hover:bg-muted/50 transition-colors"
                                onClick={() => toggleSection(section.id)}
                            >
                                <span className="font-medium text-sm line-clamp-2">{section.title}</span>
                                {expandedSections.has(section.id) ? (
                                    <ChevronUp className="w-4 h-4 shrink-0" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 shrink-0" />
                                )}
                            </button>

                            {/* Chapters & Lessons */}
                            {expandedSections.has(section.id) && section.chapters && (
                                <div className="ml-2 mt-1 space-y-1">
                                    {section.chapters.map((chapter) => (
                                        <div key={chapter.id}>
                                            {/* Chapter Title */}
                                            <p className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/30 rounded">
                                                {chapter.title}
                                            </p>

                                            {/* Lessons */}
                                            <div className="mt-1">
                                                {chapter.lessons?.map((lesson) => {
                                                    const isCompleted = isLessonCompleted(lesson.id)
                                                    const isCurrent = isCurrentLesson(lesson.id)

                                                    return (
                                                        <button
                                                            key={lesson.id}
                                                            className={`w-full flex items-start gap-3 p-3 text-left rounded-lg transition-colors ${isCurrent
                                                                ? "bg-primary/10 text-primary"
                                                                : "hover:bg-muted/50"
                                                                }`}
                                                            onClick={() => onSelectLesson?.(lesson)}
                                                        >
                                                            {/* Status Icon */}
                                                            <div className="mt-0.5">
                                                                {isCompleted ? (
                                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                                ) : lesson.isFree ? (
                                                                    getLessonIcon(lesson.type)
                                                                ) : (
                                                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                                                )}
                                                            </div>

                                                            {/* Lesson Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm line-clamp-2 ${isCurrent ? "font-medium" : ""}`}>
                                                                    {lesson.title}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {lesson.type === "VIDEO" && lesson.duration && formatDuration(lesson.duration)}
                                                                        {lesson.type === "QUIZ" && "Quiz"}
                                                                        {lesson.type === "TEXT" && "Bài đọc"}
                                                                    </span>
                                                                    {isCompleted && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            Hoàn thành
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
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

// Mobile Sidebar (Sheet)
interface MobileCourseSidebarProps extends CourseSidebarProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const MobileCourseSidebar: React.FC<MobileCourseSidebarProps> = ({
    open,
    onOpenChange,
    ...props
}) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-base">Nội dung khóa học</SheetTitle>
                </SheetHeader>
                <CourseSidebar {...props} />
            </SheetContent>
        </Sheet>
    )
}
