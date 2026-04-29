// Mock API Services - Simulating REST API calls with delays
import type {
    UserEntity,
    CourseEntity,
    CourseCategoryEntity,
    TrainingProgramEntity,
    LearningPathEntity,
    ClassEntity,
    EnrollmentEntity,
    QuizEntity,
    SurveyEntity,
} from "../types"

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Pagination helper
interface PaginationParams {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
    search?: string
}

interface PaginatedResponse<T> {
    data: T[]
    count: number
    page: number
    limit: number
    totalPages: number
}

function paginate<T>(
    items: T[],
    params: PaginationParams
): PaginatedResponse<T> {
    const { page = 1, limit = 10, sortBy, sortOrder = "asc", search } = params

    let filtered = [...items]

    // Filter by search
    if (search) {
        const searchLower = search.toLowerCase()
        filtered = filtered.filter((item: Record<string, unknown>) =>
            Object.values(item).some((val) =>
                String(val).toLowerCase().includes(searchLower)
            )
        )
    }

    // Sort
    if (sortBy) {
        filtered.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const aVal = a[sortBy]
            const bVal = b[sortBy]
            if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
            if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
            return 0
        })
    }

    // Paginate
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedItems = filtered.slice(start, end)

    return {
        data: paginatedItems,
        count: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
    }
}

// ============ AUTH & USER APIs ============

export async function getCurrentUser(): Promise<UserEntity | null> {
    await delay(200)
    const { mockCurrentUser } = await import("../data/users")
    return mockCurrentUser
}

export async function getUsers(params: PaginationParams = {}): Promise<PaginatedResponse<UserEntity>> {
    await delay(300)
    const { mockUsers } = await import("../data/users")
    return paginate(mockUsers, params)
}

export async function getUserById(id: string): Promise<UserEntity | null> {
    await delay(200)
    const { mockUsers } = await import("../data/users")
    return mockUsers.find((u) => u.id === id) || null
}

// ============ COURSE APIs ============

export async function getCourses(params: PaginationParams & { categoryId?: string; status?: string } = {}): Promise<PaginatedResponse<CourseEntity>> {
    await delay(300)
    const { mockCourses } = await import("../data/courses")
    let courses = [...mockCourses]

    if (params.categoryId) {
        courses = courses.filter((c) => c.categoryId === params.categoryId)
    }
    if (params.status) {
        courses = courses.filter((c) => c.status === params.status)
    }

    return paginate(courses, params)
}

export async function getCourseById(id: string): Promise<CourseEntity | null> {
    await delay(200)
    const { mockCourses } = await import("../data/courses")
    return mockCourses.find((c) => c.id === id) || null
}

export async function getCourseBySlug(slug: string): Promise<CourseEntity | null> {
    await delay(200)
    const { mockCourses } = await import("../data/courses")
    return mockCourses.find((c) => c.slug === slug) || null
}

export async function getFeaturedCourses(): Promise<CourseEntity[]> {
    await delay(200)
    const { featuredCourses } = await import("../data/courses")
    return featuredCourses
}

export async function getPopularCourses(limit = 10): Promise<CourseEntity[]> {
    await delay(200)
    const { popularCourses } = await import("../data/courses")
    return popularCourses.slice(0, limit)
}

// ============ CATEGORY APIs ============

export async function getCategories(): Promise<CourseCategoryEntity[]> {
    await delay(200)
    const { mockCourseCategories } = await import("../data/categories")
    return mockCourseCategories
}

export async function getCategoryById(id: string): Promise<CourseCategoryEntity | null> {
    await delay(200)
    const { mockCourseCategories } = await import("../data/categories")
    return mockCourseCategories.find((c) => c.id === id) || null
}

// ============ PROGRAM APIs ============

export async function getPrograms(params: PaginationParams = {}): Promise<PaginatedResponse<TrainingProgramEntity>> {
    await delay(300)
    const { mockPrograms } = await import("../data/programs")
    return paginate(mockPrograms, params)
}

export async function getProgramById(id: string): Promise<TrainingProgramEntity | null> {
    await delay(200)
    const { mockPrograms } = await import("../data/programs")
    return mockPrograms.find((p) => p.id === id) || null
}

export async function getProgramBySlug(slug: string): Promise<TrainingProgramEntity | null> {
    await delay(200)
    const { mockPrograms } = await import("../data/programs")
    return mockPrograms.find((p) => p.slug === slug) || null
}

export async function getLearningPathBySlug(slug: string): Promise<LearningPathEntity | null> {
    await delay(200)
    const { mockLearningPaths } = await import("../data/programs")
    return mockLearningPaths.find((p) => p.slug === slug) || null
}

export async function getLearningPaths(): Promise<LearningPathEntity[]> {
    await delay(200)
    const { mockLearningPaths } = await import("../data/programs")
    return mockLearningPaths
}

// ============ CLASS APIs ============

export async function getClasses(params: PaginationParams & { courseId?: string } = {}): Promise<PaginatedResponse<ClassEntity>> {
    await delay(300)
    const { mockClasses } = await import("../data/classes")
    let classes = [...mockClasses]

    if (params.courseId) {
        classes = classes.filter((c) => c.courseId === params.courseId)
    }

    return paginate(classes, params)
}

export async function getClassById(id: string): Promise<ClassEntity | null> {
    await delay(200)
    const { mockClasses } = await import("../data/classes")
    return mockClasses.find((c) => c.id === id) || null
}

// ============ ENROLLMENT APIs ============

export async function getEnrollments(params: PaginationParams & { userId?: string } = {}): Promise<PaginatedResponse<EnrollmentEntity>> {
    await delay(300)
    const { mockEnrollments } = await import("../data/classes")
    let enrollments = [...mockEnrollments]

    if (params.userId) {
        enrollments = enrollments.filter((e) => e.userId === params.userId)
    }

    return paginate(enrollments, params)
}

export async function getEnrollmentById(id: string): Promise<EnrollmentEntity | null> {
    await delay(200)
    const { mockEnrollments } = await import("../data/classes")
    return mockEnrollments.find((e) => e.id === id) || null
}

export async function getMyEnrollments(): Promise<EnrollmentEntity[]> {
    await delay(300)
    const { mockCurrentUser } = await import("../data/users")
    const { mockEnrollments } = await import("../data/classes")
    return mockEnrollments.filter((e) => e.userId === mockCurrentUser.id)
}

// ============ QUIZ APIs ============

export async function getQuizzes(params: PaginationParams & { courseId?: string } = {}): Promise<PaginatedResponse<QuizEntity>> {
    await delay(300)
    const { mockQuizzes } = await import("../data/quizzes")
    let quizzes = [...mockQuizzes]

    if (params.courseId) {
        quizzes = quizzes.filter((q) => q.courseId === params.courseId)
    }

    return paginate(quizzes, params)
}

export async function getQuizById(id: string): Promise<QuizEntity | null> {
    await delay(200)
    const { mockQuizzes } = await import("../data/quizzes")
    return mockQuizzes.find((q) => q.id === id) || null
}

// ============ SURVEY APIs ============

export async function getSurveys(params: PaginationParams = {}): Promise<PaginatedResponse<SurveyEntity>> {
    await delay(300)
    const { mockSurveys } = await import("../data/quizzes")
    return paginate(mockSurveys, params)
}

export async function getSurveyById(id: string): Promise<SurveyEntity | null> {
    await delay(200)
    const { mockSurveys } = await import("../data/quizzes")
    return mockSurveys.find((s) => s.id === id) || null
}
