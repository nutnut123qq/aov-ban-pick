/**
 * Internal environment variables (server-side only).
 */
export const internalEnv = () => {
    return {
        /** Node environment. */
        nodeEnv: process.env.NODE_ENV || "development",
        /** Whether the environment is production. */
        isProduction: process.env.NODE_ENV === "production",
    }
}

