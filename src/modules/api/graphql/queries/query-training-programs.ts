import type {
    LearningPathEntity,
    TrainingProgramEntity,
} from "@/modules/types"
import { createApolloClient } from "../clients"
import { DocumentNode, gql } from "@apollo/client"

const queryProgramsList = gql`
  query TrainingProgramsList($query: JSON) {
    trainingProgramsList(query: $query)
  }
`

const queryProgramGet = gql`
  query TrainingProgramGet($id: String!) {
    trainingProgramGet(id: $id)
  }
`

const queryProgramCurriculum = gql`
  query TrainingProgramCurriculumList($programId: String!) {
    trainingProgramCurriculumList(programId: $programId)
  }
`

const queryLearningPathsList = gql`
  query TrainingLearningPathsList($query: JSON) {
    trainingLearningPathsList(query: $query)
  }
`

const queryLearningPathGet = gql`
  query TrainingLearningPathGet($id: String!) {
    trainingLearningPathGet(id: $id)
  }
`

const queryLearningPathCourses = gql`
  query TrainingLearningPathCoursesList($pathId: String!) {
    trainingLearningPathCoursesList(pathId: $pathId)
  }
`

/** Lightweight course list used to enrich curriculum/path items (which only carry courseId). */
const queryCoursesLite = gql`
  query CoursesLite($request: CoursesRequestInput!) {
    courses(request: $request) {
      data {
        id
        title
        slug
        thumbnailUrl
        estimatedMinutes
      }
    }
  }
`

interface CourseLite {
    id: string
    title: string | null
    slug: string | null
    thumbnailUrl: string | null
    estimatedMinutes: number | null
}

interface CoursesLiteData {
    courses: { data: CourseLite[] }
}

type EnrichedCourse = {
    id: string
    title: string
    slug: string
    thumbnail?: string | null
    duration: number
    instructorIds: string[]
}

/** Fetches all courses once and returns a `courseId → course` lookup for enrichment. */
const fetchCourseMap = async (
    apollo: ReturnType<typeof createApolloClient>,
): Promise<Map<string, EnrichedCourse>> => {
    try {
        const res = await apollo.query<CoursesLiteData>({
            query: queryCoursesLite,
            variables: { request: { page: 0, size: 500, filters: {} } },
        })
        const map = new Map<string, EnrichedCourse>()
        for (const c of res.data?.courses?.data ?? []) {
            map.set(c.id, {
                id: c.id,
                title: c.title ?? "Khóa học",
                slug: c.slug ?? c.id,
                thumbnail: c.thumbnailUrl,
                duration: c.estimatedMinutes ?? 0,
                instructorIds: [],
            })
        }
        return map
    } catch {
        return new Map()
    }
}

export enum QueryTrainingPrograms {
    ProgramsList = "programsList",
    ProgramGet = "programGet",
    ProgramCurriculum = "programCurriculum",
    LearningPathsList = "learningPathsList",
    LearningPathGet = "learningPathGet",
    LearningPathCourses = "learningPathCourses",
}

const queryMap: Record<QueryTrainingPrograms, DocumentNode> = {
    [QueryTrainingPrograms.ProgramsList]: queryProgramsList,
    [QueryTrainingPrograms.ProgramGet]: queryProgramGet,
    [QueryTrainingPrograms.ProgramCurriculum]: queryProgramCurriculum,
    [QueryTrainingPrograms.LearningPathsList]: queryLearningPathsList,
    [QueryTrainingPrograms.LearningPathGet]: queryLearningPathGet,
    [QueryTrainingPrograms.LearningPathCourses]: queryLearningPathCourses,
}

interface TrainingProgramsListData {
    trainingProgramsList: {
        items?: RawTrainingProgram[]
    }
}

interface TrainingProgramGetData {
    trainingProgramGet: RawTrainingProgram | null
}

interface TrainingProgramCurriculumData {
    trainingProgramCurriculumList: {
        items?: RawCurriculumCourse[]
    }
}

interface TrainingLearningPathsListData {
    trainingLearningPathsList: {
        items?: RawLearningPath[]
    }
}

interface TrainingLearningPathGetData {
    trainingLearningPathGet: RawLearningPath | null
}

interface TrainingLearningPathCoursesData {
    trainingLearningPathCoursesList: {
        items?: RawLearningPathCourse[]
    }
}

interface RawTrainingProgram {
    id: string
    code?: string | null
    name?: string | null
    description?: string | null
    status?: string | null
    thumbnailUrl?: string | null
    publishedAt?: string | null
    createdAt?: string | null
    updatedAt?: string | null
}

interface RawCurriculumCourse {
    id: string
    programId: string
    courseId: string
    sequenceNo?: number | null
    isRequired?: boolean | null
}

interface RawLearningPath {
    id: string
    code?: string | null
    name?: string | null
    description?: string | null
    programId?: string | null
    createdAt?: string | null
    updatedAt?: string | null
}

