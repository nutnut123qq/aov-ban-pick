# AOV DraftMind — Trợ lý Cấm/Chọn Liên Quân Mobile
### Đề xuất sản phẩm (bản chỉnh sửa & cải thiện)

> Phiên bản này giữ nguyên ý tưởng gốc của bạn, sửa lại vài điểm về luật cho khớp bộ luật chính thức của Garena (ĐTDV / AIC), bổ sung những phần còn thiếu trong schema và thuật toán, và nói thẳng về rủi ro dữ liệu — phần quyết định sản phẩm này sống hay chết.
>
> **Kiến trúc đã chốt:** chỉ xây **Front-End thuần** (SPA chạy trên browser), **không host Back-End, không database server, không đăng nhập**. Toàn bộ dữ liệu là **file JSON tĩnh** đi kèm site. Một UI nhập liệu riêng ở FE giúp nhập trận đấu rồi **export ra JSON**, sau đó merge thủ công (có script local hỗ trợ) vào file dữ liệu chính. Schema, quy trình thu thập và roadmap bên dưới đã được viết lại theo đúng hướng này.

---

## 1. Tổng quan sản phẩm

**Tên:** AOV DraftMind — Trợ lý Draft Liên Quân
**Mục tiêu:** Cung cấp thống kê và gợi ý cấm/chọn theo thời gian thực dựa trên dữ liệu giải chuyên nghiệp và rank cao.
**Đối tượng:** HLV/phân tích viên đội tuyển, caster, người chơi Cao Thủ/Chiến Tướng, fan phân tích chiến thuật.

**Định vị một câu:** "Bảng cấm/chọn trong game, nhưng có thêm số liệu và gợi ý ở mỗi lượt."

**Nguyên tắc thiết kế (thêm mới):**
- **Chính xác về luật** trước, đẹp sau. Sai thể thức là mất uy tín ngay.
- **Trung thực về độ tin cậy của số liệu.** Win rate trên 4 trận không phải là win rate — phải hiển thị kèm cỡ mẫu/độ tin cậy (xem mục 5).
- **Gợi ý phải giải thích được.** HLV không tin "hộp đen"; mỗi gợi ý cần kèm lý do và số liệu.
- **FE-only, zero backend.** Mọi thứ chạy trong browser; dữ liệu là file JSON tĩnh. Không server, không DB, không auth → deploy free (GitHub Pages / Vercel / Netlify), không chi phí vận hành, không lo bảo mật phía server. Đánh đổi: không có cộng tác real-time, mọi cập nhật dữ liệu là một lần build/deploy lại.

---

## 2. Thể thức nền tảng (đã đối chiếu luật chính thức)

Đây là phần phải **hardcode chuẩn**. Sau khi đối chiếu bộ luật ĐTDV và AIC của Garena, các điểm cần lưu ý:

### 2.1 Chọn bên (bước thường bị bỏ sót)
Trước ván 1, hai đội **tung đồng xu**: đội thắng chọn ngồi **Xanh (cấm/chọn trước)** hoặc **Đỏ (cấm/chọn sau)**. Từ ván 2 trở đi, **đổi bên luân phiên** (đội ván trước là Xanh thì ván sau là Đỏ). Tool cần lưu thông tin bên của từng đội theo từng ván, vì lợi thế Xanh/Đỏ ảnh hưởng tới thống kê.

### 2.2 Trình tự cấm/chọn một ván
Mỗi đội **cấm 4 – chọn 5**. Tổng: **8 cấm + 10 chọn**.

| Giai đoạn | Hành động | Ghi chú |
|---|---|---|
| Cấm lượt 1 | X – Đ – X – Đ | 4 tướng bị cấm |
| Chọn lượt 1 | X1 – Đ2 – X2 – Đ1 | Snake 1-2-2-1, mỗi bên 3 tướng |
| Cấm lượt 2 | Đ – X – Đ – X | 4 tướng bị cấm (Đỏ cấm trước) |
| Chọn lượt 2 | Đ1 – X2 – Đ1 | Mỗi bên thêm 2 tướng |
| **Tổng** | | **Xanh 5 / Đỏ 5 = 10 tướng** |

