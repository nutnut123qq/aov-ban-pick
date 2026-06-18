import { restRequest } from "./client"

/** Returns the current user's saved/bookmarked course IDs. */
export const listMyFavorites = async ({
    token,
}: {
    token: string
}): Promise<string[]> => {
    const res = await restRequest<{ courseIds: string[] }>(
        "training/course-favorites",
        { token },
    )
    return res.courseIds ?? []
}

/** Saves (bookmarks) a course. */
export const addFavorite = ({
    token,
    courseId,
}: {
    token: string
    courseId: string
}) =>
    restRequest<{ saved: boolean; courseId: string }>(
        `training/course-favorites/${courseId}`,
        { token, method: "POST", body: {} },
    )

/** Removes a course bookmark. */
export const removeFavorite = ({
    token,
    courseId,
}: {
    token: string
    courseId: string
}) =>
    restRequest<{ saved: boolean; courseId: string }>(
        `training/course-favorites/${courseId}`,
        { token, method: "DELETE" },
    )
