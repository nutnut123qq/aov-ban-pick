"use client"

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    DrawerProps,
    DrawerHeaderProps,
    DrawerBodyProps,
} from "@heroui/react"
import React from "react"

export const AovDrawer = (props: DrawerProps) => {
    return <Drawer {...props} />
}

export const AovDrawerContent = DrawerContent
export const AovDrawerHeader = (props: DrawerHeaderProps) => {
    return <DrawerHeader {...props} />
}
export const AovDrawerBody = (props: DrawerBodyProps) => {
    return <DrawerBody {...props} />
}
export const AovDrawerFooter = DrawerFooter
