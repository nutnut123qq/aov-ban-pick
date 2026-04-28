// Organization Types
export type OrganizationStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"

export interface OrganizationEntity {
    id: string
    name: string
    slug: string
    description?: string
    logo?: string | null
    website?: string | null
    email?: string | null
    phone?: string | null
    address?: string
    status: OrganizationStatus
    departmentCount?: number
    employeeCount?: number
    createdAt: string
    updatedAt: string
}

export interface DepartmentEntity {
    id: string
    organizationId: string
    name: string
    description?: string
    parentId?: string | null
    managerId?: string | null
    manager?: {
        id: string
        username: string
        email: string
        firstName?: string
        lastName?: string
        avatar?: string | null
    }
    teamCount?: number
    employeeCount?: number
    createdAt: string
    updatedAt: string
}

export interface TeamEntity {
    id: string
    departmentId: string
    name: string
    description?: string
    leaderId?: string | null
    leader?: {
        id: string
        username: string
        email: string
        firstName?: string
        lastName?: string
        avatar?: string | null
    }
    memberCount?: number
    createdAt: string
    updatedAt: string
}

export interface JobPositionEntity {
    id: string
    organizationId: string
    title: string
    description?: string
    departmentId?: string
    level?: string
    salaryRange?: {
        min: number
        max: number
        currency: string
    }
    createdAt: string
    updatedAt: string
}

// Certificate Types
export interface CertificateTemplateEntity {
    id: string
    name: string
    description?: string
    thumbnail?: string | null
    fields: {
        name: string
        type: "TEXT" | "IMAGE" | "DATE" | "QR_CODE"
        x: number
        y: number
        fontSize?: number
        fontFamily?: string
        color?: string
    }[]
    backgroundImage?: string | null
    isDefault: boolean
    createdAt: string
    updatedAt: string
}

export interface CertificateEntity {
    id: string
    templateId: string
    template?: CertificateTemplateEntity
    userId: string
    user?: {
        id: string
        username: string
        email: string
        firstName?: string
        lastName?: string
    }
    courseId?: string
    course?: {
        id: string
        title: string
        slug: string
    }
    classId?: string
    class?: {
        id: string
        title: string
    }
    issuedAt: string
    expiresAt?: string | null
    certificateNumber: string
    status: "VALID" | "REVOKED" | "EXPIRED"
    revokedAt?: string | null
    revokedReason?: string
    createdAt: string
    updatedAt: string
}

// Calendar Types
export interface CalendarEventEntity {
    id: string
    title: string
    description?: string
    type: "CLASS" | "WEBINAR" | "DEADLINE" | "MEETING" | "OTHER"
    startDate: string
    endDate: string
    allDay: boolean
    location?: string
    onlineLink?: string
    courseId?: string
    course?: {
        id: string
        title: string
        slug: string
    }
    classId?: string
    class?: {
        id: string
        title: string
    }
    reminder?: {
        enabled: boolean
        minutesBefore: number
    }
    attendees?: EventAttendeeEntity[]
    createdAt: string
    updatedAt: string
}

export interface EventAttendeeEntity {
    id: string
    eventId: string
    userId: string
    user?: {
        id: string
        username: string
        email: string
        firstName?: string
        lastName?: string
        avatar?: string | null
    }
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE"
    respondedAt?: string | null
}

// Attendance Types
export interface AttendanceSessionEntity {
    id: string
    classId: string
    class?: {
        id: string
        title: string
    }
    title: string
    date: string
    startTime: string
    endTime: string
    location?: string
    onlineLink?: string
    recordCount?: number
    presentCount?: number
    absentCount?: number
    createdAt: string
    updatedAt: string
}

export interface AttendanceRecordEntity {
    id: string
    sessionId: string
    userId: string
    user?: {
        id: string
        username: string
        email: string
        firstName?: string
        lastName?: string
        avatar?: string | null
    }
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
    checkInTime?: string | null
    notes?: string
    createdAt: string
    updatedAt: string
}

// Library Types
export interface LibraryCategoryEntity {
    id: string
    name: string
    description?: string
    icon?: string
    parentId?: string | null
    order: number
    resourceCount: number
    createdAt: string
    updatedAt: string
}

export interface LibraryResourceEntity {
    id: string
    title: string
    description?: string
    categoryId: string
    category?: LibraryCategoryEntity
    type: "DOCUMENT" | "VIDEO" | "AUDIO" | "IMAGE" | "LINK" | "ARCHIVE"
    url: string
    thumbnail?: string | null
    fileSize?: number
    mimeType?: string
    tags?: string[]
    downloadCount: number
    viewCount: number
    isFeatured: boolean
    createdAt: string
    updatedAt: string
}

// Tenant CMS Types
export interface TenantEntity {
    id: string
    name: string
    slug: string
    description?: string
    logo?: string | null
    website?: string | null
    email?: string | null
    phone?: string | null
    address?: string
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
    settings?: Record<string, unknown>
    userCount?: number
    createdAt: string
    updatedAt: string
}

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export interface PostEntity {
    id: string
    title: string
    slug: string
    content: string
    excerpt?: string
    thumbnail?: string | null
    authorId: string
    author?: {
        id: string
        username: string
        email: string
        firstName?: string
        lastName?: string
        avatar?: string | null
    }
    categoryId?: string
    category?: PostCategoryEntity
    tags?: string[]
    status: PostStatus
    publishedAt?: string | null
    viewCount: number
    commentCount: number
    createdAt: string
    updatedAt: string
}

export interface PostCategoryEntity {
    id: string
    name: string
    slug: string
    description?: string
    parentId?: string | null
    order: number
    isActive: boolean
    postCount: number
    createdAt: string
    updatedAt: string
}

export interface WebsiteSettingEntity {
    id: string
    key: string
    value: string | null
    type: "STRING" | "NUMBER" | "BOOLEAN" | "JSON"
    description?: string
    tenantId: string
    createdAt: string
    updatedAt: string
}
