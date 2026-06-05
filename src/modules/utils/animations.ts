// Animation utilities - shared animation variants and configurations

import type { Transition } from "framer-motion"

/**
 * Standard fade in up animation variant
 */
export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" } as Transition,
}

/**
 * Fade in up with delay
 */
export const fadeInUpWithDelay = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut", delay } as Transition,
})

/**
 * Stagger container animation
 */
export const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

/**
 * Fade in animation
 */
export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 } as Transition,
}

/**
 * Scale in animation
 */
export const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: "easeOut" } as Transition,
}

/**
 * Slide in from right
 */
export const slideInRight = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: "easeOut" } as Transition,
}

/**
 * Slide in from bottom
 */
export const slideInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" } as Transition,
}
