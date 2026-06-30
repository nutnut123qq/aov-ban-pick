/**
 * Type cho domain AOV DraftMind — **khớp 1:1 với JSON tĩnh** trong `public/data/`
 * và `public/images/heroes/manifest.json`. Field giữ nguyên snake_case như trên đĩa
 * để dùng thẳng object đã parse, không cần lớp ánh xạ. Xem `.claude/design/03-data-model.md`.
 *
 * Lưu ý: `id` domain AOV là **chuỗi có nghĩa** (vd "tulen", "p_1_50"), không phải uuid,
 * nên các thực thể này KHÔNG kế thừa `AbstractEntity` (không có createdAt/updatedAt).
 */

/** Vị trí lane khi pick (bắt buộc với mọi pick). */
export type Lane = "ta_than" | "rung" | "giua" | "rong_xa" | "rong_ho_tro"

/** Bên cấm/chọn trong một ván. */
export type TeamSide = "blue" | "red"

/** Loại hành động trong draft. */
export type ActionType = "ban" | "pick"

/** Một tướng trong manifest ảnh (`public/images/heroes/manifest.json`). */
export interface HeroManifest {
    /** Mã tướng có nghĩa, trùng `hero_id` trong dữ liệu trận (vd "tulen"). */
    slug: string
    /** Tên file ảnh trong `public/images/heroes/`. */
    file: string
    /** Tên hiển thị. */
    name: string
}

/** Một hành động cấm/chọn trong trình tự draft của một ván. */
export interface DraftAction {
    /** Nhóm lượt phát sóng 1..15. */
    turn_number: number
    /** Thứ tự pick 1..10 (null nếu là ban). */
    pick_index: number | null
    /** Bên thực hiện. */
    team_side: TeamSide
    /** Ban hay pick. */
    action_type: ActionType
    /** `hero_id` được cấm/chọn. */
    hero_id: string
    /** Lane đã gán (chỉ pick mới có; ban luôn null). */
    lane_position: Lane | null
    /** Tuyển thủ thực hiện pick, hoặc null nếu chưa nhập. */
    player_id: string | null
    /** Pick sau khi đối phương đã lộ tướng cùng lane. */
    is_counter_pick: boolean
}

/** Một ván trong series. */
export interface Match {
    /** Số thứ tự ván trong series. */
    van_number: number
    /** `team_id` bên Xanh của ván này (đổi bên luân phiên theo ván). */
    team_blue_id: string
    /** `team_id` bên Đỏ của ván này. */
    team_red_id: string
    /** `team_id` bên thắng ván. */
    winner_team_id: string
    /** Bên giành mạng đầu (tuỳ chọn). */
    first_blood_team_id?: string
    /** Bên phá trụ đầu (tuỳ chọn). */
    first_turret_team_id?: string
    /** Thời lượng ván tính bằng giây (tuỳ chọn). */
    duration_seconds?: number
    /** Ván chọn ẩn (ván 7 BO7). */
    is_blind_pick: boolean
    /** Trình tự cấm/chọn: đủ 8 cấm + 10 chọn. */
    draft_actions: Array<DraftAction>
}

/** Một series (chứa nhiều ván) — phần tử trong `public/data/matches/<mùa>.json`. */
export interface Series {
    /** Id series có nghĩa (vd "s_apl_2026_2026_06_18_bacvsfpt"). */
    id: string
    /** Tên giải hiển thị. */
    tournament_name: string
    /** `patch_id` áp dụng cho series. */
    patch_id: string
    /** Thể thức (BO1/BO3/BO5/BO7). */
    format: string
    /** `team_id` bên Xanh ở ván 1. */
    team_blue_id: string
    /** `team_id` bên Đỏ ở ván 1. */
    team_red_id: string
    /** `team_id` đội thắng series. */
    winner_team_id: string
    /** Ngày thi đấu (YYYY-MM-DD). */
    played_at: string
    /** Các ván trong series. */
    matches: Array<Match>
}

/** Manifest `public/data/index.json` — liệt kê các file mùa cần load. */
export interface DataIndex {
    /** Danh sách id mùa (mỗi id ↔ file `matches/<id>.json`). */
    matches: Array<string>
}
