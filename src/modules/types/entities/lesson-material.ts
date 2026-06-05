export interface LessonMaterialEntity {
    id: string
    lessonId: string
    title: string
    type: "PDF" | "DOCUMENT" | "IMAGE" | "LINK" | "CODE"
    url: string
    size?: number
    createdAt: string
}
