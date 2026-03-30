import type { AbstractEntity } from "./abstract"
import type { AdvancedContentEntity } from "./advanced-content"

/**
 * Section inside advanced (premium) module content.
 */
export interface AdvancedContentSectionEntity extends AbstractEntity {
    /** The title of the section. */
    title: string | null
    /** The body of the section. */
    body: string
    /** The order index of the section. */
    orderIndex: number
    /** The advanced content that the section belongs to. */
    advancedContent?: AdvancedContentEntity
}
