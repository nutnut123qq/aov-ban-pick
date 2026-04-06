"use client"

import { Skeleton, SkeletonProps } from "@heroui/react"
import React from "react"

export const TedoSkeleton = (props: SkeletonProps) => {
    return <Skeleton {...props} />
}
