# Design — Thiết kế sản phẩm AOV DraftMind

Thư mục này mô tả **sản phẩm và nghiệp vụ**: AOV DraftMind làm gì, theo luật nào, dữ liệu ra sao, tính toán thế nào. Nguồn gốc là [`aov_draftmind_proposal.md`](../../aov_draftmind_proposal.md) — các file ở đây là bản chắt lọc, có cấu trúc để dùng khi code.

Pattern *code* (cách hiện thực) nằm ở [`../pattern/`](../pattern/).

| File | Nội dung |
|------|----------|
| [01-product-overview.md](01-product-overview.md) | Định vị, kiến trúc FE-only, nguyên tắc thiết kế |
| [02-draft-format.md](02-draft-format.md) | Luật cấm/chọn chính thức (Garena ĐTDV/AIC) |
| [03-data-model.md](03-data-model.md) | JSON schema + tổ chức file dữ liệu |
| [04-features.md](04-features.md) | Đặc tả tính năng cốt lõi |
| [05-statistics.md](05-statistics.md) | Thuật toán thống kê (Bayes, Wilson, …) |
| [06-roadmap-kpi.md](06-roadmap-kpi.md) | Roadmap + KPI |

## Nguyên tắc xuyên suốt (đọc trước)

1. **Chính xác về luật trước, đẹp sau.** Sai thể thức = mất uy tín.
2. **Trung thực về độ tin cậy số liệu.** WR trên 3–4 trận **không phải** WR. Luôn hiển thị cỡ mẫu (n) + khoảng tin cậy.
3. **Gợi ý phải giải thích được.** Mỗi gợi ý kèm lý do + số liệu, không "hộp đen".
4. **FE-only, zero backend (cho draft).** Dữ liệu là JSON tĩnh, tính trong browser. Cập nhật dữ liệu = sửa JSON + deploy lại.
5. **Mọi thống kê lọc theo `patch_id`.** Gộp xuyên patch là sai về meta.
