import { restRequest } from "./client"
import { publicEnv } from "@/resources/env"
import { refreshAccessToken } from "@/services/auth/refreshTokens"

/** Public HLS stream host (proxy playlist — no auth, just the videoId). */
export const STREAM_BASE = "https://stream.ftes.vn"

/** Builds the HLS master playlist URL for a videoId via the stream proxy. */
export const hlsUrlForVideoId = (videoId: string): string =>
    `${STREAM_BASE}/api/videos/proxy/${encodeURIComponent(videoId)}/master.m3u8`

export interface VideoQualities {
    videoId: string
    ready: boolean
    available?: string[]
    originalUrl?: string | null
    "720pUrl"?: string | null
    message?: string
}

/** Resolves a lesson's video id + available HLS qualities (BE proxies upload.ftes.vn). */
export const getVideoQualities = ({
    token,
    lessonId,
}: {
    token: string
    lessonId: string
}) =>
    restRequest<VideoQualities>(`training/videos/lessons/${lessonId}/qualities`, {
        token,
    })

/**
 * HLS source for a lesson via the stream proxy. The original `master.m3u8` is an
 * adaptive manifest (contains every available quality), so the player handles
 * quality switching itself — no need for a `_720p` single-quality variant.
 * The proxy requires a browser Origin/Referer (sent automatically), so we use it
 * rather than the b-cdn URLs (which 403 without signing).
 */
export const resolveLessonHls = (q: VideoQualities): string | null => {
    if (!q.ready || !q.videoId) return null
    return hlsUrlForVideoId(q.videoId)
}

export interface AiLessonNote {
    ready: boolean
    videoId?: string
    lessonId?: string
    note?: unknown
    /** Upstream payload is nested under `data` (e.g. { lesson_note, content, ... }). */
    data?: Record<string, unknown>
    [k: string]: unknown
}

/** Extracts displayable note text from the (nested) AI lesson-note payload. */
export const extractNoteText = (res: AiLessonNote): string => {
    const sources: unknown[] = [
        res.note,
        res.data?.lesson_note,
        res.data?.note,
        res.data?.content,
        res.data?.markdown,
        res.data?.summary,
        res.data?.text,
        res.lesson_note,
        res.content,
        res.markdown,
        res.summary,
    ]
    for (const s of sources) {
        if (typeof s === "string" && s.trim()) return s
    }
    const nested = res.data
    if (nested && typeof nested === "object") {
        // last resort: any long string field in the nested payload
        for (const v of Object.values(nested)) {
            if (typeof v === "string" && v.trim().length > 40) return v
        }
    }
    return ""
}

export const getAiLessonNote = ({
    token,
    lessonId,
}: {
    token: string
    lessonId: string
}) =>
    restRequest<AiLessonNote>(`training/ai/lessons/${lessonId}/lesson-note`, {
        token,
    })

export interface AiFlashcard {
    question?: string
    answer?: string
    front?: string
    back?: string
    term?: string
    definition?: string
    [k: string]: unknown
}

export interface AiFlashcardsResponse {
    ready: boolean
    flashcards?: AiFlashcard[]
    /** Upstream nests the array under `data.flashcards`. */
    data?: { flashcards?: AiFlashcard[] }
    [k: string]: unknown
}

export const getAiFlashcards = ({
    token,
    lessonId,
}: {
    token: string
    lessonId: string
}) =>
    restRequest<AiFlashcardsResponse>(
        `training/ai/lessons/${lessonId}/flashcards`,
        { token },
    )

/** Returns the flashcard array regardless of whether it's top-level or nested. */
export const extractFlashcards = (res: AiFlashcardsResponse): AiFlashcard[] =>
    res.data?.flashcards ?? res.flashcards ?? []

export interface AiChatResponse {
    response?: string
    data?: { response?: string }
    answer?: string
    message?: string
    [k: string]: unknown
}

