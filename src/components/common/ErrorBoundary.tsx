"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

/**
 * Error Boundary component for catching React errors
 * Usage: Wrap any component that might throw errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to monitoring service (e.g., Sentry)
        console.error("ErrorBoundary caught an error:", error, errorInfo)
        
        // Call optional error callback
        this.props.onError?.(error, errorInfo)
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null })
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Đã xảy ra lỗi
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                            {this.state.error?.message || "Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                className="gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Thử lại
                            </Button>
                            <Button asChild>
                                <Link href="/" className="gap-2">
                                    <Home className="w-4 h-4" />
                                    Về trang chủ
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * Simple error fallback component for inline use
 */
export function ErrorFallback({
    message = "Đã xảy ra lỗi",
    onRetry,
}: {
    message?: string
    onRetry?: () => void
}) {
    return (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
            {onRetry && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRetry}
                    className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    Thử lại
                </Button>
            )}
        </div>
    )
}

/**
 * Loading skeleton for Suspense fallback
 */
export function LoadingSkeleton({
    className = "",
    lines = 3,
}: {
    className?: string
    lines?: number
}) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
                    style={{ width: `${100 - i * 15}%` }}
                />
            ))}
        </div>
    )
}

/**
 * Empty state component
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon?: React.ElementType
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
}) {
    return (
        <div className="text-center py-12 px-4">
            {Icon && (
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-gray-400" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    )
}
