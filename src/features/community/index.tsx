"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Users, FileText, Search, Plus } from "lucide-react"
import {
    Modal as HeroModal,
    ModalContent,
    useDisclosure,
} from "@heroui/react"

import {
    TedoCard,
    TedoCardBody,
    TedoCardFooter,
    TedoButton,
    TedoInput,
    TedoChip,
    TedoSkeleton,
    TedoSelect,
    TedoSelectItem,
    TedoModalHeader,
    TedoModalBody,
    TedoModalFooter,
} from "@/components/atomic"
import { useKeycloak } from "@/hooks/singleton"
import {
    listCommunities,
    createCommunity,
    joinCommunity,
    type Community,
    type CommunityVisibility,
} from "@/modules/api/rest/community"

const PAGE_SIZE = 12

const visibilityOptions: { key: CommunityVisibility; label: string }[] = [
    { key: "PUBLIC", label: "Công khai" },
    { key: "PRIVATE", label: "Riêng tư" },
    { key: "RESTRICTED", label: "Hạn chế" },
]

const CommunityCard = ({
    community,
    token,
    onChanged,
    onOpen,
}: {
    community: Community
    token: string | null
    onChanged: () => void
    onOpen: () => void
}) => {
    const [joining, setJoining] = useState(false)
    const isActive = community.myStatus === "ACTIVE"
    const isPending = community.myStatus === "PENDING"

    const handleJoin = async () => {
        if (!token || joining || isActive) return
        setJoining(true)
        try {
            await joinCommunity(community.id, token)
            onChanged()
        } catch (err) {
            console.error("join community error", err)
        } finally {
            setJoining(false)
        }
    }

    return (
        <TedoCard
            isPressable
            onPress={onOpen}
            className="w-full h-full"
        >
            <div
                className="h-32 w-full bg-default-200 bg-cover bg-center"
                style={
                    community.coverImageUrl
                        ? { backgroundImage: `url(${community.coverImageUrl})` }
                        : undefined
                }
            />
            <TedoCardBody className="gap-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base line-clamp-1">
                        {community.name}
                    </h3>
                    <TedoChip size="sm" variant="flat">
                        {visibilityOptions.find((v) => v.key === community.visibility)
                            ?.label ?? community.visibility}
                    </TedoChip>
                </div>
                <p className="text-sm text-foreground-500 line-clamp-2 min-h-[2.5rem]">
                    {community.description || "Chưa có mô tả"}
                </p>
                <div className="flex items-center gap-4 text-xs text-foreground-400 mt-1">
                    <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {community.memberCount} thành viên
                    </span>
                    <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {community.postCount} bài viết
                    </span>
                </div>
            </TedoCardBody>
            <TedoCardFooter>
                <TedoButton
                    fullWidth
                    size="sm"
                    color={isActive ? "default" : "primary"}
                    variant={isActive ? "flat" : "solid"}
                    isDisabled={isActive || isPending}
                    isLoading={joining}
                    onPress={handleJoin}
                >
                    {isActive
                        ? "Đã tham gia"
                        : isPending
                            ? "Đang chờ duyệt"
                            : "Tham gia"}
                </TedoButton>
            </TedoCardFooter>
        </TedoCard>
    )
}

