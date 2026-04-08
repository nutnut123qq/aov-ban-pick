"use client"

import { cn } from "@heroui/react"
import React from "react"

export interface AuthModalStaticHeaderProps {
    title: string
    description?: React.ReactNode
    className?: string
    titleId?: string
    descriptionId?: string
}

/** Single title + subtitle row; pairs with form body (no duplicate hero). */
export const AuthModalStaticHeader = ({
    title,
    description,
    className,
    titleId,
    descriptionId,
}: AuthModalStaticHeaderProps) => (
    <header
        className={cn(
            "border-b border-border/60 px-6 pb-4 pt-5 text-start pe-14",
            className
        )}
    >
        <div
            id={titleId}
            className="text-xl font-semibold tracking-tight text-foreground"
        >
            {title}
        </div>
        {description ? (
            <div
                id={descriptionId}
                className="mt-1.5 text-sm leading-snug text-muted-foreground"
            >
                {description}
            </div>
        ) : null}
    </header>
)
