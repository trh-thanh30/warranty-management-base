# F5 - Customer CRM Basic

## Overview

Xây dựng CRM cơ bản để lưu hồ sơ khách hàng, thông tin liên hệ, ghi chú đặc biệt, tag/VIP và lịch sử đặt lịch.

## Business Goal

Giữ dữ liệu khách hàng tập trung, giúp nhân viên phục vụ nhất quán và hỗ trợ chăm sóc khách quay lại.

## User Stories

- Là Lễ tân, tôi muốn tìm khách bằng tên hoặc số điện thoại khi khách gọi.
- Là Manager, tôi muốn xem lịch sử dịch vụ của khách.
- Là Staff, tôi muốn thấy ghi chú đặc biệt như dị ứng hoặc sở thích.

## Functional Requirements

- Tự động tạo customer khi khách đặt lịch lần đầu.
- CRUD customer từ admin.
- Search/filter theo tên, số điện thoại, email, tag.
- Customer notes.
- Customer tags: VIP, regular, new.
- Booking history theo customer.
- Birthday field cho automation sau này.

## API Endpoints

- `GET /customers`
- `POST /customers`
- `GET /customers/:id`
- `PATCH /customers/:id`
- `DELETE /customers/:id`
- `GET /customers/:id/bookings`
- `POST /customers/:id/notes`
- `DELETE /customers/:id/notes/:noteId`

## Database Changes

- `customers`
- `customer_notes`
- `customer_tags`
- `customer_tag_assignments`

## Frontend Screens

- Customer information step trong booking flow.
- Returning customer prefill nếu xác thực nhẹ qua phone/email được bật.

## Admin Screens

- Customer list.
- Customer profile detail.
- Customer create/edit form.
- Customer booking history tab.

## Validation Rules

- Phone hoặc email là bắt buộc.
- Không tạo trùng customer cùng tenant theo phone/email normalized.
- Notes nội bộ không hiển thị cho customer.
- Xóa customer có booking lịch sử chỉ soft delete.

## Acceptance Criteria

- Booking mới tự gắn vào customer đúng.
- Admin tìm customer theo số điện thoại trong vài giây.
- Customer detail hiển thị lịch sử booking và ghi chú.
- Dữ liệu customer không rò sang tenant khác.

## Technical Notes

- Dedup customer nên nằm trong use case tạo booking/customer.
- Tag model giữ đơn giản cho MVP.

## Dependencies

- F1
- F2

## Estimate

28h

## Priority

High
