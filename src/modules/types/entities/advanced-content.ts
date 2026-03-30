import type { AbstractEntity } from "./abstract"
import type { ModuleEntity } from "./module"
import type { AdvancedContentSectionEntity } from "./advanced-content-section"

/**
 * Advanced module material (premium track).
 */
export interface AdvancedContentEntity extends AbstractEntity {
    /** The title of the advanced content. */
    title: string
    /** The order index of the advanced content. */
    orderIndex: number
    /** The course module that the advanced content belongs to. */
    module?: ModuleEntity
    /** The sections of the advanced content. */
    sections?: Array<AdvancedContentSectionEntity>
}
