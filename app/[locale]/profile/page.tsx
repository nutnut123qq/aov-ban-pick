"use client"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Pencil,
    Save,
    X,
    Globe,
    Link2,
    BadgeCheck,
    LogIn,
    Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    getMyAccount,
    getMyProfile,
    getMyProfileCompleteness,
    updateMyAccount,
    upsertMyProfile,
    uploadImage,
    type TrainingAccount,
    type TrainingProfile,
    type ProfileCompleteness,
    type GenderType,
} from "@/modules/api"
import { useAuthToken } from "@/hooks"
import { toastSuccess, toastError } from "@/modules/toast"

interface FormState {
    fullName: string
    phone: string
    avatarUrl: string
    gender: GenderType
    birthDate: string
    address: string
    headline: string
    bio: string
    websiteUrl: string
    github: string
    linkedin: string
    facebook: string
    x: string
    youtube: string
}

const genderLabels: Record<GenderType, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
    unknown: "Không xác định",
}

const getInitials = (name: string) =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

const toFormState = (
    account: TrainingAccount,
    profile: TrainingProfile | null,
): FormState => ({
    fullName: account.fullName ?? "",
    phone: account.phone ?? "",
    avatarUrl: account.avatarUrl ?? "",
    gender: profile?.gender ?? "unknown",
    birthDate: profile?.birthDate ? profile.birthDate.slice(0, 10) : "",
    address: profile?.address ?? "",
    headline: profile?.customFields?.headline ?? "",
    bio: profile?.customFields?.bio ?? "",
    websiteUrl: profile?.customFields?.websiteUrl ?? "",
    github: profile?.customFields?.socials?.github ?? "",
    linkedin: profile?.customFields?.socials?.linkedin ?? "",
    facebook: profile?.customFields?.socials?.facebook ?? "",
    x: profile?.customFields?.socials?.x ?? "",
    youtube: profile?.customFields?.socials?.youtube ?? "",
})

