import { DRAFT_SEQUENCE } from "./sequence"
import type { DraftMeta, FilledStep } from "./types"

/** Chuẩn hoá chuỗi thành slug an toàn cho `id` (a-z, 0-9, gạch dưới). */
export const slugify = (input: string): string =>
    input
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/đ/gi, "d")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")

/** `team_id` dẫn xuất từ tên đội. */
export const teamId = (name: string): string => `team_${slugify(name)}`

/** Kiểm tra dữ liệu trước khi export; trả về danh sách lỗi (rỗng = hợp lệ). */
export const validate = (meta: DraftMeta, filled: Array<FilledStep>): Array<string> => {
    const errors: Array<string> = []

    if (!meta.tournamentName.trim()) errors.push("Thiếu tên giải.")
    if (!meta.patchId.trim()) errors.push("Thiếu patch_id (vd p_1_50).")
    if (!meta.playedAt.trim()) errors.push("Thiếu ngày thi đấu.")
    if (!meta.teamBlueName.trim()) errors.push("Thiếu tên đội Xanh.")
    if (!meta.teamRedName.trim()) errors.push("Thiếu tên đội Đỏ.")
    if (!meta.winner) errors.push("Chưa chọn đội thắng.")
    if (
        meta.teamBlueName.trim() &&
        meta.teamRedName.trim() &&
        teamId(meta.teamBlueName) === teamId(meta.teamRedName)
    ) {
        errors.push("Hai đội không được trùng tên.")
    }

    const missingHero = DRAFT_SEQUENCE.filter((s) => !filled[s.index]?.heroId)
    if (missingHero.length > 0) {
        errors.push(`Còn ${missingHero.length} ô chưa chọn tướng (đủ 8 cấm + 10 chọn).`)
    }

    const missingLane = DRAFT_SEQUENCE.filter(
        (s) => s.action === "pick" && filled[s.index]?.heroId && !filled[s.index]?.lane,
    )
    if (missingLane.length > 0) {
        errors.push(`Còn ${missingLane.length} pick chưa gán lane.`)
    }

    const heroIds = DRAFT_SEQUENCE.map((s) => filled[s.index]?.heroId).filter(Boolean) as Array<string>
    const dup = heroIds.filter((id, i) => heroIds.indexOf(id) !== i)
    if (dup.length > 0) {
        errors.push(`Trùng tướng trong ván: ${Array.from(new Set(dup)).join(", ")}.`)
    }

    return errors
}

/**
 * Dựng object series (chứa 1 ván) đúng schema `matches/<giai>.json`.
 * Gọi sau khi `validate` trả mảng rỗng.
 */
export const buildSeries = (meta: DraftMeta, filled: Array<FilledStep>): Record<string, unknown> => {
    const blueId = teamId(meta.teamBlueName)
    const redId = teamId(meta.teamRedName)
    const winnerId = meta.winner === "blue" ? blueId : redId

    const draftActions = DRAFT_SEQUENCE.map((step) => {
        const slot = filled[step.index]
        const lane = step.action === "pick" ? slot.lane : null

        // Counter-pick: pick có lane mà trước đó đối phương đã lộ tướng cùng lane.
        let isCounterPick = false
        if (step.action === "pick" && lane) {
            isCounterPick = DRAFT_SEQUENCE.some((earlier) => {
                if (earlier.action !== "pick" || earlier.index >= step.index) return false
                if (earlier.side === step.side) return false
                return filled[earlier.index]?.lane === lane
            })
        }

        return {
            turn_number: step.turnNumber,
            pick_index: step.pickIndex,
            team_side: step.side,
            action_type: step.action,
            hero_id: slot.heroId,
            lane_position: lane,
            player_id: null,
            is_counter_pick: isCounterPick,
        }
    })

    const match: Record<string, unknown> = {
        van_number: meta.vanNumber,
        team_blue_id: blueId,
        team_red_id: redId,
        winner_team_id: winnerId,
        is_blind_pick: meta.isBlindPick,
        draft_actions: draftActions,
    }
    if (meta.durationSeconds > 0) match.duration_seconds = meta.durationSeconds

    // Series id ổn định bất kể đội nào Xanh/Đỏ ở ván đang nhập — sắp xếp tên đội theo alphabet.
    // Thêm ngày thi đấu để trận cùng hai đội ở các ngày khác nhau không bị gộp chung.
    const [firstTeam, secondTeam] = [
        slugify(meta.teamBlueName),
        slugify(meta.teamRedName),
    ].sort()
    const datePart = meta.playedAt.replace(/-/g, "_")
    const seriesId = `s_${slugify(meta.tournamentName)}_${datePart}_${firstTeam}vs${secondTeam}`

    return {
        id: seriesId,
        tournament_name: meta.tournamentName,
        patch_id: meta.patchId,
        format: meta.format,
        team_blue_id: blueId,
        team_red_id: redId,
        winner_team_id: winnerId,
        played_at: meta.playedAt,
        matches: [match],
    }
}
