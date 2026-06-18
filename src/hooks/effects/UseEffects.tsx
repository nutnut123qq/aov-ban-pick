import React from "react"
import { useKeycloakTokenSync } from "@/hooks/useKeycloakTokenSync"
import { useTokenRefresh } from "@/hooks/useTokenRefresh"
import { useSyncReduxCourseId } from "./useSyncReduxCourseId"
import { useSyncReduxUser } from "./useSyncReduxUser"
import { useSyncAuthFromStorage } from "./useSyncAuthFromStorage"

export const UseEffects = () => {
    /** The useEffect to sync the redux course id. */
    useSyncReduxCourseId()
    useSyncReduxUser()
    useKeycloakTokenSync()
    useSyncAuthFromStorage()
    // App-wide auto-refresh of the access token before it expires.
    useTokenRefresh()
    return (
        <></>
    )
}