const ProfilePage = () => {
    const { token, login } = useAuthToken()

    const [account, setAccount] = useState<TrainingAccount | null>(null)
    const [profile, setProfile] = useState<TrainingProfile | null>(null)
    const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [form, setForm] = useState<FormState | null>(null)

    const load = React.useCallback(async () => {
        if (!token) {
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        try {
            const [acc, prof, comp] = await Promise.all([
                getMyAccount({ token }),
                getMyProfile({ token }).catch(() => null),
                getMyProfileCompleteness({ token }).catch(() => null),
            ])
            setAccount(acc)
            setProfile(prof)
            setCompleteness(comp)
            setForm(toFormState(acc, prof))
        } catch (err) {
            console.error("Error loading profile:", err)
            setError("Không tải được hồ sơ. Vui lòng thử lại.")
        } finally {
            setIsLoading(false)
        }
    }, [token])

    useEffect(() => {
        load()
    }, [load])

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
    }

    const validate = (f: FormState): string | null => {
        if (!f.fullName.trim()) return "Vui lòng nhập họ tên."
        if (f.phone.trim() && !/^[0-9+()\s-]{6,20}$/.test(f.phone.trim())) {
            return "Số điện thoại không hợp lệ."
        }
        const urlOk = (v: string) =>
            !v.trim() || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+.*$/i.test(v.trim())
        const urlFields: Array<[string, string]> = [
            [f.avatarUrl, "Ảnh đại diện"],
            [f.websiteUrl, "Website"],
            [f.github, "GitHub"],
            [f.linkedin, "LinkedIn"],
            [f.facebook, "Facebook"],
            [f.x, "X (Twitter)"],
            [f.youtube, "YouTube"],
        ]
        for (const [val, label] of urlFields) {
            if (!urlOk(val)) return `Đường dẫn ${label} không hợp lệ.`
        }
        return null
    }

    const handleSave = async () => {
        if (!token || !form) return
        const validationError = validate(form)
        if (validationError) {
            setError(validationError)
            toastError(validationError)
            return
        }
        setIsSaving(true)
        setError(null)
        try {
            await updateMyAccount({
                token,
                input: {
                    fullName: form.fullName.trim(),
                    phone: form.phone.trim() || null,
                    avatarUrl: form.avatarUrl.trim() || null,
                },
            })
            await upsertMyProfile({
                token,
                input: {
                    gender: form.gender,
                    birthDate: form.birthDate || null,
                    address: form.address.trim() || null,
                    customFields: {
                        headline: form.headline.trim() || null,
                        bio: form.bio.trim() || null,
                        websiteUrl: form.websiteUrl.trim() || null,
                        socials: {
                            github: form.github.trim() || null,
                            linkedin: form.linkedin.trim() || null,
                            facebook: form.facebook.trim() || null,
                            x: form.x.trim() || null,
                            youtube: form.youtube.trim() || null,
                        },
                    },
                },
            })
            setIsEditing(false)
            await load()
            toastSuccess("Đã lưu hồ sơ.")
        } catch (err) {
            console.error("Error saving profile:", err)
            setError("Lưu hồ sơ thất bại. Vui lòng thử lại.")
            toastError("Lưu hồ sơ thất bại. Vui lòng thử lại.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        if (account) setForm(toFormState(account, profile))
        setIsEditing(false)
        setError(null)
    }

    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const handleUploadAvatar = async (file: File) => {
        if (!token) return
        setUploadingAvatar(true)
        try {
            const { cdnUrl } = await uploadImage({
                token,
                file,
                fileName: "avatar",
                altText: "avatar",
            })
            setField("avatarUrl", cdnUrl)
            toastSuccess("Đã tải ảnh lên.")
        } catch {
            toastError("Tải ảnh thất bại (cần quyền giảng viên/quản trị).")
        } finally {
            setUploadingAvatar(false)
        }
    }

    if (!token && !isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <Card className="max-w-sm w-full text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-lg mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Đăng nhập để xem và chỉnh sửa hồ sơ của bạn.
                    </p>
                    <Button onClick={() => login()} className="gap-2">
                        <LogIn className="w-4 h-4" />
                        Đăng nhập
                    </Button>
                </Card>
            </div>
        )
    }

    if (isLoading || !form) {
        return (
            <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
            <div className="container mx-auto max-w-3xl px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Header card */}
                    <Card className="mb-6 overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-primary/80 to-primary" />
                        <CardContent className="pt-0">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
                                <Avatar className="size-20 ring-4 ring-background">
                                    {form.avatarUrl ? (
                                        <AvatarImage src={form.avatarUrl} alt={form.fullName} />
                                    ) : null}
                                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                        {getInitials(form.fullName || account?.email || "U")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl font-bold truncate">
                                            {account?.fullName}
                                        </h1>
                                        {account?.status === "active" && (
                                            <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                                        )}
                                    </div>
                                    {form.headline && (
                                        <p className="text-sm text-muted-foreground truncate">
                                            {form.headline}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            {account?.email}
                                        </span>
                                        {account?.employeeCode && (
                                            <Badge variant="secondary" className="font-normal">
                                                {account.employeeCode}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {!isEditing && (
                                    <Button
                                        variant="outline"
                                        className="gap-2 shrink-0"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Chỉnh sửa
                                    </Button>
                                )}
                            </div>

                            {completeness && completeness.percent < 100 && (
                                <div className="mt-6">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">
                                            Hoàn thiện hồ sơ
                                        </span>
                                        <span className="font-medium">
                                            {completeness.percent}%
                                        </span>
                                    </div>
                                    <Progress value={completeness.percent} className="h-2" />
                                    {completeness.missing.length > 0 && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Còn thiếu: {completeness.missing.join(", ")}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Details / edit form */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
                            {isEditing && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        <X className="w-4 h-4" />
                                        Hủy
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="gap-1"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? "Đang lưu..." : "Lưu"}
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {isEditing ? (
                                <EditForm
                                    form={form}
                                    setField={setField}
                                    onUploadAvatar={handleUploadAvatar}
                                    uploadingAvatar={uploadingAvatar}
                                />
                            ) : (
                                <ReadView account={account} profile={profile} form={form} />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}

const Field = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value?: string | null
}) => (
    <div className="flex items-start gap-3">
        <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">
                {value && value.trim() ? value : "—"}
            </p>
        </div>
    </div>
)

const ReadView = ({
    account,
    profile,
    form,
}: {
    account: TrainingAccount | null
    profile: TrainingProfile | null
    form: FormState
}) => {
    const socials: Array<{
        icon: React.ComponentType<{ className?: string }>
        url: string
        label: string
    }> = [
        { icon: Link2, url: form.github, label: "GitHub" },
        { icon: Link2, url: form.linkedin, label: "LinkedIn" },
        { icon: Link2, url: form.facebook, label: "Facebook" },
        { icon: Link2, url: form.youtube, label: "YouTube" },
    ].filter((s) => s.url.trim())

    return (
        <div className="space-y-5">
            {form.bio && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {form.bio}
                </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field icon={User} label="Họ tên" value={account?.fullName} />
                <Field icon={Phone} label="Số điện thoại" value={account?.phone} />
                <Field
                    icon={User}
                    label="Giới tính"
                    value={profile?.gender ? genderLabels[profile.gender] : "—"}
                />
                <Field
                    icon={Calendar}
                    label="Ngày sinh"
                    value={profile?.birthDate ? profile.birthDate.slice(0, 10) : "—"}
                />
                <Field icon={MapPin} label="Địa chỉ" value={profile?.address} />
                <Field icon={Globe} label="Website" value={form.websiteUrl} />
            </div>
            {socials.length > 0 && (
                <>
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                        {socials.map(({ icon: Icon, url, label }) => (
                            <a
                                key={label}
                                href={url.startsWith("http") ? url : `https://${url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </a>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

const EditForm = ({
    form,
    setField,
    onUploadAvatar,
    uploadingAvatar,
}: {
    form: FormState
    setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void
    onUploadAvatar: (file: File) => void
    uploadingAvatar: boolean
}) => (
    <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <Label htmlFor="fullName">Họ tên</Label>
                <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="gender">Giới tính</Label>
                <Select
                    value={form.gender}
                    onValueChange={(v) => setField("gender", v as GenderType)}
                >
                    <SelectTrigger id="gender">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {(Object.keys(genderLabels) as GenderType[]).map((g) => (
                            <SelectItem key={g} value={g}>
                                {genderLabels[g]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="birthDate">Ngày sinh</Label>
                <Input
                    id="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setField("birthDate", e.target.value)}
                />
            </div>
        </div>
        <div className="space-y-1.5">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
                id="address"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
            />
        </div>
        <div className="space-y-1.5">
            <Label htmlFor="avatarUrl">Ảnh đại diện</Label>
            <div className="flex gap-2">
                <Input
                    id="avatarUrl"
                    value={form.avatarUrl}
                    onChange={(e) => setField("avatarUrl", e.target.value)}
                    placeholder="https://... hoặc tải ảnh lên"
                />
                <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 gap-1"
                    disabled={uploadingAvatar}
                    onClick={() =>
                        document.getElementById("avatar-file-input")?.click()
                    }
                >
                    <Upload className="w-4 h-4" />
                    {uploadingAvatar ? "Đang tải…" : "Tải ảnh"}
                </Button>
                <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onUploadAvatar(file)
                        e.target.value = ""
                    }}
                />
            </div>
        </div>
        <div className="space-y-1.5">
            <Label htmlFor="headline">Tiêu đề ngắn</Label>
            <Input
                id="headline"
                value={form.headline}
                onChange={(e) => setField("headline", e.target.value)}
                placeholder="VD: Lập trình viên Frontend"
            />
        </div>
        <div className="space-y-1.5">
            <Label htmlFor="bio">Giới thiệu</Label>
            <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                className="min-h-[100px]"
            />
        </div>
        <Separator />
        <p className="text-sm font-medium">Liên kết</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <Label htmlFor="websiteUrl">Website</Label>
                <Input
                    id="websiteUrl"
                    value={form.websiteUrl}
                    onChange={(e) => setField("websiteUrl", e.target.value)}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="github">GitHub</Label>
                <Input
                    id="github"
                    value={form.github}
                    onChange={(e) => setField("github", e.target.value)}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                    id="linkedin"
                    value={form.linkedin}
                    onChange={(e) => setField("linkedin", e.target.value)}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                    id="facebook"
                    value={form.facebook}
                    onChange={(e) => setField("facebook", e.target.value)}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="x">X (Twitter)</Label>
                <Input
                    id="x"
                    value={form.x}
                    onChange={(e) => setField("x", e.target.value)}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                    id="youtube"
                    value={form.youtube}
                    onChange={(e) => setField("youtube", e.target.value)}
                />
            </div>
        </div>
    </div>
)

export default ProfilePage
