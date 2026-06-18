"use client"
import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
    CalendarDays,
    MapPin,
    Video,
    Clock,
    Check,
    X,
    LogIn,
    ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
    listCalendarEvents,
    rsvpEvent,
    getMyAccount,
    type CalendarEvent,
    type RsvpStatus,
} from "@/modules/api"
import { useAuthToken } from "@/hooks"
import { toastSuccess, toastError } from "@/modules/toast"
import { formatDateTime } from "@/modules/utils"

const EventCard = ({
    event,
    rsvp,
    onRsvp,
    busy,
    isPast,
}: {
    event: CalendarEvent
    rsvp?: RsvpStatus
    onRsvp: (eventId: string, status: RsvpStatus) => void
    busy: boolean
    isPast: boolean
}) => {
    const attending = rsvp === "attending"

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {event.eventType && (
                                    <Badge variant="secondary" className="font-normal">
                                        {event.eventType}
                                    </Badge>
                                )}
                                {event.status === "cancelled" && (
                                    <Badge variant="destructive">Đã hủy</Badge>
                                )}
                                {event.isOnline && (
                                    <Badge variant="outline" className="gap-1">
                                        <Video className="w-3 h-3" />
                                        Trực tuyến
                                    </Badge>
                                )}
                            </div>
                            <h3 className="font-semibold leading-snug">{event.title}</h3>
                        </div>
                    </div>

                    {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {event.description}
                        </p>
                    )}

                    <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                        <p className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDateTime(event.startAt)} – {formatDateTime(event.endAt)}
                        </p>
                        {event.location && (
                            <p className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.location}
                            </p>
                        )}
                    </div>

                    {!isPast && event.status !== "cancelled" && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                variant={attending ? "default" : "outline"}
                                className="gap-1"
                                disabled={busy}
                                onClick={() => onRsvp(event.id, "attending")}
                            >
                                <Check className="w-4 h-4" />
                                {attending ? "Sẽ tham dự" : "Tham dự"}
                            </Button>
                            <Button
                                size="sm"
                                variant={rsvp === "not_attending" ? "secondary" : "ghost"}
                                className="gap-1"
                                disabled={busy}
                                onClick={() => onRsvp(event.id, "not_attending")}
                            >
                                <X className="w-4 h-4" />
                                Không tham dự
                            </Button>
                            {event.isOnline && event.meetingUrl && attending && (
                                <Button asChild size="sm" variant="outline" className="gap-1 ml-auto">
                                    <a href={event.meetingUrl} target="_blank" rel="noreferrer">
                                        <ExternalLink className="w-4 h-4" />
                                        Vào phòng họp
                                    </a>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

const CalendarPage = () => {
    const { token, isLoading: authLoading, login } = useAuthToken()

    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const [rsvps, setRsvps] = useState<Record<string, RsvpStatus>>({})
    const [busyId, setBusyId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!token) return
        let cancelled = false
        const load = async () => {
            setIsLoading(true)
            try {
                const [list, account] = await Promise.all([
                    listCalendarEvents({ token }),
                    getMyAccount({ token }).catch(() => null),
                ])
                if (cancelled) return
                setEvents(list)
                setUserId(account?.id ?? null)
            } catch (err) {
                console.error("Error loading calendar:", err)
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [token, authLoading])

    const { upcoming, past } = useMemo(() => {
        const now = Date.now()
        const up: CalendarEvent[] = []
        const pa: CalendarEvent[] = []
        for (const e of events) {
            if (new Date(e.endAt).getTime() >= now) up.push(e)
            else pa.push(e)
        }
        pa.reverse()
        return { upcoming: up, past: pa }
    }, [events])

    const handleRsvp = async (eventId: string, status: RsvpStatus) => {
        if (!token || !userId) return
        const previous = rsvps[eventId]
        setRsvps((prev) => ({ ...prev, [eventId]: status }))
        setBusyId(eventId)
        try {
            await rsvpEvent({ token, eventId, userId, rsvpStatus: status })
            toastSuccess(
                status === "attending" ? "Đã đăng ký tham dự." : "Đã cập nhật.",
            )
        } catch (err) {
            console.error("Error updating RSVP:", err)
            toastError("Không cập nhật được trạng thái tham dự.")
            setRsvps((prev) => {
                const next = { ...prev }
                if (previous) next[eventId] = previous
                else delete next[eventId]
                return next
            })
        } finally {
            setBusyId(null)
        }
    }

    if (!token && !authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <Card className="max-w-sm w-full text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <CalendarDays className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Đăng nhập để xem lịch sự kiện và đăng ký tham dự.
                    </p>
                    <Button onClick={() => login()} className="gap-2">
                        <LogIn className="w-4 h-4" />
                        Đăng nhập
                    </Button>
                </Card>
            </div>
        )
    }

    const renderList = (
        list: CalendarEvent[],
        emptyText: string,
        isPast: boolean,
    ) => {
        if (isLoading) {
            return (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))}
                </div>
            )
        }
        if (list.length === 0) {
            return (
                <div className="text-center py-16">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{emptyText}</p>
                </div>
            )
        }
        return (
            <div className="space-y-3">
                {list.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        rsvp={rsvps[event.id]}
                        onRsvp={handleRsvp}
                        busy={busyId === event.id}
                        isPast={isPast}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-3xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-1">Lịch sự kiện</h1>
                    <p className="text-sm text-muted-foreground">
                        Các buổi học, hội thảo và sự kiện đào tạo
                    </p>
                </div>

                <Tabs defaultValue="upcoming">
                    <TabsList className="mb-4 bg-muted/50">
                        <TabsTrigger value="upcoming">Sắp diễn ra</TabsTrigger>
                        <TabsTrigger value="past">Đã qua</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upcoming">
                        {renderList(upcoming, "Không có sự kiện sắp tới", false)}
                    </TabsContent>
                    <TabsContent value="past">
                        {renderList(past, "Chưa có sự kiện nào đã qua", true)}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default CalendarPage
