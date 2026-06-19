"use client"

import { Breadcrumbs, BreadcrumbItem, BreadcrumbsProps, BreadcrumbItemProps } from "@heroui/react"
import React from "react"

export const AovBreadcrumbs = (props: BreadcrumbsProps) => {
    return <Breadcrumbs {...props} />
}
export const AovBreadcrumbItem = (props: BreadcrumbItemProps) => {
    return <BreadcrumbItem {...props} />
}