> ⚠️ **Lưu ý quan trọng về cách đếm "lượt":** Bản gốc ghi "lượt 1–15" nhưng lại có lượt chọn đôi (Chọn 2) — nên thực tế số *hành động chọn* nhiều hơn 15. Trong code nên tách rõ hai khái niệm:
> - **`turn_number`** = thứ tự *nhóm* hành động (giống bảng trên),
> - **`pick_index`** = thứ tự *từng tướng* được chọn (1→10), dùng để xác định ai counter-pick ai.
>
> Trình tự alternation chính xác (đặc biệt ai cấm trước ở Cấm lượt 2 và thứ tự Chọn lượt 2) **nên đối chiếu lại với hình minh hoạ trong rulebook ĐTDV bản mới nhất** trước khi hardcode, vì Garena có điều chỉnh nhẹ giữa các mùa. Bảng trên là trình tự phổ biến nhất hiện hành.

### 2.3 Luật cấm chọn quốc tế ("Global Ban" / bạn gọi là Fearless)
- Thuật ngữ: trong cộng đồng LMHT mới gọi là *Fearless Draft*; trong Liên Quân **luật chính thức gọi là "luật cấm chọn quốc tế" (global ban/pick)**, áp dụng từ 2019. Nên dùng đúng tên này trong sản phẩm để chuyên nghiệp.
- Cơ chế: trong một series BO3/BO5/BO7, **tướng một đội đã *chọn ra trận* ở ván trước thì đội đó không được chọn lại** ở các ván sau. **Không khoá với đội đối phương** — đối phương vẫn dùng được tướng đó (một lần của riêng họ). Đây là điểm bạn đã ghi đúng.
- **BO7 — ván 7:** áp dụng **Chọn Ẩn (Blind Pick)** sau ván 6. Quan trọng: ở ván 7, luật global ban **được reset** — hai đội được dùng lại tướng đã chơi từ ván 1–6, và **không nhìn thấy cấm/chọn của đối phương**. HLV đăng ký trước danh sách tướng chọn ẩn.

---

## 3. Kiến trúc dữ liệu (JSON Schema — không database)

Vì không có DB server, dữ liệu được tổ chức thành **các file JSON tĩnh** nằm trong thư mục `public/data/` của site. Quan hệ giữa các thực thể giữ nguyên tư duy quan hệ (tham chiếu qua `id`), nhưng lưu dưới dạng JSON và **join/tính toán trong browser** khi load.

**Tổ chức file đề xuất:**
```
public/data/
  heroes.json        # danh mục tướng — gần như tĩnh, ít đổi
  patches.json       # danh sách patch
  teams.json         # đội tuyển
  players.json       # tuyển thủ
  matches/
    2024-s1.json     # tách file theo giải/mùa cho dễ merge & nhẹ khi load
    2024-s2.json
  index.json         # manifest: liệt kê các file matches để app biết load gì
```

> **Vì sao tách `matches/` theo mùa thay vì một file khổng lồ?** Một file JSON gộp hết sẽ phình to, mỗi lần thêm 1 ván phải tải lại toàn bộ và git diff khó đọc. Tách theo giải/mùa giúp merge thủ công an toàn hơn và app có thể lazy-load đúng phần cần.

**Schema từng thực thể** (dưới dạng JSON, `id` là chuỗi để dễ đọc/merge):

```jsonc
// heroes.json — danh mục tướng (gần như tĩnh)
[
  {
    "id": "tulen",
    "name": "Tulen",
    "name_alias": ["Telane", "Tê Len"],   // map tên caster/cộng đồng
    "primary_role": "phap_su",             // sat_thu | phap_su | xa_thu | do_do | tro_thu | ...
    "flex_lanes": ["giua"],                // các lane tướng đi được
    "damage_type": "AP",                   // AD | AP | hybrid | true
    "tags": ["poke", "burst"]              // engage | poke | splitpush | peel | dive ...
  }
]

// patches.json
[
  { "id": "p_1_50", "version": "1.50", "release_date": "2024-03-01", "is_major_rework": false }
]

// teams.json / players.json
[ { "id": "team_saigon", "name": "Saigon Buffalo", "region": "VN", "logo_url": "" } ]
[ { "id": "p_lai", "ign": "Lai", "team_id": "team_saigon", "main_role": "rung" } ]
```

