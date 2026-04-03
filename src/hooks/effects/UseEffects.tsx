import React from "react"
import { useKeycloakTokenSync } from "@/hooks/useKeycloakTokenSync"
import { useSyncReduxCourseId } from "./useSyncReduxCourseId"
import { useSyncReduxUser } from "./useSyncReduxUser"

export const UseEffects = () => {
    /** The useEffect to sync the redux course id. */
    useSyncReduxCourseId()
    useSyncReduxUser()
    useKeycloakTokenSync()
    return (
        <></>
    )
}