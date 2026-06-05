import { queryCourse } from "@/modules/api"
import { useAppDispatch, useAppSelector } from "@/redux"
import { setCourse } from "@/redux/slices"
import useSWR from "swr"

/**
 * The core function to query a single course with SWR.
 */
export const useQueryCourseSwrCore = () => {
    /** The dispatch. */
    const dispatch = useAppDispatch()
    /** The course id. */
    const id = useAppSelector((state) => state.course.id)
    /** The SWR. */
    const swr = useSWR(
        id ? [
            "QUERY_COURSE_SWR",
            id,
        ] : null, 
        async () => {
            /** If the id is not found, throw an error. */
            if (!id) {
                throw new Error("Course id not found")
            }
            /** The data. */
            const data = await queryCourse(
                { 
                    variables: {
                        request: {
                            id,
                        }
                    }
                }
            )
            /** If the data is not found, throw an error. */
            if (!data || !data.data) {
                throw new Error("Course not found")
            }
            /** Set the course. */
            const courseData = data.data as import("@/modules/api/graphql/queries/query-course").QueryCourseResponse
            dispatch(setCourse(courseData.course ?? null))
            /** Return the data. */
            return courseData
        })
    /** Return the SWR. */
    return swr
}
