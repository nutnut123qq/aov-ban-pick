"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import {
    Download,
    FileText,
    File,
    Link as LinkIcon,
    Code,
    Image as ImageIcon,
} from "lucide-react"
import type { LessonMaterialEntity } from "@/modules/types"

interface LessonMaterialsProps {
    materials?: LessonMaterialEntity[]
}

const getMaterialIcon = (type: LessonMaterialEntity["type"]) => {
    switch (type) {
        case "PDF":
            return <FileText className="w-5 h-5 text-red-500" />
        case "DOCUMENT":
            return <File className="w-5 h-5 text-blue-500" />
        case "IMAGE":
            return <ImageIcon className="w-5 h-5 text-green-500" />
        case "LINK":
            return <LinkIcon className="w-5 h-5 text-blue-400" />
        case "CODE":
            return <Code className="w-5 h-5 text-purple-500" />
        default:
            return <File className="w-5 h-5" />
    }
}

const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const LessonMaterials: React.FC<LessonMaterialsProps> = ({ materials }) => {
    if (!materials || materials.length === 0) return null

    return (
        <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">Tài liệu bài học</h3>
            <div className="space-y-2">
                {materials.map((material) => (
                    <a
                        key={material.id}
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                        {getMaterialIcon(material.type)}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{material.title}</p>
                            {material.size && (
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(material.size)}
                                </p>
                            )}
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground" />
                    </a>
                ))}
            </div>
        </div>
    )
}
