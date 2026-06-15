import CommunityDetailFeature from "@/features/community/detail";

export default async function CommunityDetailScreen({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return (
        <CommunityDetailFeature id={id} />
    )
}
