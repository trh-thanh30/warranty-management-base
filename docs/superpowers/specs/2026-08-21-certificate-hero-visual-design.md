# Certificate Hero Visual Design

## Goal

Thay hero nền đen của chứng nhận bảo hành bằng bố cục sáng, cao cấp và gần với mẫu Film hiện có, nhưng vẫn giữ nội dung động bằng HTML/CSS.

## Approved Design

- Dùng một ảnh sedan màu đỏ, góc nhìn 3/4 phía trước, nền trong suốt, không logo, không chữ và không watermark.
- Đặt xe ở nửa phải hero; nửa trái dành cho logo và tiêu đề chứng nhận.
- Logo, warranty number, tiêu đề và các dải đỏ được dựng bằng HTML/CSS, không đóng cứng trong ảnh.
- Asset được nhúng thành data URI để Puppeteer render offline và PDF không phụ thuộc URL ngoài.
- Layout hiện tại bên dưới hero và business data không thay đổi.
- Đây là visual mặc định dùng chung. Việc cấu hình ảnh riêng theo category nằm ngoài scope.

## Acceptance Criteria

- Hero nền sáng, có ảnh xe rõ nét và không che nội dung.
- HTML certificate chứa ảnh xe dạng `data:image/...;base64`.
- Không xuất hiện request HTTP bên ngoài.
- Test template, typecheck, lint và build API đều qua.
- Không commit nếu chưa có yêu cầu trực tiếp từ người dùng.
