# Ngày thi công trong yêu cầu kích hoạt bảo hành

## Mục tiêu

Cho phép nhân viên nhập ngày và giờ thi công khi tạo hoặc chỉnh sửa yêu cầu kích hoạt bảo hành, đồng thời lưu và hiển thị lại dữ liệu đó.

## Phạm vi

- Tái sử dụng field domain hiện có: `installedAt` ở shared/API và `installed_at` trong database.
- Thêm input `datetime-local` vào form admin tạo/sửa yêu cầu.
- Cho phép bỏ trống để tương thích dữ liệu cũ và flow public hiện tại.
- Khi có giá trị, gửi timestamp ISO hợp lệ lên API.
- Hydrate giá trị khi mở trang chỉnh sửa.
- Hiển thị ngày thi công ở trang chi tiết admin.
- Cập nhật bản dịch và test mapping/hydration/hiển thị.

## Ngoài phạm vi

- Không tạo migration database.
- Không đổi logic ngày bắt đầu/ngày hết hạn của warranty.
- Không bắt buộc ngày thi công cho public form trong task này.

## Luồng dữ liệu

`datetime-local` của form admin → giá trị local `YYYY-MM-DDTHH:mm` → `toAdminActivationRequestBody` chuyển thành ISO string → DTO/API đã có `installedAt` → repository lưu vào `installed_at` → mapper trả `installedAt` → detail/edit hiển thị lại.

## Quy tắc hiển thị

- Nhãn: “Ngày thi công”.
- Có cả ngày và giờ/phút.
- Giá trị rỗng hiển thị dấu `-` ở trang chi tiết.
- Dùng formatter ngày hiện có với `showTime: true` để thống nhất timezone/locale của ứng dụng.
