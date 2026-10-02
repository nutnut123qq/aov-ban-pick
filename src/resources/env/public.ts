/**
 * Public environment variables.
 */
export const publicEnv = () => {
    return {
        app: {
            /** Base URL of the web application. */
            baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
    }
}