```jsonc
// matches/<giai>.json — mỗi phần tử là 1 SERIES, chứa các ván lồng bên trong
[
  {
    "id": "s_dtdv2024_chk1_sgbvshl",
    "tournament_name": "ĐTDV Mùa Xuân 2024",
    "patch_id": "p_1_50",
    "format": "BO3",                       // BO3 | BO5 | BO7
    "team_blue_id": "team_saigon",         // bên ở VÁN 1 (xem 2.1)
    "team_red_id": "team_hanoi",
    "winner_team_id": "team_saigon",
    "played_at": "2024-03-15",

    "matches": [                           // các ván trong series
      {
        "van_number": 1,
        "team_blue_id": "team_saigon",     // LƯU bên theo TỪNG ván (đổi bên luân phiên)
        "team_red_id": "team_hanoi",
        "winner_team_id": "team_saigon",
        "first_blood_team_id": "team_saigon",
        "first_turret_team_id": "team_hanoi",
        "duration_seconds": 1820,
        "is_blind_pick": false,            // true ở ván 7 BO7

        "draft_actions": [                 // trình tự cấm/chọn (xem 2.2)
          {
            "turn_number": 1,              // nhóm lượt
            "pick_index": null,            // thứ tự từng tướng 1..10 (null nếu là ban)
            "team_side": "blue",           // blue | red
            "action_type": "ban",          // ban | pick
            "hero_id": "nakroth",
            "lane_position": null,          // ta_than | rung | giua | rong_xa | rong_ho_tro
            "player_id": null,
            "is_counter_pick": false        // pick sau khi đối phương đã lộ tướng cùng lane
          }
          // ... đủ 8 ban + 10 pick
        ],

        "matchups": [                      // (tuỳ chọn) đối đầu theo lane
          {
            "lane": "giua",
            "hero_blue_id": "tulen",
            "hero_red_id": "lauriel",
            "result": "blue",
            "kda_blue": "5/2/7",
            "kda_red": "2/5/4",
            "gold_diff_10min": 1200
          }
        ]
      }
    ]
  }
]
```

**Lưu ý thiết kế (đã chuyển sang tư duy FE/JSON):**
- **`fearless_pool` (pool cấm chọn quốc tế) là dữ liệu DẪN XUẤT, KHÔNG lưu trong JSON.** Tính trong browser từ `draft_actions` (action_type='pick') của từng đội trong series. Lưu riêng → dễ lệch khi merge tay.
- **Mọi thống kê phải lọc theo `patch_id`.** Gộp xuyên patch là sai về meta. App nên có bộ lọc patch ở mọi dashboard.
- **"Index" thay cho index DB:** vì tính toán trên client, lần đầu load app sẽ **build sẵn các bảng tra cứu trong bộ nhớ** (map theo `hero_id`, `(patch, hero, lane)`, `(series, team_side)`) rồi cache lại — tương đương index nhưng nằm ở RAM browser. Với vài nghìn ván, kích thước JSON chỉ vài MB, hoàn toàn nằm gọn trong RAM.
- **`id` dùng chuỗi có nghĩa** (không phải số tự tăng) để khi merge tay không bị đụng `id`. Có thể dùng convention `<giai>_<series>_<van>`.

---

## 4. Các tính năng cốt lõi

