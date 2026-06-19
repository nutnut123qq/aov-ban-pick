"use client"

import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    DropdownSection,
    DropdownMenuProps,
} from "@heroui/react"
import React from "react"

export const AovDropdown = Dropdown
export const AovDropdownTrigger = DropdownTrigger
export const AovDropdownMenu = ({ children, ...props }: DropdownMenuProps) => {
    return <DropdownMenu {...props}>{children}</DropdownMenu>
}
export const AovDropdownItem = DropdownItem
export const AovDropdownSection = DropdownSection
