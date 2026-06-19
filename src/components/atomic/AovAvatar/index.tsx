"use client"

import { Avatar, AvatarGroup, AvatarGroupProps, AvatarProps } from "@heroui/react"
import React from "react"

export const AovAvatar = (props: AvatarProps) => {
    return <Avatar {...props} />
}

export const AovAvatarGroup = (props: AvatarGroupProps) => {
    return <AvatarGroup {...props} />
}
