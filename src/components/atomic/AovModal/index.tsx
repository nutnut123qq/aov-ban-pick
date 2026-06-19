"use client"

import {
    Modal,
    ModalProps,
    ModalContent,
    ModalContentProps,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalHeaderProps,
    ModalBodyProps,
    ModalFooterProps,
    cn,
    Spacer,
} from "@heroui/react"
import React from "react"

export const AovModal = (props: ModalProps) => {
    return <Modal {...props} />
}

export const AovModalContent = (props: ModalContentProps) => {
    return <ModalContent {...props} />
}

export interface AovModalHeaderProps extends Omit<ModalHeaderProps, "children"> {
    title: string
    description?: React.ReactNode
}

export const AovModalHeader = ({ title, description, className, ...props }: AovModalHeaderProps) => {
    return (
        <ModalHeader className={cn("justify-center pb-2 flex flex-col", className)} {...props}>
            <div className="text-center">
                <div className="text-lg font-bold">{title}</div>
                {description && (
                    <>
                        <Spacer y={2} />
                        <div className="text-xs text-foreground-500 font-normal">{description}</div>
                    </>
                )}
            </div>
        </ModalHeader>
    )
}

export const AovModalBody = ({ className, ...props }: ModalBodyProps) => {
    return <ModalBody className={cn("gap-0 p-4", className)} {...props} />
}

export const AovModalFooter = ({ className, ...props }: ModalFooterProps) => {
    return <ModalFooter className={cn("p-4 justify-center pt-2", className)} {...props} />
}