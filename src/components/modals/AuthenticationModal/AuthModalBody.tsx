"use client"

import { cn } from "@heroui/react"
import React, { type PropsWithChildren } from "react"

/** Body layout matching former TedoModalBody (no HeroUI ModalContext). */
export const AuthModalBody = ({
    className,
    children,
}: React.PropsWithChildren<{ className?: string }>) => (
    <div className={cn("flex flex-1 flex-col gap-0", className)}>
        {children}
    </div>
)
