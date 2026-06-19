/** Một tướng trong manifest ảnh (`public/images/heroes/manifest.json`). */
export interface HeroManifestEntry {
    /** Mã tướng có nghĩa, trùng `hero_id` trong dữ liệu (vd "tulen"). */
    slug: string
    /** Tên file ảnh trong `public/images/heroes/`. */
    file: string
    /** Tên hiển thị. */
    name: string
}

/** Vị trí lane khi pick (bắt buộc với mọi pick). */
export type Lane = "ta_than" | "rung" | "giua" | "rong_xa" | "rong_ho_tro"

/** Bên cấm/chọn. */
export type TeamSide = "blue" | "red"

/** Loại hành động trong draft. */
export type ActionType = "ban" | "pick"

/**
 * Một bước cố định trong trình tự cấm/chọn — phần "tĩnh" của thể thức,
 * không phụ thuộc người dùng nhập gì. Xem `.claude/design/02-draft-format.md`.
 */
export interface DraftStep {
    /** Thứ tự bước hiển thị, 0-based. */
    index: number
    /** Nhóm lượt phát sóng 1..15. */
    turnNumber: number
    /** Thứ tự pick 1..10 (null nếu là ban). */
    pickIndex: number | null
    /** Bên thực hiện. */
    side: TeamSide
    /** Ban hay pick. */
    action: ActionType
    /** Nhãn giai đoạn để gom nhóm khi hiển thị. */
    phase: string
}

/** Giá trị người dùng nhập cho từng bước (hero + lane). */
export interface FilledStep {
    /** `hero_id` đã chọn, hoặc null nếu chưa chọn. */
    heroId: string | null
    /** Lane đã gán (chỉ với pick), hoặc null. */
    lane: Lane | null
}

/** Thông tin chung của series + ván người dùng nhập. */
export interface DraftMeta {
    /** Tên giải. */
    tournamentName: string
    /** `patch_id`, vd "p_1_50". */
    patchId: string
    /** Thể thức series. */
    format: "BO1" | "BO3" | "BO5" | "BO7"
    /** Ngày thi đấu (YYYY-MM-DD). */
    playedAt: string
    /** Số thứ tự ván trong series. */
    vanNumber: number
    /** Tên đội Xanh. */
    teamBlueName: string
    /** Tên đội Đỏ. */
    teamRedName: string
    /** Bên thắng ván này. */
    winner: TeamSide | ""
    /** Thời lượng ván (giây), 0 nếu chưa nhập. */
    durationSeconds: number
    /** Ván chọn ẩn (ván 7 BO7). */
    isBlindPick: boolean
}
