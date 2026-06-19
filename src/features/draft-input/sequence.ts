import type { DraftStep, Lane } from "./types"

/**
 * Trình tự cấm/chọn chuẩn ĐTDV: 8 cấm + 10 chọn, 15 lượt phát sóng.
 * Snake pick 1-2-2-1 ở lượt 1, đổi bên cấm trước ở lượt 2.
 * Nguồn: `.claude/design/02-draft-format.md` §2.2.
 */
export const DRAFT_SEQUENCE: ReadonlyArray<DraftStep> = [
    // Cấm lượt 1 — X Đ X Đ
    { index: 0, turnNumber: 1, pickIndex: null, side: "blue", action: "ban", phase: "Cấm lượt 1" },
    { index: 1, turnNumber: 2, pickIndex: null, side: "red", action: "ban", phase: "Cấm lượt 1" },
    { index: 2, turnNumber: 3, pickIndex: null, side: "blue", action: "ban", phase: "Cấm lượt 1" },
    { index: 3, turnNumber: 4, pickIndex: null, side: "red", action: "ban", phase: "Cấm lượt 1" },
    // Chọn lượt 1 — X1 Đ2 X2 Đ1
    { index: 4, turnNumber: 5, pickIndex: 1, side: "blue", action: "pick", phase: "Chọn lượt 1" },
    { index: 5, turnNumber: 6, pickIndex: 2, side: "red", action: "pick", phase: "Chọn lượt 1" },
    { index: 6, turnNumber: 6, pickIndex: 3, side: "red", action: "pick", phase: "Chọn lượt 1" },
    { index: 7, turnNumber: 7, pickIndex: 4, side: "blue", action: "pick", phase: "Chọn lượt 1" },
    { index: 8, turnNumber: 7, pickIndex: 5, side: "blue", action: "pick", phase: "Chọn lượt 1" },
    { index: 9, turnNumber: 8, pickIndex: 6, side: "red", action: "pick", phase: "Chọn lượt 1" },
    // Cấm lượt 2 — Đ X Đ X
    { index: 10, turnNumber: 9, pickIndex: null, side: "red", action: "ban", phase: "Cấm lượt 2" },
    { index: 11, turnNumber: 10, pickIndex: null, side: "blue", action: "ban", phase: "Cấm lượt 2" },
    { index: 12, turnNumber: 11, pickIndex: null, side: "red", action: "ban", phase: "Cấm lượt 2" },
    { index: 13, turnNumber: 12, pickIndex: null, side: "blue", action: "ban", phase: "Cấm lượt 2" },
    // Chọn lượt 2 — Đ1 X2 Đ1
    { index: 14, turnNumber: 13, pickIndex: 7, side: "red", action: "pick", phase: "Chọn lượt 2" },
    { index: 15, turnNumber: 14, pickIndex: 8, side: "blue", action: "pick", phase: "Chọn lượt 2" },
    { index: 16, turnNumber: 14, pickIndex: 9, side: "blue", action: "pick", phase: "Chọn lượt 2" },
    { index: 17, turnNumber: 15, pickIndex: 10, side: "red", action: "pick", phase: "Chọn lượt 2" },
]

/** Các giai đoạn theo thứ tự, để gom nhóm hiển thị. */
export const DRAFT_PHASES: ReadonlyArray<string> = [
    "Cấm lượt 1",
    "Chọn lượt 1",
    "Cấm lượt 2",
    "Chọn lượt 2",
]

/** Lane hợp lệ + nhãn tiếng Việt (thuật ngữ chính thức). */
export const LANES: ReadonlyArray<{ value: Lane; label: string }> = [
    { value: "ta_than", label: "Tà thần (đường rồng/baron)" },
    { value: "rung", label: "Rừng" },
    { value: "giua", label: "Giữa" },
    { value: "rong_xa", label: "Rồng (xạ thủ)" },
    { value: "rong_ho_tro", label: "Hỗ trợ" },
]

/** Nhãn lane ngắn để tra cứu nhanh. */
export const LANE_LABEL: Record<Lane, string> = LANES.reduce(
    (acc, l) => ({ ...acc, [l.value]: l.label }),
    {} as Record<Lane, string>,
)
