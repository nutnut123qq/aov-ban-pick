"use client"

import { Button, ButtonProps } from "@heroui/react"
import React, { forwardRef } from "react"

export const TedoButton = forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => {
        return <Button {...props} ref={ref} />
    }
)
TedoButton.displayName = "TedoButton"
