import { queryCourses } from "@/modules/api"
import { useAppDispatch } from "@/redux"
import { setCourses } from "@/redux/slices"
import useSWR from "swr"

/**
 * The core function to query courses with SWR.
 */
export const useQueryCoursesSwrCore = () => {
    /** The dispatch. */
    const dispatch = useAppDispatch()
    /** The SWR. */
    const swr = useSWR(
        [
            "QUERY_COURSES_SWR",
        ], 
        async () => {
            /** The data. */
            const data = await queryCourses(
                { 
                    variables: {
                        request: {
                            filters: {
                                sorts: [],
                            },
                        },
                    }
                }
            )
            /** If the data is not found, throw an error. */
            if (!data || !data.data) {
                throw new Error("Courses not found")
            }
            /** Set the courses. */
            dispatch(setCourses(data.data.courses.data?.data ?? []))
            /** Return the data. */
            return data.data
        })
    /** Return the SWR. */
    return swr
}
