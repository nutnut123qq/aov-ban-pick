import { createApolloClient } from "../clients"
import { gql } from "@apollo/client"

export type CalendarEventStatus = "scheduled" | "cancelled" | "completed"
export type RsvpStatus = "attending" | "not_attending" | "pending"

/** Calendar event (matches backend `toCalendarEventResponse`). */
export interface CalendarEvent {
    id: string
    orgId: string | null
    classId: string | null
    title: string
    description: string | null
    eventType: string | null
    startAt: string
    endAt: string
    location: string | null
    isOnline: boolean
    meetingUrl: string | null
    status: CalendarEventStatus
    createdAt: string
    updatedAt: string
}

export interface EventAttendee {
    eventId: string
    userId: string
    rsvpStatus: string
    respondedAt: string | null
}

interface EventsListEnvelope {
    items: CalendarEvent[]
    meta: { page: number; size: number; total: number; totalPages: number }
}

const queryList = gql`
  query TrainingCalendarEventsList($query: JSON) {
    trainingCalendarEventsList(query: $query)
  }
`

const mutationAttendeeAdd = gql`
  mutation TrainingEventAttendeeAdd($eventId: String!, $input: JSON!) {
    trainingEventAttendeeAdd(eventId: $eventId, input: $input)
  }
`

const mutationAttendeePatch = gql`
  mutation TrainingEventAttendeePatch(
    $eventId: String!
    $userId: String!
    $input: JSON!
  ) {
    trainingEventAttendeePatch(eventId: $eventId, userId: $userId, input: $input)
  }
`

interface ListData {
    trainingCalendarEventsList: EventsListEnvelope | null
}

/** Lists calendar events ordered by start time (ascending). */
export const listCalendarEvents = async ({
    token,
    page = 0,
    size = 50,
}: {
    token: string
    page?: number
    size?: number
}): Promise<CalendarEvent[]> => {
    const apollo = createApolloClient({ auth: true, cache: false, token })
    const res = await apollo.query<ListData>({
        query: queryList,
        variables: {
            query: { page, size, sortBy: "startAt", sortDir: "asc" },
        },
    })
    return res.data?.trainingCalendarEventsList?.items ?? []
}

/**
 * Sets the current user's RSVP for an event. Adds the attendee, falling back to
 * a patch when the attendee row already exists.
 */
export const rsvpEvent = async ({
    token,
    eventId,
    userId,
    rsvpStatus,
}: {
    token: string
    eventId: string
    userId: string
    rsvpStatus: RsvpStatus
}): Promise<void> => {
    const apollo = createApolloClient({ auth: true, cache: false, token })
    try {
        await apollo.mutate({
            mutation: mutationAttendeeAdd,
            variables: { eventId, input: { userId, rsvpStatus } },
        })
    } catch {
        await apollo.mutate({
            mutation: mutationAttendeePatch,
            variables: { eventId, userId, input: { rsvpStatus } },
        })
    }
}
