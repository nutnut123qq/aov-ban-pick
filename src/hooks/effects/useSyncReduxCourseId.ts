import { useAppDispatch } from "@/redux"
import { useEffect } from "react"
import { useParams, usePathname } from "next/navigation"
import { setCourseId } from "@/redux/slices"

export const useSyncReduxCourseId = () => {
    /** The dispatch. */
    const dispatch = useAppDispatch()
    const pathname = usePathname()
    const params = useParams()
    /** The useEffect to navigate to the course. */
    useEffect(
        () => {
        /** If the pathname is not a course path, set the course id to null. */
            if (pathname.startsWith("/courses/")) {
                dispatch(setCourseId(params.id as string))
            }
        }, [pathname, params.id]
    )
}