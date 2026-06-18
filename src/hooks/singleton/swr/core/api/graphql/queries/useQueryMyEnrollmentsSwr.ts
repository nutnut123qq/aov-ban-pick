import { queryMyEnrollments } from "@/modules/api"
import { useKeycloak } from "@/hooks/singleton"
import { getAccessToken } from "@/services/auth"
import useSWR from "swr"

/**
 * The core function to query the current user's enrollments with SWR.
 */
export const useQueryMyEnrollmentsSwrCore = () => {
    const keycloak = useKeycloak()
    const swr = useSWR(
        (keycloak.data?.authenticated || Boolean(getAccessToken())) ? ["QUERY_MY_ENROLLMENTS_SWR"] : null,
        async () => {
            const data = await queryMyEnrollments(
                {
                    token: keycloak.data?.token ?? getAccessToken() ?? undefined,
                }
            )
            if (!data || !data.data) {
                throw new Error("Enrollments not found")
            }
            return data.data.myEnrollments
        })
    return swr
}
