// Mock Course Content (Sections, Chapters, Lessons)
import type { CourseSectionEntity, CourseChapterEntity, LessonEntity, LessonMaterialEntity } from "../types/course"

export const mockCourseSections: CourseSectionEntity[] = [
    {
        id: "section-001",
        courseId: "course-001",
        title: "Getting Started with Fullstack Development",
        description: "Introduction to the course and development environment setup",
        order: 1,
        isPublished: true,
        chapters: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "section-002",
        courseId: "course-001",
        title: "Frontend Development with React",
        description: "Building user interfaces with React",
        order: 2,
        isPublished: true,
        chapters: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "section-003",
        courseId: "course-001",
        title: "Backend Development with Node.js",
        description: "Server-side development with Node.js and Express",
        order: 3,
        isPublished: true,
        chapters: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
]

export const mockCourseChapters: CourseChapterEntity[] = [
    {
        id: "chapter-001",
        sectionId: "section-001",
        title: "Introduction to Fullstack",
        description: "Understanding the fullstack development landscape",
        order: 1,
        isPublished: true,
        lessons: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "chapter-002",
        sectionId: "section-001",
        title: "Development Environment Setup",
        description: "Setting up your development environment",
        order: 2,
        isPublished: true,
        lessons: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "chapter-003",
        sectionId: "section-002",
        title: "React Fundamentals",
        description: "Core concepts of React",
        order: 1,
        isPublished: true,
        lessons: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "chapter-004",
        sectionId: "section-002",
        title: "State Management",
        description: "Managing state with useState and Context",
        order: 2,
        isPublished: true,
        lessons: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "chapter-005",
        sectionId: "section-003",
        title: "Node.js Basics",
        description: "Getting started with Node.js",
        order: 1,
        isPublished: true,
        lessons: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
]

export const mockLessons: LessonEntity[] = [
    {
        id: "lesson-001",
        chapterId: "chapter-001",
        courseId: "course-001",
        title: "What is Fullstack Development?",
        description: "Understanding the fullstack development role and responsibilities",
        type: "VIDEO",
        duration: 900, // 15 minutes
        order: 1,
        isFree: true,
        isPublished: true,
        content: {
            videoUrl: "https://example.com/videos/fullstack-intro.mp4",
        },
        materials: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "lesson-002",
        chapterId: "chapter-001",
        courseId: "course-001",
        title: "Fullstack Tech Stack Overview",
        description: "Overview of technologies used in fullstack development",
        type: "TEXT",
        order: 2,
        isFree: true,
        isPublished: true,
        content: {
            textContent: `
# Fullstack Tech Stack Overview

A fullstack developer works with various technologies across the entire web application stack.

## Frontend Technologies
- HTML, CSS, JavaScript
- React, Vue, Angular
- Tailwind CSS, SCSS

## Backend Technologies
- Node.js, Express
- Python, Django, Flask
- Java, Spring Boot
- Go, Fiber

## Database
- PostgreSQL, MySQL
- MongoDB
- Redis

## DevOps & Cloud
- Docker, Kubernetes
- AWS, GCP, Azure
- CI/CD Pipelines
            `,
        },
        materials: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "lesson-003",
        chapterId: "chapter-002",
        courseId: "course-001",
        title: "Installing Node.js and npm",
        description: "Step-by-step guide to install Node.js and npm",
        type: "VIDEO",
        duration: 600, // 10 minutes
        order: 1,
        isFree: false,
        isPublished: true,
        content: {
            videoUrl: "https://example.com/videos/install-nodejs.mp4",
        },
        materials: [
            {
                id: "mat-001",
                lessonId: "lesson-003",
                title: "Node.js Installation Guide.pdf",
                type: "PDF",
                url: "https://example.com/materials/nodejs-guide.pdf",
                size: 1024000,
                createdAt: "2024-01-10T00:00:00.000Z",
            },
        ],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "lesson-004",
        chapterId: "chapter-002",
        courseId: "course-001",
        title: "VS Code Setup",
        description: "Configuring VS Code for fullstack development",
        type: "VIDEO",
        duration: 720, // 12 minutes
        order: 2,
        isFree: false,
        isPublished: true,
        content: {
            videoUrl: "https://example.com/videos/vscode-setup.mp4",
        },
        materials: [
            {
                id: "mat-002",
                lessonId: "lesson-004",
                title: "VS Code Extensions List",
                type: "LINK",
                url: "https://example.com/resources/vscode-extensions",
                createdAt: "2024-01-10T00:00:00.000Z",
            },
        ],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "lesson-005",
        chapterId: "chapter-003",
        courseId: "course-001",
        title: "React Component Basics",
        description: "Understanding React components and JSX",
        type: "VIDEO",
        duration: 1200, // 20 minutes
        order: 1,
        isFree: false,
        isPublished: true,
        content: {
            videoUrl: "https://example.com/videos/react-basics.mp4",
        },
        materials: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "lesson-006",
        chapterId: "chapter-003",
        courseId: "course-001",
        title: "React Components Quiz",
        description: "Test your knowledge of React components",
        type: "QUIZ",
        duration: 600, // 10 minutes
        order: 2,
        isFree: false,
        isPublished: true,
        content: {
            quizId: "quiz-002",
        },
        materials: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "lesson-007",
        chapterId: "chapter-004",
        courseId: "course-001",
        title: "Understanding useState Hook",
        description: "Managing local state with useState",
        type: "VIDEO",
        duration: 900, // 15 minutes
        order: 1,
        isFree: false,
        isPublished: true,
        content: {
            videoUrl: "https://example.com/videos/usestate-hook.mp4",
        },
        materials: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
    {
        id: "lesson-008",
        chapterId: "chapter-005",
        courseId: "course-001",
        title: "Introduction to Node.js",
        description: "Getting started with Node.js runtime",
        type: "VIDEO",
        duration: 1080, // 18 minutes
        order: 1,
        isFree: false,
        isPublished: true,
        content: {
            videoUrl: "https://example.com/videos/nodejs-intro.mp4",
        },
        materials: [],
        createdAt: "2024-01-10T00:00:00.000Z",
        updatedAt: "2024-01-10T00:00:00.000Z",
    },
]

// Helper function to build course content structure
export const buildCourseContent = () => {
    const sections = [...mockCourseSections]
    
    sections.forEach((section) => {
        section.chapters = mockCourseChapters.filter((ch) => ch.sectionId === section.id)
        section.chapters.forEach((chapter) => {
            chapter.lessons = mockLessons.filter((les) => les.chapterId === chapter.id)
        })
    })
    
    return sections
}

export const getCourseContent = () => buildCourseContent()
