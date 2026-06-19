# 04 — Tính năng cốt lõi

Ba trang chính: **Draft Simulator (nhập liệu)**, **Dashboard thống kê**, **Draft Assist (gợi ý real-time)**. Bố cục kỹ thuật xem [`../pattern/06-app-router-i18n.md`](../pattern/06-app-router-i18n.md).

## A. Draft Simulator — nhập liệu, output JSON

Trang riêng ở FE, **output ra JSON, không ghi DB**.

- Chọn Giải → Patch → Series → Ván, bấm từng lượt đúng trình tự ([02-draft-format §2.2](02-draft-format.md)).
- Tự **khoá** tướng đã cấm/chọn trong ván + tướng trong pool cấm chọn quốc tế của đội.
- **Gán lane ngay khi pick (bắt buộc)** — tướng flex (Airi, Allain, Yena…) đi nhiều lane; không có lane thì matchup vô nghĩa.
- **Nhập nhanh:** phím tắt + autocomplete tên tướng. *UX nhập liệu quyết định có đủ dữ liệu hay không* — đây là nút thắt thật, tối ưu hết mức.
- Nhập xong → **validation** ([03-data-model](03-data-model.md)) → nút **Export JSON** tải về file ván/series đúng schema.
- **Tiện ích:** giữ "phiên làm việc" trong `localStorage` để nhập dở không mất; cho **import lại** JSON đã có để sửa/bổ sung trước khi export.

## B. Dashboard Thống kê

- **Meta Overview:** WR / PR / BR theo **patch + lane cụ thể**. Vd: "Tulen Đường Giữa: 62% WR | 35% PR (n=48)".
- **Luôn hiển thị cỡ mẫu (n) + khoảng tin cậy** ([05-statistics](05-statistics.md)) — đây là điểm phân biệt công cụ nghiêm túc với bảng số gây hiểu lầm.
- **Synergy/cặp đôi:** "Krizzix + Violet Đường Rồng: 58% WR (n=21)".
- **Global-Ban Pool Tracker:** ma trận tướng đã dùng của 2 đội trong series; cảnh báo "Đội A đã tiêu 8 tướng meta, chỉ còn X".

## C. Draft Assist — gợi ý real-time

Mỗi gợi ý kèm **1 dòng lý do + số liệu** (n và WR đã làm mượt). "Real-time" = tính lại trên client ngay khi click, không round-trip server.

1. **Cấm lượt 1:** tướng ban-rate cao toàn patch + tướng flex nguy hiểm (đi nhiều lane → khó đoán bài).
2. **Pick lượt 1:** ưu tiên WR cao chưa bị cấm + khả năng flex để giấu lane; counter cơ bản khi đối phương đã lộ tướng.
3. **Cấm lượt 2 (Target Ban):** chặn tướng còn lại của đối phương khắc chế đội hình bạn. Vd: bạn đã có 2 Pháp Sư → cảnh báo cấm sát thủ tuyến sau (Nakroth/Quillen…).
4. **Pick lượt 2 (hoàn thiện đội hình):** kiểm tra thiếu gì (AD/AP, khống chế, đẩy lẻ, chống chịu) và bù; counter trực tiếp tướng đã lộ.
5. **Blind Pick ván 7:** không có dữ liệu đối phương → gợi ý theo WR tổng cao + flex nhiều lane + khó bị khắc chế cứng.

## D. Matchup Analysis

- **Lane đơn 1v1:** vd Tà Thần Omen vs Airi → WR, KDA, gold diff phút 10.
- **Cặp Đường Rồng 2v2:** vd Violet+Krizzix vs Laville+Rouie → WR, tỉ lệ first turret.
- **Rừng (ảnh hưởng toàn map):** vd "Nakroth đi rừng → tỉ lệ first blood ở Tà Thần 45%".

## E. Draft Report — chấm điểm đội hình

Rubric, mỗi tiêu chí 0–100 có trọng số → xuất ra **điểm yếu rõ ràng**:

| Tiêu chí | Đo bằng gì |
|---|---|
| Cân bằng sát thương | Tỉ lệ AD/AP; phạt nếu lệch hẳn (dễ bị khắc giáp/kháng phép) |
| Khống chế (CC) | Tổng/độ cứng skill CC; có CC cứng để mở giao tranh không |
| Mở/huỷ giao tranh | Có engage (Đại Thiên Sứ, Lữ Bố…) và disengage/peel không |
| Đẩy lẻ & kiểm soát map | Có tướng split (Wisp, Murad…) không |
| Đường cong sức mạnh | Mạnh sớm hay scale late; lệch hẳn là rủi ro |

Ví dụ output: "Đội Xanh thiếu khống chế cứng + dồn sát thương AP → dễ bị kéo late và khắc bằng kháng phép."
