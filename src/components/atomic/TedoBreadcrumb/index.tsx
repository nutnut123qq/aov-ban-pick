"use client"

import { Breadcrumbs, BreadcrumbItem, BreadcrumbsProps, BreadcrumbItemProps } from "@heroui/react"
import React from "react"

export const TedoBreadcrumbs = (props: BreadcrumbsProps) => {
    return <Breadcrumbs {...props} />
}
export const TedoBreadcrumbItem = (props: BreadcrumbItemProps) => {
    return <BreadcrumbItem {...props} />
}
