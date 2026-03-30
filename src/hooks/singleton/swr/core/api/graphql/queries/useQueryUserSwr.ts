import { queryMe } from "@/modules/api"
import { useKeycloak } from "@/hooks/singleton"
import useSWR from "swr"

/**
 * The core function to query courses with SWR.
 */
export const useQueryUserSwrCore = () => {
    const keycloak = useKeycloak()
    /** The SWR. */
    const swr = useSWR(
        keycloak.data?.authenticated ? ["QUERY_USER_SWR"] : null,
        async () => {
            /** The data. */
            const data = await queryMe(
                { 
                    token: keycloak.data?.token,
                }
            )
            /** Return the data. */
            return data.data
        })
    /** Return the SWR. */
    return swr
}
