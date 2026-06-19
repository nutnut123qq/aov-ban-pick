// App-wide constants and configuration

/**
 * Pagination defaults
 */
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 12,
    PAGE_SIZE_OPTIONS: [6, 12, 24, 48],
    MAX_VISIBLE_PAGES: 5,
} as const

/**
 * Course card display options
 */
export const COURSE_CARD = {
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 150,
    HOVER_DELAY_MS: 200,
    LEAVE_DELAY_MS: 100,
    PREVIEW_CARD_WIDTH: 340,
    PREVIEW_CARD_HEIGHT: 520,
} as const

/**
 * Video player configuration
 */
export const VIDEO_PLAYER = {
    CONTROL_HIDE_DELAY_MS: 3000,
    SEEK_AMOUNT_SECONDS: 10,
    VOLUME_STEP: 0.1,
    PLAYBACK_RATES: [0.5, 0.75, 1, 1.25, 1.5, 2],
    DEFAULT_VOLUME: 1,
    MIN_VOLUME: 0,
    MAX_VOLUME: 1,
} as const

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION = {
    FADE_IN: 300,
    FADE_OUT: 200,
    SLIDE_IN: 300,
    HOVER_SCALE: 300,
    MODAL_OPEN: 300,
} as const

/**
 * Toast/Notification configuration
 */
export const TOAST = {
    AUTO_DISMISS_MS: 5000,
    MAX_TOASTS: 5,
    POSITION: "bottom-right" as const,
} as const

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
    THEME: "aov-theme",
    LANGUAGE: "aov-language",
    SIDEBAR_COLLAPSED: "aov-sidebar-collapsed",
    COURSE_PROGRESS: "aov-course-progress",
    RECENT_SEARCHES: "aov-recent-searches",
} as const

/**
 * API configuration
 */
export const API = {
    TIMEOUT_MS: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
} as const

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    "2XL": 1536,
} as const

/**
 * Z-index layers for proper stacking
 */
export const Z_INDEX = {
    DROPDOWN: 50,
    STICKY: 100,
    MODAL_BACKDROP: 200,
    MODAL: 250,
    POPOVER: 300,
    TOOLTIP: 400,
    TOAST: 500,
} as const
