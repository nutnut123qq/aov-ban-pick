"use client"
import React, { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
    Library as LibraryIcon,
    FileText,
    Video,
    Image as ImageIcon,
    Link2,
    Download,
    ExternalLink,
    Search,
    LogIn,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import {
    listLibraryCategories,
    listLibraryResources,
    type LibraryCategory,
    type LibraryResource,
} from "@/modules/api"
import { useAuthToken } from "@/hooks"

const iconFor = (type: string, className: string) => {
    switch (type) {
        case "video":
            return <Video className={className} />
        case "image":
            return <ImageIcon className={className} />
        case "link":
            return <Link2 className={className} />
        default:
            return <FileText className={className} />
    }
}

const formatFileSize = (bytes: string | null): string | null => {
    if (!bytes) return null
    const n = Number(bytes)
    if (Number.isNaN(n) || n <= 0) return null
    if (n < 1024) return `${n} B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
    return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

const ResourceCard = ({ resource }: { resource: LibraryResource }) => {
    const url = resource.fileUrl || resource.externalUrl
    const isExternal = !resource.fileUrl && !!resource.externalUrl
    const size = formatFileSize(resource.fileSize)

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="h-full flex flex-col overflow-hidden">
                <div className="relative h-32 bg-muted flex items-center justify-center">
                    {resource.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={resource.thumbnailUrl}
                            alt={resource.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        iconFor(resource.resourceType, "w-10 h-10 text-muted-foreground")
                    )}
                    <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 font-normal capitalize"
                    >
                        {resource.resourceType}
                    </Badge>
                </div>
                <CardContent className="flex-1 flex flex-col p-4">
                    <h3 className="font-semibold line-clamp-2 mb-1">{resource.title}</h3>
                    {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {resource.description}
                        </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        {size && (
                            <span className="text-xs text-muted-foreground">{size}</span>
                        )}
                        {url ? (
                            <Button asChild size="sm" variant="outline" className="gap-1 ml-auto">
                                <a href={url} target="_blank" rel="noreferrer">
                                    {isExternal ? (
                                        <ExternalLink className="w-4 h-4" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    {isExternal ? "Mở" : "Tải"}
                                </a>
                            </Button>
                        ) : (
                            <span className="text-xs text-muted-foreground ml-auto">
                                Chưa có tệp
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

const LibraryPage = () => {
    const { token, isLoading: authLoading, login } = useAuthToken()

    const [categories, setCategories] = useState<LibraryCategory[]>([])
    const [resources, setResources] = useState<LibraryResource[]>([])
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    // Debounce the search box so filtering doesn't run on every keystroke.
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => {
        if (!token) return
        let cancelled = false
        const load = async () => {
            setIsLoading(true)
            try {
                const [cats, res] = await Promise.all([
                    listLibraryCategories({ token }).catch(() => []),
                    listLibraryResources({ token }),
                ])
                if (cancelled) return
                setCategories(cats)
                setResources(res)
            } catch (err) {
                console.error("Error loading library:", err)
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [token, authLoading])

    const filtered = useMemo(() => {
        const term = debouncedSearch.trim().toLowerCase()
        return resources.filter((r) => {
            if (activeCategory && r.categoryId !== activeCategory) return false
            if (term && !r.title.toLowerCase().includes(term)) return false
            return true
        })
    }, [resources, activeCategory, debouncedSearch])

    if (!token && !authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <Card className="max-w-sm w-full text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <LibraryIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Đăng nhập để truy cập thư viện tài nguyên.
                    </p>
                    <Button onClick={() => login()} className="gap-2">
                        <LogIn className="w-4 h-4" />
                        Đăng nhập
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-1">Thư viện tài nguyên</h1>
                    <p className="text-sm text-muted-foreground">
                        Tài liệu, video và tài nguyên học tập bổ sung
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-4 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm tài nguyên..."
                        className="pl-9"
                    />
                </div>

                {/* Category chips */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                activeCategory === null
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/70 text-muted-foreground"
                            }`}
                        >
                            Tất cả
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    activeCategory === cat.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/70 text-muted-foreground"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-60 w-full rounded-xl" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <LibraryIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <h3 className="font-semibold mb-1">Không tìm thấy tài nguyên</h3>
                        <p className="text-sm text-muted-foreground">
                            Thử đổi danh mục hoặc từ khóa tìm kiếm khác.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LibraryPage
