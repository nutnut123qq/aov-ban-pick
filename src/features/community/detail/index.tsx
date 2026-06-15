"use client"

import React, { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import {
    ArrowLeft,
    Users,
    Heart,
    MessageCircle,
    Send,
    Image as ImageIcon,
    Pin,
    Lock,
} from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/vi"

import {
    TedoCard,
    TedoCardBody,
    TedoButton,
    TedoInput,
    TedoChip,
    TedoSkeleton,
    TedoSpinner,
    TedoAvatar,
    TedoDivider,
} from "@/components/atomic"
import { Textarea } from "@heroui/react"
import { useKeycloak } from "@/hooks/singleton"
import {
    getCommunity,
    listPosts,
    createPost,
    likePost,
    joinCommunity,
    leaveCommunity,
    listComments,
    createComment,
    likeComment,
    type Community,
    type CommunityPost,
    type CommunityComment,
} from "@/modules/api/rest/community"

dayjs.extend(relativeTime)
dayjs.locale("vi")

const fromNow = (iso: string) => {
    const d = dayjs(iso)
    return d.isValid() ? d.fromNow() : ""
}

// ---------------------------------------------------------------------------
// Threaded comment tree
// ---------------------------------------------------------------------------

interface CommentNode extends CommunityComment {
    children: CommentNode[]
}

const buildCommentTree = (comments: CommunityComment[]): CommentNode[] => {
    const map = new Map<string, CommentNode>()
    const roots: CommentNode[] = []

    comments.forEach((c) => map.set(c.id, { ...c, children: [] }))
    map.forEach((node) => {
        if (node.parentCommentId && map.has(node.parentCommentId)) {
            map.get(node.parentCommentId)!.children.push(node)
        } else {
            roots.push(node)
        }
    })

    const sortByDate = (a: CommentNode, b: CommentNode) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()
    const sortTree = (nodes: CommentNode[]) => {
        nodes.sort(sortByDate)
        nodes.forEach((n) => sortTree(n.children))
    }
    sortTree(roots)
    return roots
}

const CommentItem = ({
    node,
    depth,
    communityId,
    postId,
    token,
    canInteract,
    onReplied,
}: {
    node: CommentNode
    depth: number
    communityId: string
    postId: string
    token: string | null
    canInteract: boolean
    onReplied: () => void
}) => {
    const [liked, setLiked] = useState(node.likedByMe)
    const [likeCount, setLikeCount] = useState(node.likeCount)
    const [liking, setLiking] = useState(false)
    const [showReply, setShowReply] = useState(false)
    const [replyText, setReplyText] = useState("")
    const [replying, setReplying] = useState(false)

    const handleLike = async () => {
        if (!token || liking) return
        const prevLiked = liked
        const prevCount = likeCount
        setLiked(!prevLiked)
        setLikeCount(prevCount + (prevLiked ? -1 : 1))
        setLiking(true)
        try {
            const res = await likeComment(communityId, node.id, token)
            setLiked(res.likedByMe)
            setLikeCount(res.likeCount)
        } catch (err) {
            console.error("like comment error", err)
            setLiked(prevLiked)
            setLikeCount(prevCount)
        } finally {
            setLiking(false)
        }
    }

    const handleReply = async () => {
        if (!token || !replyText.trim() || replying) return
        setReplying(true)
        try {
            await createComment(
                communityId,
                postId,
                { content: replyText.trim(), parentCommentId: node.id },
                token,
            )
            setReplyText("")
            setShowReply(false)
            onReplied()
        } catch (err) {
            console.error("reply error", err)
        } finally {
            setReplying(false)
        }
    }

    return (
        <div
            className={depth > 0 ? "pl-4 border-l border-default-200 ml-3" : ""}
        >
            <div className="flex gap-2 py-2">
                <TedoAvatar
                    size="sm"
                    src={node.authorAvatar ?? undefined}
                    name={node.authorName}
                />
                <div className="flex-1 min-w-0">
                    <div className="bg-default-100 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                                {node.authorName}
                            </span>
                            <span className="text-xs text-foreground-400">
                                {fromNow(node.createdAt)}
                            </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                            {node.content}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 px-2">
                        <button
                            type="button"
                            onClick={handleLike}
                            disabled={!canInteract}
                            className={`flex items-center gap-1 text-xs ${
                                liked ? "text-danger" : "text-foreground-500"
                            } disabled:opacity-50`}
                        >
                            <Heart
                                className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`}
                            />
                            {likeCount > 0 && likeCount}
                            <span>Thích</span>
                        </button>
                        {canInteract && (
                            <button
                                type="button"
                                onClick={() => setShowReply((s) => !s)}
                                className="text-xs text-foreground-500"
                            >
                                Trả lời
                            </button>
                        )}
                    </div>

                    {showReply && (
                        <div className="flex items-end gap-2 mt-2">
                            <TedoInput
                                size="sm"
                                value={replyText}
                                onValueChange={setReplyText}
                                placeholder="Viết trả lời..."
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleReply()
                                    }
                                }}
                            />
                            <TedoButton
                                size="sm"
                                color="primary"
                                isIconOnly
                                isLoading={replying}
                                isDisabled={!replyText.trim()}
                                onPress={handleReply}
                            >
                                <Send className="w-4 h-4" />
                            </TedoButton>
                        </div>
                    )}
                </div>
            </div>

            {node.children.map((child) => (
                <CommentItem
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                    communityId={communityId}
                    postId={postId}
                    token={token}
                    canInteract={canInteract}
                    onReplied={onReplied}
                />
            ))}
        </div>
    )
}

const CommentsSection = ({
    communityId,
    postId,
    token,
    canInteract,
}: {
    communityId: string
    postId: string
    token: string | null
    canInteract: boolean
}) => {
    const { data, isLoading, mutate } = useSWR(
        ["comments", communityId, postId, token],
        () => listComments(communityId, postId, 1, 100, token),
    )
    const [text, setText] = useState("")
    const [posting, setPosting] = useState(false)

    const tree = useMemo(
        () => buildCommentTree(data?.items ?? []),
        [data],
    )

    const handleComment = async () => {
        if (!token || !text.trim() || posting) return
        setPosting(true)
        try {
            await createComment(
                communityId,
                postId,
                { content: text.trim() },
                token,
            )
            setText("")
            mutate()
        } catch (err) {
            console.error("comment error", err)
        } finally {
            setPosting(false)
        }
    }

    return (
        <div className="mt-2">
            <TedoDivider className="my-2" />
            {canInteract && (
                <div className="flex items-end gap-2 mb-3">
                    <TedoInput
                        size="sm"
                        value={text}
                        onValueChange={setText}
                        placeholder="Viết bình luận..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleComment()
                            }
                        }}
                    />
                    <TedoButton
                        size="sm"
                        color="primary"
                        isIconOnly
                        isLoading={posting}
                        isDisabled={!text.trim()}
                        onPress={handleComment}
                    >
                        <Send className="w-4 h-4" />
                    </TedoButton>
                </div>
            )}

            {isLoading ? (
                <div className="py-4 flex justify-center">
                    <TedoSpinner size="sm" />
                </div>
            ) : tree.length === 0 ? (
                <p className="text-sm text-foreground-400 py-2">
                    Chưa có bình luận nào.
                </p>
            ) : (
                <div>
                    {tree.map((node) => (
                        <CommentItem
                            key={node.id}
                            node={node}
                            depth={0}
                            communityId={communityId}
                            postId={postId}
                            token={token}
                            canInteract={canInteract}
                            onReplied={() => mutate()}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

const PostCard = ({
    post,
    communityId,
    token,
    canInteract,
}: {
    post: CommunityPost
    communityId: string
    token: string | null
    canInteract: boolean
}) => {
    const [liked, setLiked] = useState(post.likedByMe)
    const [likeCount, setLikeCount] = useState(post.likeCount)
    const [liking, setLiking] = useState(false)
    const [showComments, setShowComments] = useState(false)

    const handleLike = async () => {
        if (!token || liking) return
        const prevLiked = liked
        const prevCount = likeCount
        setLiked(!prevLiked)
        setLikeCount(prevCount + (prevLiked ? -1 : 1))
        setLiking(true)
        try {
            const res = await likePost(communityId, post.id, token)
            setLiked(res.likedByMe)
            setLikeCount(res.likeCount)
        } catch (err) {
            console.error("like post error", err)
            setLiked(prevLiked)
            setLikeCount(prevCount)
        } finally {
            setLiking(false)
        }
    }

    return (
        <TedoCard className="w-full">
            <TedoCardBody className="gap-3">
                <div className="flex items-center gap-3">
                    <TedoAvatar
                        src={post.authorAvatar ?? undefined}
                        name={post.authorName}
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                                {post.authorName}
                            </span>
                            {post.isPinned && (
                                <Pin className="w-3.5 h-3.5 text-warning" />
                            )}
                            {post.isLocked && (
                                <Lock className="w-3.5 h-3.5 text-foreground-400" />
                            )}
                        </div>
                        <span className="text-xs text-foreground-400">
                            {fromNow(post.createdAt)}
                        </span>
                    </div>
                </div>

                {post.title && (
                    <h3 className="font-semibold text-base">{post.title}</h3>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">
                    {post.content}
                </p>

                {post.media?.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {post.media.map((m, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={i}
                                src={m.fileUrl}
                                alt=""
                                className="rounded-lg w-full max-h-80 object-cover"
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-6 text-foreground-500">
                    <button
                        type="button"
                        onClick={handleLike}
                        disabled={!canInteract}
                        className={`flex items-center gap-1.5 text-sm ${
                            liked ? "text-danger" : ""
                        } disabled:opacity-50`}
                    >
                        <Heart
                            className={`w-4 h-4 ${liked ? "fill-current" : ""}`}
                        />
                        {likeCount} Thích
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowComments((s) => !s)}
                        className="flex items-center gap-1.5 text-sm"
                    >
                        <MessageCircle className="w-4 h-4" />
                        {post.commentCount} Bình luận
                    </button>
                </div>

                {showComments && (
                    <CommentsSection
                        communityId={communityId}
                        postId={post.id}
                        token={token}
                        canInteract={canInteract}
                    />
                )}
            </TedoCardBody>
        </TedoCard>
    )
}

const PostComposer = ({
    communityId,
    token,
    onPosted,
}: {
    communityId: string
    token: string | null
    onPosted: () => void
}) => {
    const [content, setContent] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [showImage, setShowImage] = useState(false)
    const [posting, setPosting] = useState(false)

    const handlePost = async () => {
        if (!token || !content.trim() || posting) return
        setPosting(true)
        try {
            await createPost(
                communityId,
                {
                    content: content.trim(),
                    mediaUrls: imageUrl.trim() ? [imageUrl.trim()] : undefined,
                },
                token,
            )
            setContent("")
            setImageUrl("")
            setShowImage(false)
            onPosted()
        } catch (err) {
            console.error("create post error", err)
        } finally {
            setPosting(false)
        }
    }

    return (
        <TedoCard className="w-full mb-4">
            <TedoCardBody className="gap-3">
                <Textarea
                    value={content}
                    onValueChange={setContent}
                    placeholder="Bạn đang nghĩ gì?"
                    minRows={2}
                />
                {showImage && (
                    <TedoInput
                        size="sm"
                        value={imageUrl}
                        onValueChange={setImageUrl}
                        placeholder="Dán đường dẫn ảnh (URL)..."
                        startContent={
                            <ImageIcon className="w-4 h-4 text-foreground-400" />
                        }
                    />
                )}
                <div className="flex items-center justify-between">
                    <TedoButton
                        size="sm"
                        variant="light"
                        startContent={<ImageIcon className="w-4 h-4" />}
                        onPress={() => setShowImage((s) => !s)}
                    >
                        Ảnh
                    </TedoButton>
                    <TedoButton
                        color="primary"
                        size="sm"
                        isLoading={posting}
                        isDisabled={!content.trim()}
                        onPress={handlePost}
                    >
                        Đăng bài
                    </TedoButton>
                </div>
            </TedoCardBody>
        </TedoCard>
    )
}

const CommunityDetailFeature = ({ id: idProp }: { id?: string } = {}) => {
    const router = useRouter()
    const params = useParams()
    const id = idProp ?? (params.id as string)
    const { token } = useKeycloak()
    const [membershipBusy, setMembershipBusy] = useState(false)

    const {
        data: community,
        isLoading: loadingCommunity,
        error: communityError,
        mutate: mutateCommunity,
    } = useSWR<Community>(["community", id, token], () => getCommunity(id, token))

    const {
        data: postsData,
        isLoading: loadingPosts,
        mutate: mutatePosts,
    } = useSWR(["posts", id, token], () => listPosts(id, { page: 1, size: 20 }, token))

    const isMember = community?.myStatus === "ACTIVE"
    const isPending = community?.myStatus === "PENDING"
    const posts = postsData?.items ?? []

    const handleMembership = async () => {
        if (!token || membershipBusy || !community) return
        setMembershipBusy(true)
        try {
            if (isMember) {
                await leaveCommunity(id, token)
            } else {
                await joinCommunity(id, token)
            }
            mutateCommunity()
        } catch (err) {
            console.error("membership error", err)
        } finally {
            setMembershipBusy(false)
        }
    }

    if (loadingCommunity) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <TedoSkeleton className="h-40 w-full rounded-xl mb-4" />
                <TedoSkeleton className="h-6 w-1/2 rounded-lg mb-2" />
                <TedoSkeleton className="h-4 w-3/4 rounded-lg" />
            </div>
        )
    }

    if (communityError || !community) {
        return (
            <div className="container mx-auto px-4 py-16 text-center text-foreground-500">
                <p>Không tìm thấy cộng đồng.</p>
                <TedoButton
                    className="mt-4"
                    variant="flat"
                    startContent={<ArrowLeft className="w-4 h-4" />}
                    onPress={() => router.push("/communities")}
                >
                    Quay lại
                </TedoButton>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-3xl">
            <TedoButton
                size="sm"
                variant="light"
                startContent={<ArrowLeft className="w-4 h-4" />}
                className="mb-3"
                onPress={() => router.push("/communities")}
            >
                Cộng đồng
            </TedoButton>

            <TedoCard className="w-full mb-4">
                <div
                    className="h-40 w-full bg-default-200 bg-cover bg-center"
                    style={
                        community.coverImageUrl
                            ? { backgroundImage: `url(${community.coverImageUrl})` }
                            : undefined
                    }
                />
                <TedoCardBody className="gap-2">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold">{community.name}</h1>
                            <p className="text-sm text-foreground-500 mt-1">
                                {community.description || "Chưa có mô tả"}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-foreground-400 mt-2">
                                <Users className="w-3.5 h-3.5" />
                                {community.memberCount} thành viên
                            </div>
                        </div>
                        <TedoButton
                            size="sm"
                            color={isMember ? "default" : "primary"}
                            variant={isMember ? "flat" : "solid"}
                            isLoading={membershipBusy}
                            isDisabled={isPending}
                            onPress={handleMembership}
                        >
                            {isMember
                                ? "Rời nhóm"
                                : isPending
                                    ? "Đang chờ duyệt"
                                    : "Tham gia"}
                        </TedoButton>
                    </div>
                </TedoCardBody>
            </TedoCard>

            {isMember ? (
                <PostComposer
                    communityId={id}
                    token={token}
                    onPosted={() => mutatePosts()}
                />
            ) : (
                <TedoCard className="w-full mb-4">
                    <TedoCardBody>
                        <p className="text-sm text-foreground-500 text-center">
                            {isPending
                                ? "Yêu cầu tham gia của bạn đang chờ duyệt."
                                : "Tham gia cộng đồng để đăng bài và bình luận."}
                        </p>
                    </TedoCardBody>
                </TedoCard>
            )}

            {loadingPosts ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <TedoCard key={i} className="w-full">
                            <TedoCardBody className="gap-3">
                                <div className="flex items-center gap-3">
                                    <TedoSkeleton className="h-10 w-10 rounded-full" />
                                    <TedoSkeleton className="h-4 w-32 rounded-lg" />
                                </div>
                                <TedoSkeleton className="h-4 w-full rounded-lg" />
                                <TedoSkeleton className="h-4 w-2/3 rounded-lg" />
                            </TedoCardBody>
                        </TedoCard>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 text-foreground-400">
                    Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            communityId={id}
                            token={token}
                            canInteract={isMember}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default CommunityDetailFeature
