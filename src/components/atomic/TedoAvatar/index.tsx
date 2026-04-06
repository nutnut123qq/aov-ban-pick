"use client"

import { Avatar, AvatarGroup, AvatarGroupProps, AvatarProps } from "@heroui/react"
import React from "react"

export const TedoAvatar = (props: AvatarProps) => {
    return <Avatar {...props} />
}

export const TedoAvatarGroup = (props: AvatarGroupProps) => {
    return <AvatarGroup {...props} />
}
