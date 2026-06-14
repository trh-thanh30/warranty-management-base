# F4 - Service Catalog Management

## Overview

Quản lý danh mục dịch vụ, nhóm dịch vụ, giá, thời lượng, hình ảnh, trạng thái hiển thị, combo/gói dịch vụ cơ bản và thời gian đệm.

## Business Goal

Doanh nghiệp cập nhật dịch vụ một lần và khách thấy ngay trên trang booking, giảm phụ thuộc vào thao tác thủ công.

## User Stories

- Là Manager, tôi muốn tạo dịch vụ với giá và thời lượng rõ ràng.
- Là Chủ cơ sở, tôi muốn ẩn dịch vụ tạm ngừng mà không xóa dữ liệu.
- Là Khách hàng, tôi muốn xem dịch vụ theo danh mục để chọn nhanh.

## Functional Requirements

- CRUD service category.
- CRUD service.
- Upload/link ảnh minh họa dịch vụ.
- Active/inactive service.
- Thiết lập duration, price, buffer time.
- Gán service với staff.
- Combo/package đơn giản gồm nhiều service.

## API Endpoints

- `GET /service-categories`
- `POST /service-categories`
- `PATCH /service-categories/:id`
- `DELETE /service-categories/:id`
- `GET /services`
- `POST /services`
- `GET /services/:id`
- `PATCH /services/:id`
- `DELETE /services/:id`
- `POST /service-packages`
- `PATCH /service-packages/:id`

## Database Changes

- `service_categories`
- `services`
- `service_packages`
- `service_package_items`
- `service_media`

## Frontend Screens

- Service list trên booking page.
- Service detail/selection state.
- Category filter.

## Admin Screens

- Service category manager.
- Service list.
- Service create/edit form.
- Package/combo create/edit form.

## Validation Rules

- Service name là bắt buộc.
- Duration phải lớn hơn 0.
- Price không âm.
- Buffer time không âm.
- Không xóa hard service đã có booking lịch sử.

## Acceptance Criteria

- Service active xuất hiện trên booking page.
- Service inactive không xuất hiện cho khách nhưng vẫn lưu trong admin.
- Tổng duration/price của combo được tính đúng.
- Staff assignment ảnh hưởng đến danh sách nhân viên có thể chọn.

## Technical Notes

- Public query chỉ trả service active.
- Giá theo nhân viên là extension có thể bổ sung sau nếu MVP cần.

## Dependencies

- F2
- F3

## Estimate

32h

## Priority

Critical
