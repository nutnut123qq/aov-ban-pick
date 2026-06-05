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

// Video time format: 1:30:00 or 30:00 (kept for backward compatibility)
export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
}

// levelLabels alias for backward compatibility
import { levelConfig as _levelConfig } from "@/modules/utils/course"
export const levelLabels = _levelConfig
