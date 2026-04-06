"use client"

import { cn, Spacer } from "@heroui/react"
import React from "react"

export interface AuthModalStaticHeaderProps {
    title: string
    description?: React.ReactNode
    className?: string
    titleId?: string
    descriptionId?: string
}

/** Header layout matching former TedoModalHeader (no ModalContext). */
export const AuthModalStaticHeader = ({
    title,
    description,
    className,
    titleId,
    descriptionId,
}: AuthModalStaticHeaderProps) => (
    <header
        className={cn(
            "flex flex-col justify-center px-6 pt-6 pb-2 text-center",
            className
        )}
    >
        <div id={titleId} className="text-lg font-bold">
            {title}
        </div>
        {description ? (
            <>
                <Spacer y={2} />
                <div
                    id={descriptionId}
                    className="text-xs font-normal text-foreground-500"
                >
                    {description}
                </div>
            </>
        ) : null}
    </header>
)