### A. Nhập liệu Draft (Draft Simulator) — *trang riêng ở FE, output ra JSON*
- Chọn Giải → Patch → Series → Ván, rồi bấm từng lượt theo đúng trình tự mục 2.2.
- Hệ thống **tự khoá** tướng đã cấm/chọn trong ván và tướng trong pool cấm chọn quốc tế của đội.
- **Gán lane ngay khi pick** (bắt buộc — vì tướng flex như Airi, Allain, Yena đi được nhiều lane; không có lane thì matchup vô nghĩa).
- **Chế độ nhập nhanh** bằng phím tắt + autocomplete tên tướng (nhập 500–1000 trận thủ công là cực hình; UX nhập liệu quyết định bạn có đủ dữ liệu hay không).
- **Output là JSON, không ghi DB.** Nhập xong → **validation** (mục 7) → bấm **"Export JSON"** để tải về file ván/series vừa nhập (đúng schema mục 3). Bạn chỉ việc dán/merge nội dung file đó vào file dữ liệu chính rồi deploy lại. Không gọi API, không lưu server.
- **Tuỳ chọn tiện hơn:** trang nhập liệu có thể giữ "phiên làm việc" trong `localStorage` để nhập dở không mất, và cho phép **import lại** file JSON đã có để sửa/bổ sung trước khi export.

### B. Dashboard Thống kê
- **Meta Overview:** WR / PR / BR theo **patch + lane cụ thể**. Ví dụ: "Tulen Đường Giữa: 62% WR | 35% PR (n=48)".
- **Luôn hiển thị cỡ mẫu (n) và khoảng tin cậy** — xem mục 5, đây là điểm khác biệt giữa một công cụ nghiêm túc và một bảng số liệu gây hiểu lầm.
- **Synergy/cặp đôi:** "Krizzix + Violet Đường Rồng: 58% WR (n=21)".
- **Global-Ban Pool Tracker:** ma trận tướng đã dùng của 2 đội trong series, cảnh báo "Đội A đã tiêu 8 tướng meta, chỉ còn lại X".

### C. Gợi ý thông minh (Layer phân tích)
1. **Gợi ý Cấm lượt 1:** tướng ban-rate cao toàn patch + tướng flex nguy hiểm (đi nhiều lane → khó đoán bài).
2. **Gợi ý Pick lượt 1:** ưu tiên tướng WR cao chưa bị cấm + khả năng flex để giấu lane; counter cơ bản khi đối phương đã lộ tướng.
3. **Gợi ý Cấm lượt 2 (Target Ban):** chặn tướng còn lại của đối phương có thể khắc chế đội hình bạn. Ví dụ: bạn đã có 2 Pháp Sư → cảnh báo cấm sát thủ vào tuyến sau (Nakroth/Quillen...).
4. **Gợi ý Pick lượt 2 (hoàn thiện đội hình):** kiểm tra đội thiếu gì (sát thương AD/AP, khống chế, đẩy lẻ, chống chịu) và bù; counter trực tiếp tướng đã lộ.
5. **Blind Pick ván 7:** không có dữ liệu đối phương → gợi ý theo WR tổng cao + flex nhiều lane + khó bị khắc chế cứng.

### D. Phân tích đối đầu (Matchup Analysis)
- **Lane đơn 1v1:** vd Tà Thần Omen vs Airi → WR, KDA, gold diff phút 10.
- **Cặp Đường Rồng 2v2:** vd Violet+Krizzix vs Laville+Rouie → WR, tỉ lệ first turret.
- **Rừng (ảnh hưởng toàn map):** vd "Nakroth đi rừng → tỉ lệ first blood ở Tà Thần 45%".

### E. Báo cáo Draft (Draft Report) — *làm rõ phần "điểm draft"*
Bản gốc nói "đánh giá cân bằng đội hình" nhưng chưa định nghĩa. Đề xuất rubric chấm điểm cụ thể (mỗi tiêu chí 0–100, có trọng số):

| Tiêu chí | Đo bằng gì |
|---|---|
| Cân bằng sát thương | Tỉ lệ nguồn AD/AP; phạt nếu lệch hẳn một loại (dễ bị khắc chế giáp/kháng phép) |
| Khống chế (CC) | Tổng số/độ cứng skill khống chế, có CC cứng để mở giao tranh không |
| Mở/huỷ giao tranh | Có engage (Đại Thiên Sứ, Lữ Bố...) và disengage/peel không |
| Đẩy lẻ & kiểm soát map | Có tướng split (Wisp, Murad...) không |
| Đường cong sức mạnh | Mạnh sớm hay scale late; lệch hẳn về một phía là rủi ro |

→ Xuất ra **điểm yếu rõ ràng**: "Đội Xanh thiếu khống chế cứng + dồn sát thương AP → dễ bị kéo late và khắc bằng kháng phép."

