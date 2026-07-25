# Sidebar Notification Badges

## Mục tiêu

Hiển thị số notification chưa đọc trực tiếp trên hai mục điều hướng `Bảo hành`
và `Yêu cầu bảo hành` trong sidebar quản trị. Các số này phải dùng cùng nguồn
dữ liệu với chuông thông báo để luôn nhất quán.

## Phạm vi

- `Yêu cầu bảo hành` chỉ đếm notification chưa đọc thuộc loại:
  - `WARRANTY_CLAIM_CREATED`
- `Bảo hành` đếm notification chưa đọc thuộc loại:
  - `WARRANTY_ACTIVATION_REQUEST_CREATED`
- Không thay đổi trạng thái đã đọc khi người dùng chỉ mở trang từ sidebar.
- Không thêm badge cho các mục điều hướng khác.

## API và contract

Mở rộng endpoint `GET /notifications/unread-count` để trả về:

```ts
type UnreadNotificationCount = {
  unread: number;
  warrantyClaims: number;
  warranties: number;
};
```

`unread` tiếp tục là tổng số notification chưa đọc và được chuông thông báo sử
dụng. Hai trường còn lại là số chưa đọc đã nhóm theo nghiệp vụ.

Repository thực hiện một truy vấn nhóm theo `notification.type` đối với các
recipient của người dùng hiện tại có trạng thái `UNREAD` và notification đã
được gửi. Service ánh xạ kết quả nhóm về contract ổn định, bao gồm giá trị `0`
khi không có bản ghi.

## Luồng dữ liệu frontend

Hook `useUnreadNotificationCount` vẫn là nguồn dữ liệu duy nhất và tiếp tục
poll mỗi 30 giây. `NotificationBell` dùng trường `unread`; `AppSidebar` dùng
`warrantyClaims` và `warranties`.

Các mutation đọc một notification hoặc đọc tất cả đã invalidate
`notificationKeys.all`, vì vậy chuông và sidebar được cập nhật cùng lúc mà
không cần thêm cơ chế đồng bộ riêng.

Query chỉ được bật khi đã có người dùng đăng nhập. Lỗi tải dữ liệu không chặn
sidebar; badge được ẩn cho tới lần tải thành công tiếp theo.

## Giao diện

- Sidebar mở: badge nằm ở cuối hàng, sau tên mục.
- Sidebar thu gọn: badge nằm ở góc trên bên phải của icon điều hướng.
- Không hiển thị badge khi số bằng `0`.
- Hiển thị `99+` khi số lớn hơn `99`.
- Badge sử dụng màu cảnh báo hiện có, có kích thước cố định để không làm dịch
  chuyển hàng điều hướng khi dữ liệu cập nhật.
- Link có nhãn hỗ trợ đọc màn hình bao gồm số notification chưa đọc khi số lớn
  hơn `0`.

## Kiểm thử

- Repository: chỉ đếm recipient chưa đọc, notification đã gửi và nhóm đúng theo
  type.
- Service/helper ánh xạ: chỉ ánh xạ notification tạo yêu cầu mới vào badge
  tương ứng; các loại cập nhật trạng thái chỉ ảnh hưởng tổng.
- Frontend helper: ẩn số `0`, giới hạn `99+`.
- Sidebar: hiển thị đúng badge ở trạng thái mở và thu gọn; không hiển thị khi
  query lỗi hoặc số bằng `0`.
- Regression: chuông vẫn hiển thị tổng `unread` và mutation đọc notification
  vẫn làm mới toàn bộ số đếm.

## Ngoài phạm vi

- Đếm số hồ sơ đang chờ xử lý theo trạng thái nghiệp vụ.
- Đánh dấu notification đã đọc khi chỉ truy cập trang `Bảo hành` hoặc
  `Yêu cầu bảo hành`.
- Realtime push qua WebSocket hoặc SSE.
