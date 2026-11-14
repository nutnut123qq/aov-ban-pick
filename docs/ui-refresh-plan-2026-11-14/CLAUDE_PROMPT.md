# Prompt giao Claude triển khai

Copy phần dưới vào Claude Code, mở workspace `D:/code/lienquan/aov-draftmind-frontend`.

```text
Triển khai đợt cải thiện UI AOV DraftMind theo plan:
D:/code/lienquan/aov-draftmind-frontend/docs/ui-refresh-plan-2026-11-14/PLAN.md

Đọc AGENTS.md và CLAUDE.md của repo trước. Repo thực tế là thư mục trên, không phải D:/code/lienquan. Khảo sát dùng main@f0cfff8c95d9aec71c31e3973cae16a234a2fd32, source khi đó sạch. Kiểm status/HEAD/process thật trước khi nhận việc; giữ mọi thay đổi của người khác.

User đã chốt ưu tiên draft và Meta, giữ nhận diện hiện tại. Làm draft trên mobile, filter/sort parity và khả năng tìm phân tích trên Meta; shared navbar chỉ chỉnh accessibility/controls liên quan. Không redesign Home/dashboard, thay branding hay sắp xếp lại điều hướng toàn site. Giữ nhận diện công cụ phân tích hiện tại, dark/light, vi/en, dữ liệu thật và toàn bộ chức năng. Đây là visual/interaction pass có phạm vi, không phải viết lại app, thêm backend, đổi thuật toán hay sửa pipeline data.

Dùng agentic-design-system làm vòng chính. Áp dụng ux-baseline-check và ui-polish-pass trong cùng lượt thực hiện; design-review + e2e-verify để nghiệm thu phần thay đổi. Ponytail giữ diff nhỏ nhưng đủ. Modern-web-guidance được tự chọn khi có câu hỏi browser/API/a11y/compatibility cụ thể mà repo chưa giải đáp, không gọi mặc định cho mọi bước. Không cần chạy cycle/orchestrate hoặc tạo nhiều agent cho việc này. Hãy nói rõ skill thực sự dùng.

Xem ảnh và baseline.json trong thư mục evidence của plan trước khi code; nếu snapshot đổi thì chụp lại phần liên quan. Làm theo thứ tự và sáu tiêu chí xong trong PLAN.md; giữ filter/sort trên toàn bộ dữ liệu trước khi paging và không làm thay đổi nghĩa của bộ lọc ở các view phân tích. Không tự thêm hướng thiết kế, dependency, animation hay hạng mục ngoài scope.

Validate:data đã fail trước khi làm UI vì series BO3 có ván 4, chi tiết trong plan/DONE.md. Không sửa public/data, importer/merge hay đóng v1.2 trong lượt này. Báo riêng baseline fail đó; gate không chạy được phải ghi UNVERIFIED, không coi là PASS.

Hoàn thành local implementation và kiểm chứng bằng lint, test, typecheck, build cùng browser flow thực tế. Lưu before/after, kết quả và phần dở ngay trong nguồn trạng thái của task này; chụp cùng viewport, kiểm light/dark và vi/en. Không tuyên bố đạt visual chỉ vì build xanh. Dừng khi scope/DoD đạt; phát sinh ngoài scope chỉ ghi một danh sách ngắn.

KHÔNG commit/push/deploy, không archive, không mở/đóng version hoặc tự sửa các skill/global instructions. Không đụng credentials hay phục hồi task data đang dở. Nếu cần mở phạm vi để gỡ blocker thật, nêu bằng chứng và lý do.
```
