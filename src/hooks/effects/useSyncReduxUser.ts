"use client"

import { useKeycloak } from "@/hooks/singleton"
import { useQueryUserSwr } from "@/hooks/singleton/swr/impls/api/graphql/queries"
import type { QueryMeResponse } from "@/modules/api"
import { userEntityFromKeycloakTokenParsed } from "@/modules/keycloak/userEntityFromTokenParsed"
import { useAppDispatch } from "@/redux/hooks"
import { setAuthenticated, setUser } from "@/redux/slices/user"
import { useEffect } from "react"

/**
 * Mirrors Keycloak session + optional GraphQL `me` into Redux for layouts like the Navbar.
 */
export const useSyncReduxUser = () => {
    const dispatch = useAppDispatch()
    const keycloak = useKeycloak()
    const queryUserSwr = useQueryUserSwr()

    useEffect(() => {
        if (keycloak.isLoading) {
            return
        }

        const inst = keycloak.data
        if (!inst?.authenticated) {
            dispatch(setAuthenticated(false))
            dispatch(setUser(null))
            return
        }

        const base = userEntityFromKeycloakTokenParsed(
            inst.tokenParsed as Parameters<
                typeof userEntityFromKeycloakTokenParsed
            >[0],
        )
        if (!base) {
            dispatch(setAuthenticated(false))
            dispatch(setUser(null))
            return
        }

        const gql = queryUserSwr.data as QueryMeResponse | undefined
        const apiUser = gql?.me?.data?.data ?? null

        if (apiUser?.id) {
            dispatch(
                setUser({
                    ...base,
                    ...apiUser,
                    keycloakId: base.keycloakId,
                    username: apiUser.username || base.username,
                }),
            )
        } else {
            dispatch(setUser(base))
        }
        dispatch(setAuthenticated(true))
    }, [
        keycloak.isLoading,
        keycloak.data,
        keycloak.data?.authenticated,
        keycloak.data?.tokenParsed,
        queryUserSwr.data,
        dispatch,
    ])
}
