import type { AbstractEntity } from "./abstract"
import type { GeneralContentEntity } from "./general-content"

// Section (heading + markdown) inside general module content.
export interface GeneralContentSectionEntity extends AbstractEntity {
    /** The title of the section. */
    title: string | null
    /** The body of the section. */
    body: string
    /** The order index of the section. */
    orderIndex: number
    /** The general content that the section belongs to. */
    generalContent?: GeneralContentEntity
}
