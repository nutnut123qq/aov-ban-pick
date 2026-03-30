import type { AbstractEntity } from "./abstract"
import type { ModuleEntity } from "./module"

/**
 * Lesson or topic block inside a module.
 */
export interface ContentEntity extends AbstractEntity {
    /** The data of the content. */
    data: string
    /** The order index of the content. */
    orderIndex: number
    /** The module that the content belongs to. */
    module?: ModuleEntity
}
