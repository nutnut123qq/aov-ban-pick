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

export const TedoDrawer = (props: DrawerProps) => {
    return <Drawer {...props} />
}

export const TedoDrawerContent = DrawerContent
export const TedoDrawerHeader = (props: DrawerHeaderProps) => {
    return <DrawerHeader {...props} />
}
export const TedoDrawerBody = (props: DrawerBodyProps) => {
    return <DrawerBody {...props} />
}
export const TedoDrawerFooter = DrawerFooter
