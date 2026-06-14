# F7 - White-label Customer Booking Page

## Overview

Xây dựng trang đặt lịch public mang thương hiệu riêng cho từng doanh nghiệp: xem dịch vụ, chọn nhân viên, chọn slot, nhập thông tin và xác nhận.

## Business Goal

Cho khách tự đặt lịch online 24/7, giảm tải lễ tân và tăng tỷ lệ hoàn tất booking.

## User Stories

- Là Khách hàng, tôi muốn đặt lịch nhanh trên điện thoại mà không cần đăng ký tài khoản.
- Là Khách hàng, tôi muốn chọn dịch vụ, nhân viên và giờ phù hợp.
- Là Chủ cơ sở, tôi muốn trang booking hiển thị logo, màu sắc và thông tin của mình.

## Functional Requirements

- Resolve tenant theo domain/subdomain.
- Public landing/booking flow theo tenant.
- Danh sách service/category active.
- Chọn một hoặc nhiều service.
- Chọn staff cụ thể hoặc any staff.
- Chọn ngày/giờ từ availability engine.
- Nhập thông tin khách: name, phone, email, note.
- Review và confirm booking.
- Success page có mã lịch hẹn.

## API Endpoints

- `GET /public/:tenantSlug/profile`
- `GET /public/:tenantSlug/services`
- `GET /public/:tenantSlug/staff`
- `GET /public/:tenantSlug/availability`
- `POST /public/:tenantSlug/bookings`
- `GET /public/:tenantSlug/bookings/:code`

## Database Changes

- `booking_public_sessions`
- `booking_codes`
- Reuse `appointments`, `customers`, `services`, `staff_profiles`

## Frontend Screens

- Tenant booking home.
- Service selection.
- Staff selection.
- Date/time selection.
- Customer information form.
- Booking review.
- Booking success/confirmation.

## Admin Screens

- Booking page preview entry point.

## Validation Rules

- Không yêu cầu customer account.
- Phone là bắt buộc; email optional hoặc bắt buộc theo tenant setting.
- Chỉ cho đặt service/staff active.
- Slot phải được validate lại tại thời điểm confirm.
- Ghi chú customer giới hạn độ dài.

## Acceptance Criteria

- Khách đặt lịch thành công từ domain của tenant.
- Booking xuất hiện ngay trên admin calendar.
- Khách nhận mã lịch hẹn và trạng thái confirmed/pending theo cấu hình.
- Flow hoạt động tốt trên mobile.

## Technical Notes

- `apps/web` là customer-facing app.
- `app/**/page.tsx` chỉ import view từ `src/views`.
- Public API vẫn phải enforce tenant context.

## Dependencies

- F2
- F4
- F5
- F6

## Estimate

40h

## Priority

Critical
