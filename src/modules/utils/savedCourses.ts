/**
 * Client-side "saved/bookmarked courses" stored in localStorage.
 * (No backend bookmark endpoint yet — this keeps the feature usable per browser.)
 */
const KEY = "saved_courses"

export const getSavedCourses = (): string[] => {
    if (typeof window === "undefined") return []
    try {
        const raw = localStorage.getItem(KEY)
        return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
        return []
    }
}

export const isCourseSaved = (courseId: string): boolean =>
    getSavedCourses().includes(courseId)

/** Toggles the bookmark. Returns the new saved state. */
export const toggleSavedCourse = (courseId: string): boolean => {
    if (typeof window === "undefined") return false
    const list = getSavedCourses()
    const idx = list.indexOf(courseId)
    if (idx >= 0) {
        list.splice(idx, 1)
    } else {
        list.push(courseId)
    }
    localStorage.setItem(KEY, JSON.stringify(list))
    return idx < 0
}