const CommunityFeature = () => {
    const router = useRouter()
    const { token } = useKeycloak()
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")

    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
    const [form, setForm] = useState<{
        name: string
        description: string
        visibility: CommunityVisibility
    }>({ name: "", description: "", visibility: "PUBLIC" })
    const [creating, setCreating] = useState(false)

    const { data, error, isLoading, mutate } = useSWR(
        ["communities", page, search, token],
        () => listCommunities(page, PAGE_SIZE, { search }, token),
    )

    const communities = data?.items ?? []

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        setSearch(searchInput.trim())
    }

    const handleCreate = async () => {
        if (!token || !form.name.trim() || creating) return
        setCreating(true)
        try {
            const created = await createCommunity(
                {
                    name: form.name.trim(),
                    description: form.description.trim() || undefined,
                    visibility: form.visibility,
                },
                token,
            )
            onClose()
            setForm({ name: "", description: "", visibility: "PUBLIC" })
            mutate()
            router.push(`/communities/${created.id}`)
        } catch (err) {
            console.error("create community error", err)
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Cộng đồng</h1>
                    <p className="text-sm text-foreground-500">
                        Khám phá, tham gia và chia sẻ cùng cộng đồng học tập.
                    </p>
                </div>
                <TedoButton
                    color="primary"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={onOpen}
                    isDisabled={!token}
                >
                    Tạo cộng đồng
                </TedoButton>
            </div>

            <form onSubmit={handleSearchSubmit} className="mb-6 max-w-md">
                <TedoInput
                    value={searchInput}
                    onValueChange={setSearchInput}
                    placeholder="Tìm kiếm cộng đồng..."
                    startContent={<Search className="w-4 h-4 text-foreground-400" />}
                    isClearable
                    onClear={() => {
                        setSearchInput("")
                        setSearch("")
                        setPage(1)
                    }}
                />
            </form>

            {error ? (
                <div className="text-center py-16 text-danger">
                    Không thể tải danh sách cộng đồng. Vui lòng thử lại.
                </div>
            ) : isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <TedoCard key={i} className="w-full">
                            <TedoSkeleton className="h-32 w-full" />
                            <TedoCardBody className="gap-3">
                                <TedoSkeleton className="h-5 w-3/4 rounded-lg" />
                                <TedoSkeleton className="h-4 w-full rounded-lg" />
                                <TedoSkeleton className="h-8 w-full rounded-lg" />
                            </TedoCardBody>
                        </TedoCard>
                    ))}
                </div>
            ) : communities.length === 0 ? (
                <div className="text-center py-16 text-foreground-500">
                    Không tìm thấy cộng đồng nào.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                    {communities.map((community) => (
                        <CommunityCard
                            key={community.id}
                            community={community}
                            token={token}
                            onChanged={() => mutate()}
                            onOpen={() => router.push(`/communities/${community.id}`)}
                        />
                    ))}
                </div>
            )}

            {data && data.meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <TedoButton
                        size="sm"
                        variant="flat"
                        isDisabled={page <= 1}
                        onPress={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Trước
                    </TedoButton>
                    <span className="text-sm self-center px-2">
                        {page} / {data.meta.totalPages}
                    </span>
                    <TedoButton
                        size="sm"
                        variant="flat"
                        isDisabled={page >= data.meta.totalPages}
                        onPress={() => setPage((p) => p + 1)}
                    >
                        Sau
                    </TedoButton>
                </div>
            )}

            <HeroModal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
                <ModalContent>
                    {() => (
                        <>
                            <TedoModalHeader title="Tạo cộng đồng mới" />
                            <TedoModalBody className="gap-4">
                                <TedoInput
                                    label="Tên cộng đồng"
                                    labelPlacement="outside"
                                    placeholder="Nhập tên cộng đồng"
                                    value={form.name}
                                    onValueChange={(v) =>
                                        setForm((f) => ({ ...f, name: v }))
                                    }
                                    isRequired
                                />
                                <TedoInput
                                    label="Mô tả"
                                    labelPlacement="outside"
                                    placeholder="Mô tả ngắn về cộng đồng"
                                    value={form.description}
                                    onValueChange={(v) =>
                                        setForm((f) => ({ ...f, description: v }))
                                    }
                                />
                                <TedoSelect
                                    label="Quyền riêng tư"
                                    labelPlacement="outside"
                                    selectedKeys={[form.visibility]}
                                    onSelectionChange={(keys) => {
                                        const key = Array.from(keys)[0] as CommunityVisibility
                                        if (key) setForm((f) => ({ ...f, visibility: key }))
                                    }}
                                >
                                    {visibilityOptions.map((opt) => (
                                        <TedoSelectItem key={opt.key}>
                                            {opt.label}
                                        </TedoSelectItem>
                                    ))}
                                </TedoSelect>
                            </TedoModalBody>
                            <TedoModalFooter>
                                <TedoButton variant="flat" onPress={onClose}>
                                    Hủy
                                </TedoButton>
                                <TedoButton
                                    color="primary"
                                    isLoading={creating}
                                    isDisabled={!form.name.trim()}
                                    onPress={handleCreate}
                                >
                                    Tạo
                                </TedoButton>
                            </TedoModalFooter>
                        </>
                    )}
                </ModalContent>
            </HeroModal>
        </div>
    )
}

export default CommunityFeature
