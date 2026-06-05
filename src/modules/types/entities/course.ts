import type { AbstractEntity } from "./abstract"
import type { PricingPhaseEntity } from "./pricing-phase"
import type { EnrollmentEntity } from "./enrollment"
import type { PrerequisiteEntity } from "./prerequisite"
import type { QnaEntity } from "./qna"
import type { ValuePropositionEntity } from "./value-proposition"
import type { ModuleEntity } from "./module"
import type { PricingPhase } from "../enums"

/**
 * Course with ordered modules and landing-page metadata.
 */
export interface CourseEntity extends AbstractEntity {
    /** The title of the course. */
    title: string
    /** The slug of the course. */
    slug: string | null
    /** The description of the course. */
    description: string | null
    /** Short marketing description. */
    shortDescription: string | null
    /** The CDN URL of the course. */
    cdnUrl: string | null
    /** The thumbnail URL of the course. */
    thumbnailUrl: string | null
    /**
     * List / Regular (niêm yết) price. Tier Regular in `pricingPhases` has `regular: null` — use this.
     */
    originalPrice: number | null
    /** Discounted price, if any. */
    discountPrice: number | null
    /** Course level. */
    level: string | null
    /** Total published enrollments. */
    enrollmentCount: number
    /** Average rating (0-5). */
    rating: number | null
    /** Total reviews. */
    reviewCount: number
    /** Featured on homepage. */
    isFeatured: boolean
    /** Course status. */
    status: string
    /** Estimated duration in minutes. */
    estimatedMinutes: number | null
    /** Publish date. */
    publishedAt: string | null
    /** Exactly three tiers when backend seeds them: Pioneer, EarlyBird, Regular. */
    pricingPhases?: Array<PricingPhaseEntity>
    /** Active tier for marketing stepper (optional; defaults to Pioneer in UI). */
    currentPhase?: PricingPhase
    /** The prerequisites of the course. */
    prerequisites?: Array<PrerequisiteEntity>
    /** Bullet value proposition lines (ordered). */
    valuePropositions?: Array<ValuePropositionEntity>
    /** The Q&A entries of the course. */
    qnas?: Array<QnaEntity>
    /** The modules of the course. */
    modules?: Array<ModuleEntity>
    /** The enrollments of the course. */
    enrollments?: Array<EnrollmentEntity>
    /** The category of the course. */
    category?: {
        id: string
        name: string
    } | null
}
