import { z } from "zod"

/** Schema vị trí đường / lane */
export const LaneSchema = z.enum([
    "ta_than",
    "rung",
    "giua",
    "rong_xa",
    "rong_ho_tro",
])


/** Schema phe cấm chọn */
export const TeamSideSchema = z.enum(["blue", "red"])

/** Schema loại hành động draft */
export const ActionTypeSchema = z.enum(["ban", "pick"])

/** Schema cho từng tướng trong manifest ảnh */
export const HeroManifestSchema = z.object({
    slug: z.string().min(1, "Slug tướng không được để trống"),
    file: z.string().min(1, "Tên file ảnh không được để trống"),
    name: z.string().min(1, "Tên hiển thị tướng không được để trống"),
})

export const HeroManifestListSchema = z.array(HeroManifestSchema)

/** Schema cho từng hành động cấm/chọn trong ván đấu */
export const DraftActionSchema = z
    .object({
        turn_number: z.number().int().min(1).max(18),
        pick_index: z.number().int().min(1).max(10).nullable(),
        team_side: TeamSideSchema,
        action_type: ActionTypeSchema,
        hero_id: z.string().min(1, "hero_id không được để trống"),
        lane_position: LaneSchema.nullable(),
        player_id: z.string().nullable().default(null),
        is_counter_pick: z.boolean().default(false),
    })

    .superRefine((action, ctx) => {
        if (action.action_type === "ban") {
            if (action.pick_index !== null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Hành động CẤM (ban) phải có pick_index = null",
                    path: ["pick_index"],
                })
            }
            if (action.lane_position !== null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Hành động CẤM (ban) phải có lane_position = null",
                    path: ["lane_position"],
                })
            }
        }
        if (action.action_type === "pick") {
            if (action.pick_index === null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Hành động CHỌN (pick) phải có pick_index (1..10)",
                    path: ["pick_index"],
                })
            }
            if (action.lane_position === null) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Hành động CHỌN (pick) phải có lane_position hợp lệ",
                    path: ["lane_position"],
                })
            }
        }
    })

/** Schema cho một ván đấu (Match) với các bất biến dữ liệu (Invariants) */
export const MatchSchema = z
    .object({
        van_number: z.number().int().min(1),
        team_blue_id: z.string().min(1, "team_blue_id không được để trống"),
        team_red_id: z.string().min(1, "team_red_id không được để trống"),
        winner_team_id: z.string().min(1, "winner_team_id không được để trống"),
        first_blood_team_id: z.string().optional(),
        first_turret_team_id: z.string().optional(),
        duration_seconds: z.number().int().nonnegative().optional(),
        is_blind_pick: z.boolean().default(false),
        draft_actions: z.array(DraftActionSchema),
    })
    .superRefine((match, ctx) => {
        // Invariant 1: Không được trùng hero_id trong cùng một match (trừ ván chọn ẩn / blind pick)
        if (!match.is_blind_pick) {
            const seenHeroes = new Set<string>()
            for (let i = 0; i < match.draft_actions.length; i++) {
                const action = match.draft_actions[i]
                if (seenHeroes.has(action.hero_id)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Trùng hero_id '${action.hero_id}' trong ván ${match.van_number}`,
                        path: ["draft_actions", i, "hero_id"],
                    })
                }
                seenHeroes.add(action.hero_id)
            }
        }

        // Invariant 2: winner_team_id phải là team_blue_id hoặc team_red_id
        if (
            match.winner_team_id !== match.team_blue_id &&
            match.winner_team_id !== match.team_red_id
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `winner_team_id '${match.winner_team_id}' phải trùng với team_blue_id ('${match.team_blue_id}') hoặc team_red_id ('${match.team_red_id}')`,
                path: ["winner_team_id"],
            })
        }
    })

/** Schema cho Series (tập hợp các ván trong một trận) */
export const SeriesSchema = z.object({
    id: z.string().min(1, "id series không được để trống"),
    tournament_name: z.string().min(1, "tournament_name không được để trống"),
    patch_id: z.string().min(1, "patch_id không được để trống"),
    format: z.string().min(1, "format không được để trống"),
    team_blue_id: z.string().min(1, "team_blue_id không được để trống"),
    team_red_id: z.string().min(1, "team_red_id không được để trống"),
    winner_team_id: z.string().min(1, "winner_team_id không được để trống"),
    played_at: z.string().min(1, "played_at không được để trống"),
    matches: z.array(MatchSchema).min(1, "Series phải có ít nhất 1 match"),
})

export const SeriesListSchema = z.array(SeriesSchema)

/** Schema cho public/data/index.json */
export const DataIndexSchema = z.object({
    matches: z.array(z.string().min(1, "Tên file match trong index không được để trống")),
})

export type LaneSchemaType = z.infer<typeof LaneSchema>
export type DraftActionSchemaType = z.infer<typeof DraftActionSchema>
export type MatchSchemaType = z.infer<typeof MatchSchema>
export type SeriesSchemaType = z.infer<typeof SeriesSchema>
export type DataIndexSchemaType = z.infer<typeof DataIndexSchema>
export type HeroManifestSchemaType = z.infer<typeof HeroManifestSchema>
