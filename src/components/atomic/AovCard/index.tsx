"use client"

import React from "react"
import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardProps,
} from "@heroui/react"

export const AovCard = (props: CardProps) => {
    return <Card shadow="sm" {...props} />
}

export const AovCardBody = (props: React.ComponentProps<typeof CardBody>) => {
    return <CardBody {...props} />
}

export const AovCardHeader = (props: React.ComponentProps<typeof CardHeader>) => {
    return <CardHeader {...props} />
}

export const AovCardFooter = (props: React.ComponentProps<typeof CardFooter>) => {
    return <CardFooter {...props} />
}
