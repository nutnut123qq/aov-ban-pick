import type { AbstractEntity } from "./abstract"
import type { ModuleEntity } from "./module"

// Learning outcome for a module.
export interface OutcomeEntity extends AbstractEntity {
    /** The title of the outcome. */
    title: string
    /** The description of the outcome. */
    description: string | null
    /** The order index of the outcome. */
    orderIndex: number
    /** The module that the outcome belongs to. */
    module?: ModuleEntity
}
