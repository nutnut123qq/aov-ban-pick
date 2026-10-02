"use client"

import { useParams } from "next/navigation"

import { TeamProfileView } from "@/features/team-profile"

/** Route mỏng /[locale]/teams/[id] — toàn bộ logic nằm trong TeamProfileView. */
const TeamProfilePage = () => {
    const params = useParams<{ id: string }>()
    return <TeamProfileView teamId={params.id} />
}

export default TeamProfilePage
