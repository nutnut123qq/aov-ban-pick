"use client"

import React, { useEffect, useRef, useState } from "react"
import {
    Sparkles,
    NotebookPen,
    Layers,
    MessageCircle,
    RefreshCw,
    Send,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    getAiLessonNote,
    getAiFlashcards,
    aiChat,
    aiChatStream,
    extractChatReply,
    extractNoteText,
    extractFlashcards,
    type AiFlashcard,
} from "@/modules/api"

const looksLikeHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s)

// ── Lesson note tab ─────────────────────────────────────────
const NoteTab = ({ lessonId, token }: { lessonId: string; token: string }) => {
    const [loading, setLoading] = useState(true)
    const [ready, setReady] = useState(false)
    const [text, setText] = useState("")

    const load = React.useCallback(async () => {
        setLoading(true)
        try {
            const res = await getAiLessonNote({ token, lessonId })
            setReady(!!res.ready)
            setText(extractNoteText(res))
        } catch {
            setReady(false)
            setText("")
        } finally {
            setLoading(false)
        }
    }, [lessonId, token])

    useEffect(() => {
        load()
    }, [load])

    if (loading) return <Skeleton className="h-40 w-full rounded-lg" />
    if (!ready || !text) {
        return (
            <div className="text-center py-8">
                <NotebookPen className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                    AI đang tạo ghi chú cho bài học này (có thể mất vài phút).
                </p>
                <Button size="sm" variant="outline" onClick={load} className="gap-1">
                    <RefreshCw className="w-4 h-4" />
                    Kiểm tra lại
                </Button>
            </div>
        )
    }
    return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
            {looksLikeHtml(text) ? (
                <div dangerouslySetInnerHTML={{ __html: text }} />
            ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{text}</div>
            )}
        </div>
    )
}

// ── Flashcards tab ──────────────────────────────────────────
const cardFront = (c: AiFlashcard) => c.question ?? c.front ?? c.term ?? "—"
const cardBack = (c: AiFlashcard) => c.answer ?? c.back ?? c.definition ?? "—"

