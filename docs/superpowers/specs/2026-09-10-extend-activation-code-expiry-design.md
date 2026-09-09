# Thiết kế gia hạn mã kích hoạt

## Mục tiêu

Bổ sung quick action gia hạn thời gian sử dụng mã kích hoạt theo số tháng do quản trị viên nhập, có preview ngày hết hạn mới trước khi xác nhận.

## Vị trí hiển thị

1. Dropdown thao tác của từng lô tại trang danh sách **Lô mã kích hoạt**.
2. Dropdown thao tác của từng mã trong table **Danh sách mã kích hoạt** tại trang chi tiết lô.
3. Dropdown thao tác của từng mã trong table **Danh sách mã kích hoạt** tại trang **Sản phẩm → Gán mã kích hoạt**.

Hai table mã đang dùng chung `ActivationCodeDetailView`, vì vậy sử dụng chung một action và một dialog.

## Quy tắc nghiệp vụ

- Số tháng gia hạn là số nguyên từ 1 đến 120.
- Gia hạn theo tháng lịch, giữ nguyên giờ, phút và giây của ngày hết hạn hiện tại.
- Hạn mới của một mã bằng `expiresAt hiện tại + số tháng`.
- Khi ngày tương ứng không tồn tại ở tháng đích, dùng ngày cuối cùng của tháng đích. Ví dụ: 31/01 + 1 tháng = 28/02 hoặc 29/02.
- Không gia hạn mã có `expiresAt <= now`.
- Không gia hạn mã có trạng thái `ACTIVATED` hoặc `REVOKED`.
- Các trạng thái khác được gia hạn nếu mã chưa hết hạn, gồm `AVAILABLE`, `PENDING_APPROVAL` và `REPLACED`.
- Backend phải kiểm tra lại điều kiện tại thời điểm ghi dữ liệu để tránh dữ liệu thay đổi sau khi modal được mở.

## Trải nghiệm gia hạn từng mã

Quick action **Gia hạn mã** mở dialog gồm:

- Mã kích hoạt.
- Ngày hết hạn hiện tại.
- Input số **Số tháng gia hạn**.
- Ngày hết hạn sau gia hạn, cập nhật trực tiếp khi input hợp lệ.
- Nút **Hủy** và **Xác nhận gia hạn**.

Input rỗng, không phải số nguyên, nhỏ hơn 1 hoặc lớn hơn 120 sẽ hiển thị lỗi và vô hiệu hóa nút xác nhận. Preview không ghi dữ liệu; chỉ nút xác nhận mới gọi API.

Với mã không đủ điều kiện, quick action không hiển thị. API vẫn trả lỗi nghiệp vụ nếu request được gọi trực tiếp hoặc trạng thái thay đổi trong lúc dialog đang mở.

## Trải nghiệm gia hạn cả lô

Quick action **Gia hạn lô mã** mở dialog dùng cùng cách nhập và preview:

- Ngày hết hạn hiện tại của lô.
- Số tháng gia hạn.
- Ngày hết hạn mới của lô.
- Ghi chú rằng mã đã kích hoạt, đã thu hồi hoặc đã hết hạn sẽ bị bỏ qua.

Khi xác nhận:

- Cộng số tháng vào `expiresAt` của lô.
- Cộng cùng số tháng vào `expiresAt` hiện tại của từng mã đủ điều kiện trong lô.
- Bỏ qua từng mã không đủ điều kiện thay vì hủy toàn bộ thao tác.
- Thực hiện trong một transaction để ngày hết hạn của lô và các mã đủ điều kiện được cập nhật nhất quán.

Thông báo kết quả phải có tổng số thành công và chi tiết số bị bỏ qua theo lý do. Ví dụ:

> Đã gia hạn 75 mã. Bỏ qua 25 mã: 10 mã đã kích hoạt, 10 mã đã thu hồi, 5 mã đã hết hạn.

Các nhóm có số lượng bằng 0 không xuất hiện trong thông báo.

Mỗi mã chỉ được tính vào một nhóm bỏ qua. Thứ tự phân loại là `ACTIVATED`, sau đó `REVOKED`, sau đó mới kiểm tra đã hết hạn; nhờ vậy tổng các nhóm luôn bằng tổng số mã bị bỏ qua.

Nếu lô đã hết hạn thì không cho gia hạn lô. Nếu lô còn hạn nhưng không có mã đủ điều kiện, không cập nhật ngày hết hạn của lô và trả kết quả đã gia hạn 0 mã cùng thống kê mã bị bỏ qua.

## API và dữ liệu

Thêm hai command endpoint trong module activation codes:

- Gia hạn một mã: nhận `activationCodeId` và `{ months }`.
- Gia hạn một lô: nhận `batchId` và `{ months }`.

Contract dùng chung trong `packages/shared`:

```ts
type ExtendActivationCodeExpiryBody = {
  months: number;
};

type ExtendActivationCodeExpiryResult = {
  activationCodeId: string;
  previousExpiresAt: string;
  expiresAt: string;
};

type ExtendActivationCodeBatchExpiryResult = {
  batchId: string;
  previousExpiresAt: string;
  expiresAt: string;
  extendedCount: number;
  skipped: {
    activated: number;
    revoked: number;
    expired: number;
  };
};
```

Controller chỉ nhận DTO và gọi use case. Use case kiểm tra rule nghiệp vụ; repository thực hiện query và transaction.

## Phân quyền

Thêm permission riêng `ACTIVATION_CODE_BATCH_EXTEND` cho cả gia hạn lô và gia hạn mã. Permission này được gán cho các role quản trị đang có quyền vận hành/thu hồi mã kích hoạt. UI chỉ hiển thị quick action khi người dùng có permission này; API bảo vệ cả hai endpoint bằng cùng permission.

## Đồng bộ giao diện

Sau khi thành công:

- Đóng dialog.
- Invalidate query danh sách lô và query danh sách mã tương ứng.
- Table hiển thị ngày hết hạn mới mà không cần tải lại trang.
- Mọi label, validation và lỗi API có bản dịch `vi` và `en`.

## Xử lý lỗi

- Không tìm thấy mã hoặc lô: trả `NOT_FOUND`.
- Số tháng không hợp lệ: trả `BAD_REQUEST` với mã lỗi riêng.
- Mã/lô đã hết hạn hoặc mã thuộc trạng thái bị chặn: trả lỗi nghiệp vụ riêng, không cập nhật dữ liệu.
- Xung đột do dữ liệu thay đổi đồng thời: update có điều kiện thất bại và trả conflict; UI tải lại dữ liệu hiện tại.

## Kiểm thử

- DTO: chấp nhận số nguyên 1–120; từ chối rỗng, số thập phân, 0, số âm và lớn hơn 120.
- Hàm cộng tháng: giữ thời gian và xử lý cuối tháng.
- Use case một mã: success và từng trường hợp bị chặn.
- Use case cả lô: cập nhật mã đủ điều kiện, thống kê đúng từng nhóm bỏ qua và transaction nhất quán.
- Permission: endpoint và quick action chỉ khả dụng khi có quyền.
- UI: preview thay đổi theo input, nút xác nhận bị khóa khi input sai, thông báo hàng loạt đúng các nhóm có số lượng lớn hơn 0.
- Regression: action xuất hiện tại cả ba vị trí đã xác định.