interface RawLearningPathCourse {
    id: string
    courseId: string
    sequenceNo?: number | null
}

const mapProgram = (
    program: RawTrainingProgram,
    curriculumItems: TrainingProgramEntity["curriculumItems"] = []
): TrainingProgramEntity => ({
    id: program.id,
    createdAt: program.createdAt ?? "",
    updatedAt: program.updatedAt ?? "",
    title: program.name ?? program.code ?? "Chương trình đào tạo",
    description: program.description ?? undefined,
    shortDescription: program.description ?? undefined,
    slug: program.id,
    thumbnail: program.thumbnailUrl ?? null,
    price: 0,
    currency: "VND",
    duration: 0,
    curriculumItems,
    status: program.status ?? "draft",
    enrollmentCount: 0,
    courseCount: curriculumItems.length,
    isFeatured: false,
    publishedAt: program.publishedAt ?? null,
})

const mapLearningPath = (
    path: RawLearningPath,
    courses: LearningPathEntity["courses"] = []
): LearningPathEntity => ({
    id: path.id,
    title: path.name ?? path.code ?? "Learning path",
    slug: path.id,
    description: path.description ?? undefined,
    thumbnail: null,
    courses,
    status: "active",
    enrollmentCount: 0,
    order: 0,
    courseCount: courses.length,
    createdAt: path.createdAt ?? "",
    updatedAt: path.updatedAt ?? "",
})

const mapCurriculum = (
    items: RawCurriculumCourse[],
    courseMap: Map<string, EnrichedCourse> = new Map(),
): TrainingProgramEntity["curriculumItems"] =>
    items.map((item) => ({
        id: item.id,
        programId: item.programId,
        courseId: item.courseId,
        course: courseMap.get(item.courseId),
        order: item.sequenceNo ?? 0,
        isRequired: item.isRequired ?? false,
        estimatedDuration: courseMap.get(item.courseId)?.duration ?? 0,
    }))

export interface QueryTrainingProgramsParams {
    token: string
    page?: number
    size?: number
}

export const queryTrainingPrograms = async ({
    token,
    page = 0,
    size = 20,
}: QueryTrainingProgramsParams) => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    const res = await apollo.query<TrainingProgramsListData>({
        query: queryMap[QueryTrainingPrograms.ProgramsList],
        variables: {
            query: {
                page,
                size,
            },
        },
    })

    return (res.data?.trainingProgramsList.items ?? []).map((program) => mapProgram(program))
}

export const queryTrainingProgram = async ({
    id,
    token,
}: {
    id: string
    token: string
}) => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    const [programRes, curriculumRes, courseMap] = await Promise.all([
        apollo.query<TrainingProgramGetData>({
            query: queryMap[QueryTrainingPrograms.ProgramGet],
            variables: { id },
        }),
        apollo.query<TrainingProgramCurriculumData>({
            query: queryMap[QueryTrainingPrograms.ProgramCurriculum],
            variables: { programId: id },
        }),
        fetchCourseMap(apollo),
    ])

    const program = programRes.data?.trainingProgramGet
    if (!program) return null

    return mapProgram(
        program,
        mapCurriculum(
            curriculumRes.data?.trainingProgramCurriculumList.items ?? [],
            courseMap,
        )
    )
}

export const queryTrainingLearningPaths = async ({
    token,
    page = 0,
    size = 20,
}: QueryTrainingProgramsParams) => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    const res = await apollo.query<TrainingLearningPathsListData>({
        query: queryMap[QueryTrainingPrograms.LearningPathsList],
        variables: {
            query: {
                page,
                size,
            },
        },
    })

    return (res.data?.trainingLearningPathsList.items ?? []).map((path) => mapLearningPath(path))
}

export const queryTrainingLearningPath = async ({
    id,
    token,
}: {
    id: string
    token: string
}) => {
    const apollo = createApolloClient({
        auth: true,
        cache: false,
        token,
    })

    const [pathRes, coursesRes, courseMap] = await Promise.all([
        apollo.query<TrainingLearningPathGetData>({
            query: queryMap[QueryTrainingPrograms.LearningPathGet],
            variables: { id },
        }),
        apollo.query<TrainingLearningPathCoursesData>({
            query: queryMap[QueryTrainingPrograms.LearningPathCourses],
            variables: { pathId: id },
        }),
        fetchCourseMap(apollo),
    ])

    const path = pathRes.data?.trainingLearningPathGet
    if (!path) return null

    const courses = (coursesRes.data?.trainingLearningPathCoursesList.items ?? []).map((item) => {
        const c = courseMap.get(item.courseId)
        return {
            id: item.courseId,
            title: c?.title ?? "Khóa học",
            slug: c?.slug ?? item.courseId,
            duration: c?.duration ?? 0,
        }
    })

    return mapLearningPath(path, courses)
}
