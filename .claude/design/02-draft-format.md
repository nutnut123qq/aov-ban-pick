# 02 — Thể thức cấm/chọn (luật chính thức)

Phần này phải **hardcode chuẩn** theo bộ luật ĐTDV/AIC của Garena. Sai thể thức = mất uy tín.

> ⚠️ Garena điều chỉnh nhẹ trình tự giữa các mùa. **Đối chiếu lại với rulebook ĐTDV bản mới nhất** (đặc biệt thứ tự cấm/chọn lượt 2) trước khi hardcode. Bảng dưới là trình tự phổ biến hiện hành.

## 2.1 Chọn bên (bước thường bị bỏ sót)

- Trước ván 1: hai đội **tung đồng xu**; đội thắng chọn ngồi **Xanh (cấm/chọn trước)** hay **Đỏ (cấm/chọn sau)**.
- Từ ván 2: **đổi bên luân phiên** (đội ván trước là Xanh thì ván sau là Đỏ).
- → Tool phải **lưu bên (blue/red) theo TỪNG ván**, vì lợi thế Xanh/Đỏ ảnh hưởng thống kê. (Trong schema: `team_blue_id`/`team_red_id` ở cả series lẫn từng `match`.)

## 2.2 Trình tự một ván

Mỗi đội **cấm 4 – chọn 5**. Tổng: **8 cấm + 10 chọn**.

| Giai đoạn | Hành động | Ghi chú |
|---|---|---|
| Cấm lượt 1 | X – Đ – X – Đ | 4 tướng bị cấm |
| Chọn lượt 1 | X1 – Đ2 – X2 – Đ1 | Snake 1-2-2-1, mỗi bên 3 tướng |
| Cấm lượt 2 | Đ – X – Đ – X | 4 tướng bị cấm (Đỏ cấm trước) |
| Chọn lượt 2 | Đ1 – X2 – Đ1 | Mỗi bên thêm 2 tướng |
| **Tổng** | | **Xanh 5 / Đỏ 5 = 10 tướng** |

### Hai khái niệm "lượt" — TÁCH RÕ trong code

- **`turn_number`** = thứ tự *nhóm* hành động (giống bảng trên).
- **`pick_index`** = thứ tự *từng tướng* được chọn, 1→10 (null nếu là ban). Dùng để xác định ai counter-pick ai.

> Bản gốc ghi "lượt 1–15" nhưng có lượt chọn đôi → số *hành động chọn* nhiều hơn 15. Đừng dùng một con số "lượt" duy nhất.

## 2.3 Luật cấm chọn quốc tế (Global Ban/Pick)

Cộng đồng LMHT gọi *Fearless Draft*; trong Liên Quân **luật chính thức tên là "luật cấm chọn quốc tế"**, áp dụng từ 2019. **Dùng đúng tên này trong sản phẩm** để chuyên nghiệp.

Cơ chế trong một series BO3/BO5/BO7:

- Tướng một đội đã **chọn ra trận** ở ván trước thì **đội đó không được chọn lại** ở các ván sau.
- **Không khoá với đối phương** — đội kia vẫn dùng được tướng đó (một lần của riêng họ).

## 2.4 BO7 — ván 7: Blind Pick

- Áp dụng **Chọn Ẩn (Blind Pick)** sau ván 6.
- Luật global ban **được reset**: hai đội được dùng lại tướng đã chơi từ ván 1–6.
- Hai đội **không nhìn thấy** cấm/chọn của đối phương; HLV đăng ký trước danh sách tướng chọn ẩn.
- Trong schema: đánh dấu `is_blind_pick: true` ở ván này; gợi ý chuyển sang chế độ "không có dữ liệu đối phương" (xem [04-features.md](04-features.md) mục C5).

## Hệ quả cho code

- Validation một ván: đủ **8 cấm + 10 chọn**, không trùng tướng trong ván, mỗi pick có lane, mỗi bên đúng 5 tướng.
- Khoá tướng đã cấm/chọn trong ván **và** tướng trong pool cấm chọn quốc tế của đội (trừ ván 7 BO7).
- Lane bắt buộc khi pick: `ta_than | rung | giua | rong_xa | rong_ho_tro` (tướng flex đi nhiều lane → không có lane thì matchup vô nghĩa).
