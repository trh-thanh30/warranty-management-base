# Assign Owner Warranty Code Design

## Goal

Tách quản lý hàng tồn kho khỏi cấp bảo hành: Product được tạo với `productCode` nhưng chưa có `warrantyCode`; mã bảo hành chỉ được cấp lần đầu khi Admin gán chủ sở hữu.

## Domain flow

1. `CreateProduct` tạo Product `ACTIVE` hoặc `INACTIVE`, tự sinh `productCode`, tạo Warranty `DRAFT` với thời hạn mặc định 36 tháng nhưng chưa có mã.
2. Product chưa có owner có `warrantyCode = null` và không thể tạo activation request bằng mã.
3. `AssignProductOwner` nhận Customer, ngày mua và lựa chọn cấp mã:
   - `autoGenerateWarrantyCode = true`: backend sinh mã unique.
   - `autoGenerateWarrantyCode = false`: `warrantyCode` bắt buộc, được trim/uppercase và kiểm tra định dạng/unique.
4. Mã được ghi đồng thời vào Product và Warranty trong cùng transaction với ownership.
5. Khi Product đã có mã, chuyển chủ không sinh hoặc thay mã; warranty code thuộc Product/Warranty, không thuộc Customer.
6. Warranty vẫn `DRAFT` sau khi assign owner. Flow Warranty Activation Request hiện tại tiếp tục dùng mã để gửi yêu cầu và chỉ chuyển `ACTIVE` khi Admin duyệt.

## Interfaces

- `ProductResponse.warrantyCode`: `string | null`.
- `ProductWarrantySummary.warrantyCode`: `string | null`.
- `CreateProductBody`: bỏ owner và warranty activation fields.
- `AssignProductOwnerBody`: thêm `autoGenerateWarrantyCode?: boolean` và `warrantyCode?: string`; giữ `purchaseDate`; bỏ `activatedAt` khỏi UI và contract mới.
- Database cho phép `product.warranty_code` và `warranty.warranty_code` nullable nhưng vẫn unique khi có giá trị.

## Admin UI

- Product Create chỉ chứa thông tin Product, ảnh, thông số kỹ thuật và trạng thái.
- Assign Owner dialog hiển thị toggle tự sinh mã nếu Product chưa có mã.
- Khi tắt toggle, hiển thị input mã thủ công.
- Khi Product đã có mã, dialog hiển thị mã read-only và không cho thay đổi.
- Product list/detail hiển thị `-` hoặc trạng thái chưa cấp mã khi code null.

## Validation and errors

- Mã thủ công gồm 6-64 ký tự `A-Z`, `0-9`, `-`.
- Backend luôn uppercase trước khi lưu.
- Mã trùng trả conflict `Warranty code already exists`.
- Assign owner thất bại không được ghi code hoặc ownership một phần.

## Testing

- Create Product tạo Product và Warranty DRAFT với code null.
- Assign owner tự sinh code và ghi đồng bộ hai bảng.
- Assign owner nhận mã thủ công, uppercase và kiểm tra trùng.
- Chuyển owner giữ nguyên code hiện có.
- Admin serializer/form không còn gửi warranty activation fields khi tạo Product.
