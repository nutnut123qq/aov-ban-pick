export interface CourseCategoryEntity {
    id: string
    name: string
    slug: string | null
    description?: string
    icon?: string
    parentId?: string | null
    order: number
    isActive: boolean
    courseCount: number
    createdAt: string
    updatedAt: string
}
