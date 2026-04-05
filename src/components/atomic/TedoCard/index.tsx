"use client"

import React from "react"
import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardProps,
} from "@heroui/react"

export const TedoCard = (props: CardProps) => {
    return <Card shadow="sm" {...props} />
}

export const TedoCardBody = (props: React.ComponentProps<typeof CardBody>) => {
    return <CardBody {...props} />
}

export const TedoCardHeader = (props: React.ComponentProps<typeof CardHeader>) => {
    return <CardHeader {...props} />
}

export const TedoCardFooter = (props: React.ComponentProps<typeof CardFooter>) => {
    return <CardFooter {...props} />
}