---

## 5. Thuật toán & xử lý dữ liệu

### Vấn đề cốt lõi phải xử lý đầu tiên: **cỡ mẫu nhỏ**
Mỗi patch chỉ kéo dài vài tuần, mỗi giải vài chục–vài trăm trận. Một tướng có thể chỉ được pick 3–10 lần/patch. **"Thắng 3/3 = 100% WR" là vô nghĩa.** Đây là rủi ro số 1 khiến gợi ý sai.

**Giải pháp (V1, đơn giản mà đúng): làm mượt Bayes (Beta-Binomial / empirical Bayes).**
- Thay vì `WR = thắng/tổng`, dùng `WR = (thắng + α) / (tổng + α + β)`, với `α, β` lấy từ WR trung bình toàn meta (prior). Tướng ít trận sẽ bị "kéo về" mức trung bình thay vì nhảy lên 100%.
- Hiển thị kèm **khoảng tin cậy (Wilson interval)** và **mã màu theo cỡ mẫu** (xám nếu n<10). Người dùng phải thấy ngay "số này có đáng tin không".

### V1 — MVP (thống kê)
- Đếm tần suất pick/ban/win/loss + làm mượt Bayes ở trên.
- **Xác suất điều kiện:** P(Win | pick Hero X lane Y khi đối phương đã có Hero Z).
- **Luật kết hợp (Apriori):** "nếu địch có A và B thì mình nên có C" — cẩn thận với support thấp.

### V2–V3 — nâng cao (chỉ làm khi đã có ≥ vài nghìn trận)
- **Hồi quy Logistic:** dự đoán WR của draft hiện tại sau mỗi lượt (giải thích được — hợp với HLV).
- **Lọc cộng tác / tìm draft tương tự** đã thắng trong quá khứ.
- **Mô hình cây (Random Forest/GBM)** gợi ý pick theo đặc trưng đội hình.

> Thực tế: với lượng dữ liệu thật của Liên Quân, **một mô hình logistic regression giải thích được + làm mượt Bayes thường tốt và đáng tin hơn một mô hình ML phức tạp.** Đừng nhảy lên deep learning sớm. Quản lý kỳ vọng về độ chính xác.

---

## 6. UI/UX & kiến trúc kỹ thuật (FE-only)

**Stack đề xuất:**
- **Vite + React + TypeScript** (hoặc Vue — tuỳ bạn quen tay). TypeScript quan trọng vì schema JSON phức tạp, gõ sai field sẽ tốn thời gian debug.
- **Tính toán thống kê trong browser:** load JSON → build bảng tra cứu trong RAM → tính WR/PR/BR + làm mượt Bayes ngay trên client. Không cần thư viện nặng; Bayes/Wilson chỉ là vài chục dòng JS.
- **State:** React state/Context hoặc Zustand là đủ; không cần Redux.
- **Deploy:** GitHub Pages / Vercel / Netlify (free). Cập nhật dữ liệu = thay file JSON + push → tự build lại.

**3 trang chính:**
1. **Draft Simulator (nhập liệu)** — mục 4A, export JSON.
2. **Dashboard thống kê** — mục 4B/4D.
3. **Draft Assist (gợi ý real-time)** — bố cục dưới đây.

**Bố cục trang Draft Assist:**
- **Trái:** bảng cấm/chọn tương tác (giống giao diện game nhưng giàu thông tin hơn).
- **Phải:** panel gợi ý — Top 5 tướng nên cấm/chọn ở lượt hiện tại, **mỗi gợi ý kèm 1 dòng lý do + số liệu** (n và WR đã làm mượt).
- **Dưới:** Pool Tracker cấm chọn quốc tế (ma trận tướng đã dùng trong series).
- **Real-time:** mỗi lần click cập nhật WR dự đoán của draft, tướng bị ảnh hưởng (counter/bị counter), và cảnh báo mất cân bằng đội hình theo rubric mục 4E. "Real-time" ở đây là **tính lại trên client ngay khi click** — không round-trip server, nên cực nhanh.

---

