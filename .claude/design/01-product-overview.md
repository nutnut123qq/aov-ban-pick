# 01 — Tổng quan sản phẩm

## Là gì

**AOV DraftMind** — trợ lý cấm/chọn (ban/pick) cho Liên Quân Mobile. Định vị một câu:

> "Bảng cấm/chọn trong game, nhưng có thêm số liệu và gợi ý ở mỗi lượt."

**Đối tượng:** HLV/phân tích viên đội tuyển, caster, người chơi Cao Thủ/Chiến Tướng, fan phân tích chiến thuật.

**Mục tiêu:** cung cấp thống kê và gợi ý cấm/chọn theo thời gian thực dựa trên dữ liệu giải chuyên nghiệp và rank cao.

## Kiến trúc đã chốt: FE-only

Phần draft/thống kê **không có backend riêng, không database server, không auth bắt buộc cho việc xem dữ liệu**:

- Dữ liệu trận đấu = **file JSON tĩnh** trong `public/data/` (xem [03-data-model.md](03-data-model.md)).
- Load JSON → build bảng tra cứu trong RAM browser → tính WR/PR/BR + làm mượt Bayes **ngay trên client**.
- Nhập liệu ở một trang FE riêng → **export JSON** → merge thủ công (có script local `scripts/merge.js` hỗ trợ) → commit + deploy lại.
- Deploy static free (GitHub Pages / Vercel / Netlify), không chi phí vận hành server.

> **Lưu ý về repo hiện tại:** codebase *có sẵn* hạ tầng Keycloak/GraphQL/REST từ sản phẩm gốc (xem [`../pattern/04-state-data-api.md`](../pattern/04-state-data-api.md)). Phần **lõi draft** theo proposal là FE-only/JSON tĩnh; hạ tầng API kia chỉ dùng nếu/khi cần (vd auth để gate UI, đồng bộ user). Đừng vô tình biến tính năng draft thành phụ thuộc backend.

**Đánh đổi của FE-only:** không cộng tác real-time, không nhập đồng thời nhiều người; mỗi lần cập nhật dữ liệu là một lần build/deploy lại. Chấp nhận được khi một người làm chủ dữ liệu.

## Nguyên tắc thiết kế

1. **Chính xác về luật trước, đẹp sau** — sai thể thức là mất uy tín ngay.
2. **Trung thực về độ tin cậy số liệu** — WR trên cỡ mẫu nhỏ phải kèm n + khoảng tin cậy ([05-statistics.md](05-statistics.md)).
3. **Gợi ý phải giải thích được** — HLV không tin hộp đen; mỗi gợi ý kèm lý do + số liệu.
4. **FE-only, zero backend** cho phần dữ liệu draft.

## Rủi ro & ràng buộc cần nhớ

- **Dữ liệu là thách thức số 1.** Không có public API chính thức từ Garena. Lối đi V1: nhập tay có cấu trúc từ VOD → nút thắt thật sự là **UX nhập liệu**, không phải thuật toán.
- **Pháp lý/IP:** tên + hình tướng & nội dung giải thuộc Garena/Tencent — nên rà ToS trước khi public. Ưu tiên lưu *dữ kiện trận đấu* (ai pick gì) hơn là sao chép hình ảnh/nội dung.
- **Meta thay đổi theo patch** — reset/định lại thống kê khi có patch hoặc rework lớn.
