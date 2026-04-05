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

export const TedoDropdown = Dropdown
export const TedoDropdownTrigger = DropdownTrigger
export const TedoDropdownMenu = ({ children, ...props }: DropdownMenuProps) => {
    return <DropdownMenu {...props}>{children}</DropdownMenu>
}
export const TedoDropdownItem = DropdownItem
export const TedoDropdownSection = DropdownSection
