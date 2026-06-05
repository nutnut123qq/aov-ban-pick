// Re-export all shared utilities from modules/utils
// This file maintains backward compatibility for imports

import {
    formatPrice,
    formatDurationShort,
    formatDurationLong,
    formatNumber,
    formatPercent,
} from "@/modules/utils/format"

export { formatPrice, formatDurationShort, formatDurationLong, formatNumber, formatPercent }

export {
    levelConfig,
    enrollmentStatusConfig,
    getLessonIcon,
    levelColors,
    levelBadgeClasses,
} from "@/modules/utils/course"

export {
    fadeInUp,
    fadeInUpWithDelay,
    staggerContainer,
    fadeIn,
    scaleIn,
    slideInRight,
    slideInUp,
} from "@/modules/utils/animations"

// Short duration format (kept for backward compatibility)
export const formatDuration = formatDurationShort

// levelLabels alias for backward compatibility - use levelConfig directly
import { levelConfig as _levelConfig } from "@/modules/utils/course"
export const levelLabels = _levelConfig
