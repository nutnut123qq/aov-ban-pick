# 05 — Thuật toán & xử lý dữ liệu

> Có sẵn `simple-statistics` + `decimal.js` trong dependencies; helper hồi quy an toàn đã có ở [`src/modules/utils/regression.ts`](../../src/modules/utils/regression.ts). Tận dụng, đừng thêm lib nặng — Bayes/Wilson chỉ vài chục dòng JS.

## Vấn đề số 1: cỡ mẫu nhỏ

Mỗi patch vài tuần, mỗi giải vài chục–vài trăm trận; một tướng có thể chỉ pick 3–10 lần/patch. **"Thắng 3/3 = 100% WR" là vô nghĩa** và là rủi ro lớn nhất khiến gợi ý sai.

### Giải pháp V1: WR thô kèm cỡ mẫu

Với dữ liệu từ giải đấu, hiển thị đúng số mà giải đấu cũng tính:

```
WR = thắng / tổng pick
```

- Không làm mượt Bayes để tránh sai lệch so với thông số giải.
- Luôn hiển thị **cỡ mẫu `n`** bên cạnh WR — ngườ dùng tự đánh giá độ tin cậy.
- Với `n` quá nhỏ (vd `n < 5`), UI có thể ghi chú "mẫu ít" thay vì dùng màu sắc ngụ ý.

## Lộ trình thuật toán

### V1 — MVP (thống kê)
- Đếm tần suất pick/ban/win/loss và tính **WR thô** theo lane.
- **Xác suất điều kiện:** P(Win | pick Hero X lane Y khi đối phương đã có Hero Z).
- **Luật kết hợp (Apriori):** "nếu địch có A và B thì mình nên có C" — cẩn thận với support thấp.

### V2–V3 — nâng cao (chỉ khi đã có ≥ vài nghìn trận)
- **Hồi quy Logistic:** dự đoán WR của draft sau mỗi lượt — **giải thích được**, hợp với HLV.
- **Lọc cộng tác / tìm draft tương tự** đã thắng trong quá khứ.
- **Mô hình cây (Random Forest/GBM)** gợi ý pick theo đặc trưng đội hình.

> Với lượng dữ liệu thật của Liên Quân, **logistic regression giải thích được + làm mượt Bayes thường tốt và đáng tin hơn ML phức tạp.** Đừng nhảy lên deep learning sớm; quản lý kỳ vọng độ chính xác.

## Nguyên tắc khi hiện thực

- **Mọi phép tổng hợp lọc theo `patch_id`** trước khi tính (xem [03-data-model](03-data-model.md)).
- Tính trên bảng tra cứu trong RAM đã build sẵn lúc load, không quét lại JSON mỗi lần.
- Dùng `decimal.js` cho phép tính nhạy sai số (tỉ lệ, gold diff…) như các util trong `src/modules/utils/computations/`.
- Không bao giờ trả WR mà không kèm `n` — API tính toán nên trả `{ value, n }`.
