
import { useKeycloak } from "@/hooks/singleton/keycloak"
import { getAccessToken } from "@/services/auth"
import {
    mutateCourseEnroll,
    type MutateCourseEnrollVariables,
} from "@/modules/api"

import useSWRMutation from "swr/mutation"

type MutateCourseEnrollResult = Awaited<ReturnType<typeof mutateCourseEnroll>>

/**
 * SWR mutation wrapper for {@link mutateCourseEnroll} (Bearer from Keycloak).
 */
export const useMutateCourseEnrollSwrCore = () => {
    const keycloak = useKeycloak()
    /** The SWR mutation. */
    const swr = useSWRMutation<
        MutateCourseEnrollResult,
        Error,
        string,
        MutateCourseEnrollVariables
    >(
        "MUTATE_COURSE_ENROLL_SWR",
        async (_key, { arg }) => {
            const token = keycloak.data?.token ?? getAccessToken()
            if (!token) {
                throw new Error("Not authenticated")
            }
            return mutateCourseEnroll({
                variables: arg,
                token,
            })
        }
    )
    /** Return the SWR mutation. */
    return swr
}