## 7. Nguồn dữ liệu & thu thập — *phần quyết định thành/bại*

Bạn đã đánh dấu đây là thách thức lớn nhất. Đúng. Nói thẳng hơn:

- **Không có public API chính thức từ Garena.** Đừng xây sản phẩm dựa trên giả định có API.
- **Crawl trang giải/VOD:** vướng cả mặt kỹ thuật lẫn **bản quyền/ToS** (tên + hình tướng, nội dung giải là tài sản của Garena/Tencent). Nên dùng dữ liệu *sự kiện trận đấu* (ai pick gì) — vốn là dữ kiện, ít rủi ro hơn là sao chép hình ảnh/nội dung. Vẫn nên rà soát pháp lý trước khi công khai.
- **Lối đi thực tế nhất cho V1:** **nhập liệu thủ công có cấu trúc** từ VOD, do bạn (hoặc cộng tác viên) làm bằng chính trang Draft Simulator. Vì vậy **công cụ nhập liệu (mục 4A) phải nhanh nhất có thể** — đây là nút thắt thật sự, không phải thuật toán.
- **Mở rộng:** vì không có server, "crowdsource" ở mô hình FE-only nghĩa là cộng tác viên export JSON rồi gửi cho bạn (qua Git PR / chat) để bạn merge — không có nhập đồng thời. Cân nhắc OCR màn hình draft để bán-tự-động sau.

### 7.1 Quy trình cập nhật dữ liệu (FE-only, không backend)

Đây là phần thay cho "ghi vào DB". Luồng cụ thể:

```
[Trang Draft Simulator]  →  nhập ván  →  validation  →  bấm Export JSON
        ↓ (tải về máy: van_moi.json)
[Script merge local]     →  node scripts/merge.js van_moi.json
        ↓ (validate lần 2 + append vào public/data/matches/<giai>.json + cập nhật index.json)
[git commit + push]      →  Vercel/Pages tự build  →  dữ liệu mới lên site
```

- **Script merge (`scripts/merge.js`)** chạy bằng Node trên máy bạn — đây là đoạn "backend" duy nhất, nhưng **chỉ chạy local lúc build dữ liệu**, không host gì cả. Nó: (1) đọc file JSON vừa export, (2) chạy lại validation, (3) chống trùng `id`, (4) append vào đúng file mùa, (5) cập nhật `index.json`. Nếu lười, có thể merge tay — nhưng script giảm sai sót khi dữ liệu lớn dần.
- **Không cần script cũng được:** với ít trận, bạn hoàn toàn có thể copy-paste khối JSON từ Export vào file dữ liệu bằng tay. Script chỉ là tiện ích, không phải thành phần bắt buộc của sản phẩm.

**Quy tắc chất lượng dữ liệu:** mỗi ván phải qua validation — đủ 8 cấm + 10 chọn, không trùng tướng trong ván, mọi pick có lane, tổng mỗi bên đúng 5, `hero_id`/`team_id`/`patch_id` đều tồn tại trong danh mục. **Validation chạy 2 nơi:** ở trang nhập liệu (chặn export nếu sai) và trong script merge (chặn ghi vào file chính nếu sai).

---

## 8. Roadmap

| Giai đoạn | Thời gian | Nội dung | Điều kiện thoát |
|---|---|---|---|
| **V1 – MVP** | 2–3 tuần (code) | Trang nhập liệu (export JSON) + load JSON tĩnh + thống kê WR/PR/BR có làm mượt Bayes + cỡ mẫu. Script merge local. Chưa có ML. | Nhập → export → merge → xem thống kê chạy trơn tru; số liệu hiển thị kèm độ tin cậy |
| **V2 – Draft Assist** | 1–2 tháng | Gợi ý cấm/chọn theo thống kê + Global-Ban Pool Tracker | Có ≥ 200–300 trận sạch để gợi ý có nghĩa |
| **V3 – AI Draft** | 3–4 tháng | Logistic regression dự đoán WR, rubric chấm đội hình, báo cáo draft | Có ≥ vài nghìn trận; mô hình vượt baseline |
| **V4 – Blind Pick** | 5–6 tháng | Tối ưu ván 7 BO7, phân tích cặp Đường Rồng 2v2 sâu | — |