const FlashcardsTab = ({ lessonId, token }: { lessonId: string; token: string }) => {
    const [loading, setLoading] = useState(true)
    const [cards, setCards] = useState<AiFlashcard[]>([])
    const [idx, setIdx] = useState(0)
    const [flipped, setFlipped] = useState(false)

    const load = React.useCallback(async () => {
        setLoading(true)
        try {
            const res = await getAiFlashcards({ token, lessonId })
            setCards(extractFlashcards(res))
            setIdx(0)
            setFlipped(false)
        } catch {
            setCards([])
        } finally {
            setLoading(false)
        }
    }, [lessonId, token])

    useEffect(() => {
        load()
    }, [load])

    if (loading) return <Skeleton className="h-40 w-full rounded-lg" />
    if (cards.length === 0) {
        return (
            <div className="text-center py-8">
                <Layers className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                    Chưa có flashcard cho bài học này.
                </p>
                <Button size="sm" variant="outline" onClick={load} className="gap-1">
                    <RefreshCw className="w-4 h-4" />
                    Kiểm tra lại
                </Button>
            </div>
        )
    }

    const card = cards[idx]
    return (
        <div>
            <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className="w-full min-h-[160px] rounded-xl border-2 border-primary/20 bg-muted/40 p-5 flex items-center justify-center text-center transition-colors hover:bg-muted"
            >
                <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                        {flipped ? "Trả lời" : "Câu hỏi"}
                    </p>
                    <p className="text-base font-medium whitespace-pre-wrap">
                        {flipped ? cardBack(card) : cardFront(card)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                        (nhấn để lật thẻ)
                    </p>
                </div>
            </button>
            <div className="flex items-center justify-between mt-3">
                <Button
                    size="sm"
                    variant="outline"
                    disabled={idx === 0}
                    onClick={() => {
                        setIdx((i) => Math.max(0, i - 1))
                        setFlipped(false)
                    }}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                    {idx + 1} / {cards.length}
                </span>
                {idx === cards.length - 1 ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => {
                            setIdx(0)
                            setFlipped(false)
                        }}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setIdx((i) => Math.min(cards.length - 1, i + 1))
                            setFlipped(false)
                        }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}

// ── Chat tab ────────────────────────────────────────────────
interface ChatMsg {
    role: "user" | "ai"
    text: string
}

const ChatTab = ({ lessonId, token }: { lessonId: string; token: string }) => {
    const [messages, setMessages] = useState<ChatMsg[]>([])
    const [input, setInput] = useState("")
    const [sending, setSending] = useState(false)
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const appendToLastAi = (chunk: string) =>
        setMessages((m) => {
            const copy = [...m]
            const last = copy[copy.length - 1]
            if (last && last.role === "ai") {
                copy[copy.length - 1] = { ...last, text: last.text + chunk }
            }
            return copy
        })

    const setLastAi = (text: string) =>
        setMessages((m) => {
            const copy = [...m]
            const last = copy[copy.length - 1]
            if (last && last.role === "ai") copy[copy.length - 1] = { ...last, text }
            return copy
        })

    const send = async () => {
        const msg = input.trim()
        if (!msg || sending) return
        setInput("")
        // user message + empty AI placeholder to stream into
        setMessages((m) => [...m, { role: "user", text: msg }, { role: "ai", text: "" }])
        setSending(true)
        let streamed = false
        try {
            await aiChatStream(
                { token, lessonId, message: msg },
                {
                    onToken: (t) => {
                        streamed = true
                        appendToLastAi(t)
                    },
                },
            )
            if (!streamed) {
                // stream returned nothing → fall back to the non-stream endpoint
                const res = await aiChat({ token, lessonId, message: msg })
                setLastAi(extractChatReply(res))
            }
        } catch {
            try {
                const res = await aiChat({ token, lessonId, message: msg })
                setLastAi(extractChatReply(res))
            } catch {
                setLastAi("Xin lỗi, không thể kết nối trợ lý AI lúc này.")
            }
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col h-[320px]">
            <div className="flex-1 overflow-auto space-y-3 pr-1">
                {messages.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                        Hỏi AI bất cứ điều gì về bài học này.
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                                m.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                            }`}
                        >
                            {m.text}
                        </div>
                    </div>
                ))}
                {sending && (
                    <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl px-3 py-2 text-sm text-muted-foreground">
                            Đang trả lời…
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>
            <div className="flex items-end gap-2 pt-2 border-t mt-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            send()
                        }
                    }}
                    rows={1}
                    placeholder="Nhập câu hỏi…"
                    className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button size="icon" onClick={send} disabled={sending || !input.trim()}>
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

// ── Panel ───────────────────────────────────────────────────
export const AiLearningPanel = ({
    lessonId,
    token,
}: {
    lessonId: string
    token: string | null
}) => {
    if (!token) return null
    return (
        <div className="rounded-xl border bg-card p-3">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Trợ lý học tập AI</h3>
            </div>
            <Tabs defaultValue="note">
                <TabsList className="grid grid-cols-3 w-full mb-3">
                    <TabsTrigger value="note" className="gap-1 text-xs">
                        <NotebookPen className="w-3.5 h-3.5" />
                        Ghi chú
                    </TabsTrigger>
                    <TabsTrigger value="cards" className="gap-1 text-xs">
                        <Layers className="w-3.5 h-3.5" />
                        Flashcard
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="gap-1 text-xs">
                        <MessageCircle className="w-3.5 h-3.5" />
                        Hỏi AI
                    </TabsTrigger>
                </TabsList>
                {/* key forces reload of inner state when lesson changes */}
                <TabsContent value="note">
                    <NoteTab key={`note-${lessonId}`} lessonId={lessonId} token={token} />
                </TabsContent>
                <TabsContent value="cards">
                    <FlashcardsTab key={`cards-${lessonId}`} lessonId={lessonId} token={token} />
                </TabsContent>
                <TabsContent value="chat">
                    <ChatTab key={`chat-${lessonId}`} lessonId={lessonId} token={token} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AiLearningPanel
