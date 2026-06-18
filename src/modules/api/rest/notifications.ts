import { restRequest, type RestPaginated } from "./client"

/** A single in-app notification (matches backend `toNotificationResponse`). */
export interface NotificationItem {
    id: string
    type: string
    title: string
    message: string | null
    entityType: string | null
    entityId: string | null
    isRead: boolean
    readAt: string | null
    createdAt: string
}

/** Lists the current user's notifications (paginated). */
export const listNotifications = ({
    token,
    page = 0,
    size = 20,
    unread,
}: {
    token: string
    page?: number
    size?: number
    unread?: boolean
}) =>
    restRequest<RestPaginated<NotificationItem>>("training/notifications", {
        token,
        query: { page, size, unread: unread ? "true" : undefined },
    })

/** Returns the count of unread notifications. */
export const getUnreadNotificationCount = ({ token }: { token: string }) =>
    restRequest<{ count: number }>("training/notifications/unread-count", {
        token,
    })

/** Marks a single notification as read. */
export const markNotificationRead = ({
    token,
    id,
}: {
    token: string
    id: string
}) =>
    restRequest<NotificationItem>(`training/notifications/${id}/read`, {
        token,
        method: "PATCH",
    })

/** Marks every notification of the current user as read. */
export const markAllNotificationsRead = ({ token }: { token: string }) =>
    restRequest<{ success: boolean }>("training/notifications/read-all", {
        token,
        method: "PATCH",
    })
