"use client"
import React, { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Menu, ArrowLeft, BookOpen, ChevronRight, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getCourseBySlug, getCourseContent, getCourses } from "@/mocks"
import type { CourseEntity, CourseSectionEntity, LessonEntity } from "@/mocks"
import {
    VideoPlayer,
    CourseSidebar,
    MobileCourseSidebar,
    LessonNavigation,
    LessonHeader,
    LessonMaterials,
    LessonSidebar,
} from "./components"

const CourseLearnPage = () => {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    const [course, setCourse] = useState<CourseEntity | null>(null)
    const [courseContent, setCourseContent] = useState<CourseSectionEntity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentLesson, setCurrentLesson] = useState<LessonEntity | null>(null)
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    // Load course data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [courseData, contentData] = await Promise.all([
                    getCourseBySlug(slug),
                    getCourseContent(),
                ])
                setCourse(courseData)
                setCourseContent(contentData)

                // Find first lesson
                if (contentData.length > 0 && contentData[0].chapters?.length) {
                    const firstChapter = contentData[0].chapters[0]
                    if (firstChapter.lessons?.length) {
                        setCurrentLesson(firstChapter.lessons[0])
                    }
                }
            } catch (error) {
                console.error("Error loading course:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [slug])

    // Get all lessons in order
    const allLessons = useMemo(() => {
        const lessons: LessonEntity[] = []
        courseContent.forEach((section) => {
            section.chapters?.forEach((chapter) => {
                chapter.lessons?.forEach((lesson) => {
                    lessons.push(lesson)
                })
            })
        })
        return lessons
    }, [courseContent])

    // Current lesson index
    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id)

    // Get prev/next lessons
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : undefined
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : undefined

    // Handle lesson selection
    const handleSelectLesson = (lesson: LessonEntity) => {
        setCurrentLesson(lesson)
        setSidebarOpen(false)
        // Update URL without reload
        window.history.pushState({}, "", `/learn/${slug}/${lesson.id}`)
    }

    // Handle mark complete
    const handleMarkComplete = () => {
        if (currentLesson) {
            const newCompleted = new Set(completedLessons)
            if (newCompleted.has(currentLesson.id)) {
                newCompleted.delete(currentLesson.id)
            } else {
                newCompleted.add(currentLesson.id)
            }
            setCompletedLessons(newCompleted)
        }
    }

    // Handle video ended - auto go to next
    const handleVideoEnded = () => {
        if (nextLesson) {
            handleSelectLesson(nextLesson)
        }
    }

    // Check if current lesson is completed
    const isCurrentCompleted = currentLesson ? completedLessons.has(currentLesson.id) : false

    if (isLoading) {
        return <LearnPageSkeleton />
    }

    if (!course || !currentLesson) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Không tìm thấy bài học</h1>
                    <Button onClick={() => router.push(`/courses/${slug}`)}>
                        Quay lại khóa học
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Top Header */}
            <LessonHeader course={course} currentLessonTitle={currentLesson.title} />

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Sidebar */}
                <div className="relative">
                    {/* Đường line bên phải - luôn hiển thị */}
                    <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px bg-border pointer-events-none" />

                    <aside className={`hidden lg:block bg-card overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "w-12" : "w-80"}`}>
                        <CourseSidebar
                            sections={courseContent}
                            currentLessonId={currentLesson.id}
                            completedLessons={completedLessons}
                            onSelectLesson={handleSelectLesson}
                            isCollapsed={sidebarCollapsed}
                        />
                    </aside>

                    {/* Toggle button - nằm giữa cạnh phải, đè lên đường line */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-8 h-8 rounded-full bg-background border-2 border-gray-200 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-md"
                        title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                    >
                        {sidebarCollapsed ? (
                            <ChevronLeft className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Mobile Sidebar */}
                <MobileCourseSidebar
                    sections={courseContent}
                    currentLessonId={currentLesson.id}
                    completedLessons={completedLessons}
                    onSelectLesson={handleSelectLesson}
                    open={sidebarOpen}
                    onOpenChange={setSidebarOpen}
                />

                {/* Main Video Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Video Player */}
                    <div className="flex-1 min-h-0">
                        {currentLesson.type === "VIDEO" ? (
                            <div className="h-full max-h-[calc(100vh-180px)]">
                                <div className="h-full px-4 pt-4">
                                    <VideoPlayer
                                        videoUrl={currentLesson.content?.videoUrl}
                                        title={currentLesson.title}
                                        onEnded={handleVideoEnded}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full overflow-auto">
                                <div className="max-w-4xl mx-auto p-6">
                                    <h1 className="text-2xl font-bold mb-4">{currentLesson.title}</h1>
                                    {currentLesson.description && (
                                        <p className="text-muted-foreground mb-6">{currentLesson.description}</p>
                                    )}
                                    {currentLesson.content?.textContent && (
                                        <div className="prose prose-lg max-w-none">
                                            <div dangerouslySetInnerHTML={{ __html: currentLesson.content.textContent.replace(/\n/g, "<br/>") }} />
                                        </div>
                                    )}
                                    {currentLesson.type === "QUIZ" && (
                                        <div className="p-6 bg-muted rounded-lg">
                                            <p className="text-center">Quiz: {currentLesson.title}</p>
                                            <Button className="mt-4">Bắt đầu Quiz</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Controls */}
                    <div className="border-t bg-background">
                        <div className="container mx-auto px-4 py-4">
                            {/* Mobile: Menu Button */}
                            <div className="lg:hidden mb-4">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu className="w-4 h-4 mr-2" />
                                    Xem nội dung khóa học
                                </Button>
                            </div>

                            {/* Lesson Navigation */}
                            <LessonNavigation
                                prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title } : undefined}
                                nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : undefined}
                                isCompleted={isCurrentCompleted}
                                onMarkComplete={handleMarkComplete}
                                onPrev={() => prevLesson && handleSelectLesson(prevLesson)}
                                onNext={() => nextLesson && handleSelectLesson(nextLesson)}
                            />
                        </div>
                    </div>
                </main>

                {/* Right Sidebar (Desktop) */}
                <aside className="hidden xl:block w-80 border-l bg-card p-4 overflow-auto">
                    <LessonSidebar
                        title={currentLesson.title}
                        description={currentLesson.description}
                        completedLessons={completedLessons.size}
                        totalLessons={allLessons.length}
                        isEnrolled={true}
                    />
                    <div className="mt-6">
                        <LessonMaterials materials={currentLesson.materials} />
                    </div>
                </aside>
            </div>
        </div>
    )
}

// Loading Skeleton
const LearnPageSkeleton = () => (
    <div className="h-screen flex flex-col">
        <Skeleton className="h-14 w-full" />
        <div className="flex-1 flex">
            <Skeleton className="hidden lg:block w-80 h-full" />
            <div className="flex-1 p-4">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <Skeleton className="h-16 w-full mt-4 rounded-lg" />
            </div>
            <Skeleton className="hidden xl:block w-80 h-full" />
        </div>
    </div>
)

export default CourseLearnPage
