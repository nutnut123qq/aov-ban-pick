"use client"
import React, { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Menu, ChevronRight, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    queryCourse,
    QueryCourse,
    queryCourseContent,
    queryMyEnrollments,
    listLessonProgress,
    upsertLessonProgress,
    getVideoQualities,
    resolveLessonHls,
} from "@/modules/api"
import { HlsPlayer } from "./components/HlsPlayer"
import { AiLearningPanel } from "./components/AiLearningPanel"
import { useAuthToken } from "@/hooks"
import type { CourseEntity, CourseSectionEntity, LessonEntity } from "@/modules/types"
import {
    DesktopCourseSidebar,
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
    const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
    const [savingProgress, setSavingProgress] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const { token: authToken } = useAuthToken()
    const [hlsSrc, setHlsSrc] = useState<string | null>(null)

    // Resolve the adaptive HLS source for the current VIDEO lesson (via BE → upload.ftes.vn).
    useEffect(() => {
        if (!currentLesson || currentLesson.type !== "VIDEO" || !authToken) return
        let cancelled = false
        const run = async () => {
            setHlsSrc(null)
            try {
                const q = await getVideoQualities({
                    token: authToken,
                    lessonId: currentLesson.id,
                })
                if (!cancelled) setHlsSrc(resolveLessonHls(q))
            } catch {
                if (!cancelled) setHlsSrc(null)
            }
        }
        run()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLesson?.id, currentLesson?.type, authToken])

    // Load course data
    useEffect(() => {
        let cancelled = false
        const loadData = async () => {
            try {
                const token = authToken ?? undefined
                const [courseRes, contentRes] = await Promise.all([
                    queryCourse({
                        query: QueryCourse.QueryBySlug,
                        variables: {
                            request: { slug },
                        },
                        token,
                    }),
                    queryCourseContent({
                        variables: {
                            request: { slug },
                        },
                        token,
                    }),
                ])
                const courseData = (courseRes.data as import("@/modules/api/graphql/queries/query-course").QueryCourseBySlugResponse | undefined)?.courseBySlug ?? null
                if (cancelled) return

                setCourse(courseData as CourseEntity | null)

                // Resolve enrollment + persisted lesson progress for the signed-in learner.
                if (token && courseData?.id) {
                    try {
                        const enrollRes = await queryMyEnrollments({ token })
                        const match = enrollRes.data?.myEnrollments?.data?.find(
                            (e) => e.courseId === courseData.id,
                        )
                        if (!cancelled && match?.id) {
                            setEnrollmentId(match.id)
                            const progress = await listLessonProgress({
                                enrollmentId: match.id,
                                token,
                            })
                            if (!cancelled) {
                                setCompletedLessons(
                                    new Set(
                                        progress
                                            .filter((p) => p.status === "completed")
                                            .map((p) => p.lessonId),
                                    ),
                                )
                            }
                        }
                    } catch (progressErr) {
                        console.error("Error loading lesson progress:", progressErr)
                    }
                }

                const rawSections = contentRes.data?.courseContent ?? []
                const mappedSections: CourseSectionEntity[] = rawSections.map((section: any) => ({
                    id: section.id,
                    createdAt: "",
                    updatedAt: "",
                    courseId: courseData?.id || "",
                    title: section.title,
                    description: section.description,
                    order: section.orderIndex,
                    isPublished: true,
                    chapters: (section.chapters ?? []).map((chapter: any) => ({
                        id: chapter.id,
                        createdAt: "",
                        updatedAt: "",
                        sectionId: section.id,
                        title: chapter.title,
                        description: chapter.description,
                        order: chapter.orderIndex,
                        isPublished: true,
                        lessons: (chapter.lessons ?? []).map((lesson: any) => ({
                            id: lesson.id,
                            createdAt: "",
                            updatedAt: "",
                            chapterId: chapter.id,
                            courseId: courseData?.id || "",
                            title: lesson.title,
                            description: lesson.description,
                            type: lesson.type,
                            duration: lesson.duration,
                            order: lesson.orderIndex,
                            isFree: lesson.isFree,
                            isPublished: true,
                            content: lesson.content,
                            materials: (lesson.materials ?? []).map((m: any) => ({
                                id: m.id,
                                lessonId: lesson.id,
                                title: m.title,
                                type: m.type,
                                url: m.url,
                                size: m.size,
                                createdAt: m.createdAt,
                            })),
                        })),
                    })),
                }))
                if (cancelled) return
                setCourseContent(mappedSections)

                // Find first lesson
                if (mappedSections.length > 0 && mappedSections[0].chapters?.length) {
                    const firstChapter = mappedSections[0].chapters[0]
                    if (firstChapter.lessons?.length) {
                        setCurrentLesson(firstChapter.lessons[0])
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Error loading course:", error)
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }
        loadData()
        return () => {
            cancelled = true
        }
    }, [slug, authToken])

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

    // Handle mark complete (optimistic UI + persist to backend when enrolled)
    const handleMarkComplete = async () => {
        if (!currentLesson || savingProgress) return

        const willComplete = !completedLessons.has(currentLesson.id)
        const lessonId = currentLesson.id

        // Optimistic update
        setCompletedLessons((prev) => {
            const next = new Set(prev)
            if (willComplete) {
                next.add(lessonId)
            } else {
                next.delete(lessonId)
            }
            return next
        })

        const token = authToken ?? undefined
        if (!token || !enrollmentId) return

        setSavingProgress(true)
        try {
            await upsertLessonProgress({
                enrollmentId,
                lessonId,
                status: willComplete ? "completed" : "in_progress",
                token,
            })
        } catch (error) {
            console.error("Error saving lesson progress:", error)
            // Roll back optimistic update on failure
            setCompletedLessons((prev) => {
                const next = new Set(prev)
                if (willComplete) {
                    next.delete(lessonId)
                } else {
                    next.add(lessonId)
                }
                return next
            })
        } finally {
            setSavingProgress(false)
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
            <LessonHeader
                course={course}
                currentLessonTitle={currentLesson.title}
                completedLessons={completedLessons.size}
                totalLessons={allLessons.length}
            />

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Sidebar */}
                <div className="relative">
                    {/* Đường line bên phải - luôn hiển thị */}
                    <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px bg-border pointer-events-none" />

                    <aside className={`hidden lg:block bg-card overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "w-12" : "w-80"}`}>
                        <DesktopCourseSidebar
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
                        className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-8 h-8 rounded-full bg-background border-2 border-gray-200 items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-md"
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
                    isOpen={sidebarOpen}
                    onOpenChange={setSidebarOpen}
                />

                {/* Main Video Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Video Player */}
                    <div className="flex-1 min-h-0">
                        {currentLesson.type === "VIDEO" ? (
                            <div className="h-full max-h-[calc(100vh-180px)]">
                                <div className="h-full px-4 pt-4">
                                    {(() => {
                                        const videoSrc = hlsSrc ?? currentLesson.content?.videoUrl
                                        return videoSrc ? (
                                            <HlsPlayer
                                                key={videoSrc}
                                                src={videoSrc}
                                                onEnded={handleVideoEnded}
                                            />
                                        ) : (
                                            <div className="h-full flex items-center justify-center bg-black/90 rounded-lg text-white/70 text-sm">
                                                Video đang được xử lý, vui lòng quay lại sau…
                                            </div>
                                        )
                                    })()}
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
                    <div className="mt-6">
                        <AiLearningPanel lessonId={currentLesson.id} token={authToken} />
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
