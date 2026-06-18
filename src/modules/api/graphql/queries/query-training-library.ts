import { createApolloClient } from "../clients"
import { gql } from "@apollo/client"

/** Library category (matches backend `toLibraryCategoryResponse`). */
export interface LibraryCategory {
    id: string
    parentId: string | null
    code: string | null
    name: string
    description: string | null
    sortOrder: number
    isActive: boolean
}

/** Library resource (matches backend `toLibraryResourceResponse`). */
export interface LibraryResource {
    id: string
    categoryId: string | null
    code: string | null
    title: string
    description: string | null
    resourceType: string
    fileUrl: string | null
    externalUrl: string | null
    fileSize: string | null
    mimeType: string | null
    durationSeconds: number | null
    thumbnailUrl: string | null
    isPublic: boolean
    createdAt: string
}

interface CategoriesEnvelope {
    items: LibraryCategory[]
}

interface ResourcesEnvelope {
    items: LibraryResource[]
    meta: { page: number; size: number; total: number; totalPages: number }
}

const queryCategories = gql`
  query TrainingLibraryCategoriesList($query: JSON) {
    trainingLibraryCategoriesList(query: $query)
  }
`

const queryResources = gql`
  query TrainingLibraryResourcesList($query: JSON) {
    trainingLibraryResourcesList(query: $query)
  }
`

interface CategoriesData {
    trainingLibraryCategoriesList: CategoriesEnvelope | null
}

interface ResourcesData {
    trainingLibraryResourcesList: ResourcesEnvelope | null
}

/** Lists active library categories. */
export const listLibraryCategories = async ({
    token,
}: {
    token: string
}): Promise<LibraryCategory[]> => {
    const apollo = createApolloClient({ auth: true, cache: false, token })
    const res = await apollo.query<CategoriesData>({
        query: queryCategories,
        variables: {
            query: { isActive: true, size: 100, sortBy: "sortOrder", sortDir: "asc" },
        },
    })
    return res.data?.trainingLibraryCategoriesList?.items ?? []
}

/** Lists library resources, optionally filtered by category. */
export const listLibraryResources = async ({
    token,
    categoryId,
    page = 0,
    size = 60,
}: {
    token: string
    categoryId?: string
    page?: number
    size?: number
}): Promise<LibraryResource[]> => {
    const apollo = createApolloClient({ auth: true, cache: false, token })
    const res = await apollo.query<ResourcesData>({
        query: queryResources,
        variables: {
            query: { categoryId, page, size, sortBy: "createdAt", sortDir: "desc" },
        },
    })
    return res.data?.trainingLibraryResourcesList?.items ?? []
}
