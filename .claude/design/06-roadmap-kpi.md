# 06 — Roadmap & KPI

## Roadmap

| Giai đoạn | Thời gian | Nội dung | Điều kiện thoát |
|---|---|---|---|
| **V1 – MVP** | 2–3 tuần (code) | Trang nhập liệu (export JSON) + load JSON tĩnh + thống kê WR/PR/BR có làm mượt Bayes + cỡ mẫu. Script merge local. Chưa ML. | Nhập → export → merge → xem thống kê trơn tru; số liệu kèm độ tin cậy |
| **V2 – Draft Assist** | 1–2 tháng | Gợi ý cấm/chọn theo thống kê + Global-Ban Pool Tracker | Có ≥ 200–300 trận sạch để gợi ý có nghĩa |
| **V3 – AI Draft** | 3–4 tháng | Logistic regression dự đoán WR, rubric chấm đội hình, báo cáo draft | Có ≥ vài nghìn trận; mô hình vượt baseline |
| **V4 – Blind Pick** | 5–6 tháng | Tối ưu ván 7 BO7, phân tích cặp Đường Rồng 2v2 sâu | — |

> Timeline code MVP 2–3 tuần là hợp lý, nhưng **đồng hồ thật chạy theo tốc độ thu thập dữ liệu**, không theo tốc độ code. Khởi động nhập liệu song song ngay từ tuần 1.

## Quy trình cập nhật dữ liệu (FE-only)

Thay cho "ghi vào DB":

```
[Draft Simulator] → nhập ván → validation → Export JSON
      ↓ (tải về: van_moi.json)
[Script merge local] → node scripts/merge.js van_moi.json
      ↓ (validate lần 2 + append vào public/data/matches/<giai>.json + cập nhật index.json)
[git commit + push] → Vercel/Pages tự build → dữ liệu mới lên site
```

- `scripts/merge.js` là đoạn "backend" **duy nhất**, chỉ chạy local lúc build dữ liệu — không host gì. Nó: đọc JSON export → validate lại → chống trùng `id` → append đúng file mùa → cập nhật `index.json`.
- Không bắt buộc dùng script: với ít trận có thể copy-paste tay. Script chỉ là tiện ích giảm sai sót khi dữ liệu lớn dần.

## KPI

- **Chất lượng dữ liệu:** số trận sạch/tuần; tỉ lệ ván nhập lỗi validation.
- **Độ chính xác gợi ý:** so dự đoán WR với kết quả thật (Brier score / log-loss), backtest trên trận đã có.
- **Mức dùng:** số series được dựng lại trong tool; thời gian trung bình nhập 1 ván (càng giảm càng tốt).
- **Giá trị cho HLV:** khảo sát định tính — gợi ý có "giải thích được" và đáng tin không.

## Đánh giá khả thi (tóm tắt)

| Khía cạnh | Đánh giá |
|---|---|
| Kỹ thuật | ✅ Khả thi — FE-only, chủ yếu UI + thống kê client-side |
| Vận hành/Chi phí | ✅ Gần như $0 — deploy static free |
| **Dữ liệu** | ⚠️ **Thách thức số 1** — không API, nút thắt là tốc độ nhập tay |
| Cộng tác/Cập nhật | ⚠️ Hạn chế FE-only — không real-time, mỗi cập nhật = merge JSON + deploy |
| Quy mô dữ liệu | ✅ Vài nghìn ván ≈ vài MB JSON, gọn trong browser |
| Pháp lý/IP | ⚠️ Cần rà ToS Garena/Tencent trước khi public |
| Độ chính xác | ⚠️ Phụ thuộc meta — reset theo patch, luôn show cỡ mẫu |