> Lưu ý: timeline code MVP 2–3 tuần là hợp lý, nhưng **đồng hồ thật sự chạy theo tốc độ thu thập dữ liệu**, không theo tốc độ code. Nên khởi động nhập liệu song song ngay từ tuần 1.

---

## 9. Đánh giá khả thi

| Khía cạnh | Đánh giá | Ghi chú |
|---|---|---|
| Kỹ thuật | ✅ Khả thi (dễ hơn) | FE-only: không DB, không API, không auth → ít thứ phải làm hẳn. Chủ yếu là UI + thống kê client-side. Phần khó vẫn là UX nhập liệu |
| Vận hành/Chi phí | ✅ Gần như $0 | Deploy static free; không server để duy trì, không lo bảo mật/scaling phía server |
| **Dữ liệu** | ⚠️ **Thách thức số 1** | Cần ~500–1000 trận chuyên nghiệp/patch để có ý nghĩa; không có API; nút thắt là tốc độ nhập tay |
| Cộng tác/Cập nhật | ⚠️ Hạn chế của FE-only | Không nhập đồng thời, không real-time đa người; mỗi lần cập nhật dữ liệu = merge JSON + deploy lại. Chấp nhận được khi 1 người (bạn) làm chủ dữ liệu |
| Quy mô dữ liệu | ✅ Đủ cho mục tiêu | Vài nghìn ván ≈ vài MB JSON — load & tính trong browser thoải mái. Nếu sau này tới hàng chục nghìn ván mới cần nghĩ tới tách file kỹ hơn / IndexedDB |
| Pháp lý/IP | ⚠️ Cần rà soát | Tên/hình tướng & nội dung giải thuộc Garena/Tencent; nên rà ToS trước khi public |
| Thị trường | ✅ Tiềm năng | Cộng đồng Liên Quân VN rất lớn, nhiều fan chiến thuật |
| Độ chính xác | ⚠️ Phụ thuộc meta | Reset thống kê theo patch/rework lớn; luôn show cỡ mẫu để tránh gợi ý sai |

---

## 10. Chỉ số thành công (KPI — thêm mới)
- **Chất lượng dữ liệu:** số trận sạch/tuần; tỉ lệ ván nhập lỗi validation.
- **Độ chính xác gợi ý:** so dự đoán WR với kết quả thật (Brier score / log-loss), backtest trên trận đã có.
- **Mức dùng:** số series được dựng lại trong tool; thời gian trung bình nhập 1 ván (càng giảm càng tốt).
- **Giá trị cho HLV:** khảo sát định tính — gợi ý có "giải thích được" và đáng tin không.

---

### Tóm tắt các thay đổi chính so với bản gốc
0. **Chốt kiến trúc FE-only:** bỏ toàn bộ Back-End / database server / đăng nhập. Dữ liệu thành **file JSON tĩnh**; nhập liệu ở FE rồi **export JSON + merge thủ công** (có script local hỗ trợ). Sửa lại mục 1, 3, 4A, 6, 7, 8, 9 theo hướng này.
1. Bổ sung bước **chọn bên (tung đồng xu) + đổi bên luân phiên** vào thể thức.
2. Làm rõ **cách đếm lượt** (turn vs pick_index) và lưu ý đối chiếu trình tự với rulebook mới nhất.
3. Đổi tên **"Fearless" → "luật cấm chọn quốc tế"** cho đúng thuật ngữ Liên Quân; xác nhận ván 7 BO7 reset global-ban + Chọn Ẩn.
4. Thêm **bảng `heroes` và `patches`** (bản gốc thiếu), chuẩn hoá team/player, đề xuất `fearless_pool` là view dẫn xuất.
5. Thêm **làm mượt Bayes + cỡ mẫu/khoảng tin cậy** — sửa lỗi WR cỡ mẫu nhỏ.
6. Cụ thể hoá **rubric chấm điểm đội hình**.
7. Nói thẳng về **rào cản dữ liệu, pháp lý/IP, và validation**.
8. Thêm **KPI** đo lường sản phẩm.
