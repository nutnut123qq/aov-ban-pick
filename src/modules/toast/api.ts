import { toast } from "@heroui/react"
import { GraphQLResponse } from "../api"

export type ToastVariant = "default" | "success" | "warning" | "danger" | "accent"

export const showGraphQLToast = <T>(response: GraphQLResponse<T>) => {
    const { success, message } = response

    const description =
        message || (success ? "Operation completed." : "Something went wrong.")

    if (success) {
        toast.success(description)
    } else {
        toast.danger(description)
    }
}

export const showUnauthorizedToast = () => {
    toast.danger("You are not authorized to access this resource.")
}

export interface RunGraphQLWithToastOptions {
    showSuccessToast?: boolean
    showErrorToast?: boolean
}

export const runGraphQLWithToast = async <T>(
    action: () => Promise<GraphQLResponse<T>>,
    options: RunGraphQLWithToastOptions = {
        showSuccessToast: true,
        showErrorToast: true,
    },
) => {
    try {
        const response = await action()
        if (options?.showSuccessToast) {
            showGraphQLToast(response)
            return true
        }
        return true
    } catch (error) {
        const _error = error as Error
        if (_error.message.toLowerCase().includes("unauthorized")) {
            if (options?.showErrorToast) {
                showUnauthorizedToast()
            }
            return false
        }
        if (options?.showErrorToast) {
            toast.danger(_error.message)
        }
        return false
    }
}
