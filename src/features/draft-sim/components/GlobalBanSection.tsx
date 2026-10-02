import { useTranslations } from "next-intl"
import { X } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HeroManifest, TeamSide } from "@/modules/types"
import { cn } from "@/lib/utils"
import { globalBanCount } from "../hooks/useDraftEngine"

interface GlobalBanSectionProps {
    vanNumber: number
    globalBansBlue: Array<string | null>
    globalBansRed: Array<string | null>
    heroBySlug: Map<string, HeroManifest>
    onOpen: (side: TeamSide, index: number) => void
    onClear: (side: TeamSide, index: number) => void
}

export const GlobalBanSection = ({
    vanNumber,
    globalBansBlue,
    globalBansRed,
    heroBySlug,
    onOpen,
    onClear,
}: GlobalBanSectionProps) => {
    const t = useTranslations("draft")
    const count = globalBanCount(vanNumber)

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("globalBanTitle")}</CardTitle>
                <p className="text-xs text-muted-foreground">
                    {t("globalBanSubtitle", {
                        vanNumber,
                        count,
                        prevCount: vanNumber - 1,
                    })}
                </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <GlobalBanColumn
                    side="blue"
                    bans={globalBansBlue}
                    heroBySlug={heroBySlug}
                    onOpen={(i) => onOpen("blue", i)}
                    onClear={(i) => onClear("blue", i)}
                />
                <GlobalBanColumn
                    side="red"
                    bans={globalBansRed}
                    heroBySlug={heroBySlug}
                    onOpen={(i) => onOpen("red", i)}
                    onClear={(i) => onClear("red", i)}
                />
            </CardContent>
        </Card>
    )
}

interface GlobalBanColumnProps {
    side: TeamSide
    bans: Array<string | null>
    heroBySlug: Map<string, HeroManifest>
    onOpen: (index: number) => void
    onClear: (index: number) => void
}

const GlobalBanColumn = ({
    side,
    bans,
    heroBySlug,
    onOpen,
    onClear,
}: GlobalBanColumnProps) => {
    const t = useTranslations("draft")

    return (
        <div
            className={cn(
                "rounded-lg border p-3",
                side === "blue" ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-red-500",
            )}
        >
            <h4
                className={cn(
                    "mb-2 text-sm font-semibold",
                    side === "blue" ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400",
                )}
            >
                {side === "blue" ? t("blueTeam") : t("redTeam")}
            </h4>
            <div className="grid grid-cols-5 gap-2">
                {bans.map((heroId, index) => {
                    const hero = heroId ? heroBySlug.get(heroId) : undefined
                    return (
                        <div key={index} className="relative">
                            <button
                                type="button"
                                onClick={() => onOpen(index)}
                                className={cn(
                                    "flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border p-1 text-center text-xs transition-colors hover:border-primary",
                                    !hero && "text-muted-foreground",
                                )}
                            >
                                {hero ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={`/images/heroes/${hero.file}`}
                                            alt={hero.name}
                                            className="h-8 w-8 rounded object-cover"
                                        />
                                        <span className="line-clamp-1 w-full">{hero.name}</span>
                                    </>
                                ) : (
                                    <span>+</span>
                                )}
                            </button>
                            {hero && (
                                <button
                                    type="button"
                                    onClick={() => onClear(index)}
                                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[8px] text-destructive-foreground hover:bg-destructive/90"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
