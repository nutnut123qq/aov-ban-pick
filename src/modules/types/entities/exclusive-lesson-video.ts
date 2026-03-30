import type { AbstractEntity } from "./abstract"
import type { ModuleEntity } from "./module"

/**
 * Video link and metadata attached to a module.
 */
export interface ExclusiveLessonVideoEntity extends AbstractEntity {
    /** The title of the exclusive lesson video. */
    title: string
    /** The description of the exclusive lesson video. */
    description: string | null
    /** The URL of the exclusive lesson video. */
    url: string
    /** The duration of the exclusive lesson video in milliseconds. */
    durationMs: number
    /** The order index of the exclusive lesson video. */
    orderIndex: number
    /** The course module that the exclusive lesson video belongs to. */
    module?: ModuleEntity
}