export const aiChat = ({
    token,
    lessonId,
    message,
    sessionId,
}: {
    token: string
    lessonId: string
    message: string
    sessionId?: string
}) =>
    restRequest<AiChatResponse>("training/ai/chat", {
        token,
        method: "POST",
        body: { lessonId, message, sessionId },
    })

export interface AiStreamHandlers {
    /** Called for each incremental text token. */
    onToken: (text: string) => void
    /** Called for progress/status events ({status, message}). */
    onStatus?: (status: string, message?: string) => void
}

/**
 * Streams an AI answer token-by-token (SSE) from `/training/ai/chat/stream`.
 * The BE proxies `ai.ftes.vn/api/ai/transcript/stream`; events are
 * `data: {"text": "..."}` (token) or `data: {"status": "...", "message": "..."}`.
 */
export const aiChatStream = async (
    {
        token,
        lessonId,
        message,
        sessionId,
    }: { token: string; lessonId: string; message: string; sessionId?: string },
    handlers: AiStreamHandlers,
    signal?: AbortSignal,
): Promise<void> => {
    const base = publicEnv().api.http.replace(/\/$/, "")
    const res = await fetch(`${base}/training/ai/chat/stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Tenant-ID": publicEnv().tenant.id,
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId, message, sessionId }),
        signal,
    })
    if (!res.ok || !res.body) {
        throw new Error(`AI stream failed: ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        let idx: number
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const event = buffer.slice(0, idx)
            buffer = buffer.slice(idx + 2)
            const line = event
                .split("\n")
                .find((l) => l.startsWith("data:"))
            if (!line) continue
            const payload = line.slice(5).trim()
            if (!payload || payload === "[DONE]") continue
            try {
                const obj = JSON.parse(payload) as {
                    text?: string
                    status?: string
                    message?: string
                }
                if (typeof obj.text === "string") {
                    handlers.onToken(obj.text)
                } else if (obj.status) {
                    handlers.onStatus?.(obj.status, obj.message)
                }
            } catch {
                handlers.onToken(payload)
            }
        }
    }
}

/** Extracts the assistant reply text from the (loosely-typed) chat payload. */
export const extractChatReply = (r: AiChatResponse): string =>
    r.data?.response ??
    r.response ??
    r.answer ??
    r.message ??
    "Xin lỗi, chưa có phản hồi."

export interface UploadedImage {
    cdnUrl: string
    fileName?: string
    markdownCode?: string
    [k: string]: unknown
}

/**
 * Uploads an image to the GitHub CDN via the BE (multipart). Returns the
 * jsDelivr `cdnUrl`. Requires instructor/admin training role on the BE.
 */
export const uploadImage = async ({
    token,
    file,
    fileName,
    altText,
}: {
    token: string
    file: File | Blob
    fileName?: string
    altText?: string
}): Promise<UploadedImage> => {
    const base = publicEnv().api.http.replace(/\/$/, "")
    const form = new FormData()
    form.append("file", file)
    if (fileName) form.append("fileName", fileName)
    if (altText) form.append("altText", altText)

    const doFetch = (authToken: string) =>
        fetch(`${base}/training/images/upload`, {
            method: "POST",
            headers: {
                "X-Tenant-ID": publicEnv().tenant.id,
                Authorization: `Bearer ${authToken}`,
            },
            body: form,
        })

    let res = await doFetch(token)
    if (res.status === 401) {
        const fresh = await refreshAccessToken()
        if (fresh) res = await doFetch(fresh)
    }
    if (!res.ok) {
        throw new Error(`Image upload failed: ${res.status}`)
    }
    const json = (await res.json()) as { data?: unknown; result?: unknown }
    // BE may wrap in {data} (RestTransformInterceptor); upstream nests under {result}.
    const payload = (json.data ?? json) as { result?: UploadedImage } & UploadedImage
    return (payload.result ?? payload) as UploadedImage
}
