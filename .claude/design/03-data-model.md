# 03 — Mô hình dữ liệu (JSON tĩnh, không DB)

Không có DB server. Dữ liệu là **file JSON tĩnh** trong `public/data/`, join/tính toán trong browser. Quan hệ giữ tư duy quan hệ (tham chiếu qua `id`), nhưng `id` là **chuỗi có nghĩa** (không số tự tăng) để merge tay không đụng id.

## Tổ chức file

```
public/data/
  heroes.json        # danh mục tướng — gần như tĩnh
  patches.json       # danh sách patch
  teams.json         # đội tuyển
  players.json       # tuyển thủ
  matches/
    2024-s1.json     # tách theo giải/mùa → merge an toàn, lazy-load nhẹ
    2024-s2.json
  index.json         # manifest: liệt kê file matches để app biết load gì
```

> **Vì sao tách `matches/` theo mùa?** File gộp sẽ phình to, mỗi lần thêm ván phải tải lại toàn bộ và git diff khó đọc. Tách theo giải/mùa → merge tay an toàn + lazy-load đúng phần cần.

## Schema từng thực thể

```jsonc
// heroes.json — danh mục tướng (gần như tĩnh)
[{
  "id": "tulen",
  "name": "Tulen",
  "name_alias": ["Telane", "Tê Len"],   // map tên caster/cộng đồng
  "primary_role": "phap_su",             // sat_thu | phap_su | xa_thu | do_do | tro_thu | ...
  "flex_lanes": ["giua"],                // các lane tướng đi được
  "damage_type": "AP",                   // AD | AP | hybrid | true
  "tags": ["poke", "burst"]              // engage | poke | splitpush | peel | dive ...
}]

// patches.json
[{ "id": "p_1_50", "version": "1.50", "release_date": "2024-03-01", "is_major_rework": false }]

// teams.json / players.json
[{ "id": "team_saigon", "name": "Saigon Buffalo", "region": "VN", "logo_url": "" }]
[{ "id": "p_lai", "ign": "Lai", "team_id": "team_saigon", "main_role": "rung" }]
```

```jsonc
// matches/<giai>.json — mỗi phần tử là 1 SERIES, chứa các ván lồng bên trong
[{
  "id": "s_dtdv2024_chk1_sgbvshl",
  "tournament_name": "ĐTDV Mùa Xuân 2024",
  "patch_id": "p_1_50",
  "format": "BO3",                       // BO3 | BO5 | BO7
  "team_blue_id": "team_saigon",         // bên ở VÁN 1 (xem 02-draft-format §2.1)
  "team_red_id": "team_hanoi",
  "winner_team_id": "team_saigon",
  "played_at": "2024-03-15",

  "matches": [{                          // các ván trong series
    "van_number": 1,
    "team_blue_id": "team_saigon",       // LƯU bên theo TỪNG ván (đổi bên luân phiên)
    "team_red_id": "team_hanoi",
    "winner_team_id": "team_saigon",
    "first_blood_team_id": "team_saigon",
    "first_turret_team_id": "team_hanoi",
    "duration_seconds": 1820,
    "is_blind_pick": false,              // true ở ván 7 BO7

    "draft_actions": [{                  // trình tự cấm/chọn (xem 02-draft-format §2.2)
      "turn_number": 1,                  // nhóm lượt
      "pick_index": null,                // thứ tự từng tướng 1..10 (null nếu ban)
      "team_side": "blue",               // blue | red
      "action_type": "ban",             // ban | pick
      "hero_id": "nakroth",
      "lane_position": null,             // ta_than | rung | giua | rong_xa | rong_ho_tro
      "player_id": null,
      "is_counter_pick": false           // pick sau khi đối phương lộ tướng cùng lane
    }
    // ... đủ 8 ban + 10 pick
    ],

    "matchups": [{                       // (tuỳ chọn) đối đầu theo lane
      "lane": "giua",
      "hero_blue_id": "tulen",
      "hero_red_id": "lauriel",
      "result": "blue",
      "kda_blue": "5/2/7",
      "kda_red": "2/5/4",
      "gold_diff_10min": 1200
    }]
  }]
}]
```

## Quy tắc thiết kế dữ liệu

- **`fearless_pool` (pool cấm chọn quốc tế) là dữ liệu DẪN XUẤT — KHÔNG lưu trong JSON.** Tính trong browser từ `draft_actions` (`action_type='pick'`) của từng đội trong series. Lưu riêng → dễ lệch khi merge tay.
- **Mọi thống kê lọc theo `patch_id`.** App có bộ lọc patch ở mọi dashboard.
- **"Index" = bảng tra cứu trong RAM.** Lần đầu load, build sẵn map theo `hero_id`, `(patch, hero, lane)`, `(series, team_side)` rồi cache — tương đương index DB nhưng nằm ở RAM. Vài nghìn ván ≈ vài MB JSON, nằm gọn trong RAM.
- **`id` dùng chuỗi có nghĩa**, convention gợi ý `<giai>_<series>_<van>`.

## Validation (chạy 2 nơi)

Mỗi ván phải qua validation ở **trang nhập liệu** (chặn export nếu sai) **và** trong **script merge** (chặn ghi vào file chính nếu sai):

- Đủ 8 cấm + 10 chọn; không trùng tướng trong ván; mọi pick có lane; mỗi bên đúng 5 tướng.
- `hero_id` / `team_id` / `patch_id` đều tồn tại trong danh mục.
- Chống trùng `id` series/ván khi merge.
