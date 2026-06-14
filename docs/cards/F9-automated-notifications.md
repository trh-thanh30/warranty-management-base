# F9 - Automated Notifications

## Overview

Gửi email/SMS tự động cho xác nhận đặt lịch, nhắc lịch, thay đổi/hủy lịch, thông báo cho nhân viên và follow-up sau dịch vụ.

## Business Goal

Giảm no-show, tăng sự chuyên nghiệp và giảm thao tác gọi/nhắn thủ công của lễ tân.

## User Stories

- Là Khách hàng, tôi muốn nhận xác nhận ngay sau khi đặt lịch.
- Là Khách hàng, tôi muốn được nhắc trước giờ hẹn.
- Là Staff, tôi muốn được báo khi có lịch mới được phân công.
- Là Chủ cơ sở, tôi muốn tùy chỉnh nội dung theo thương hiệu.

## Functional Requirements

- Notification template theo tenant.
- Email confirmation khi booking created.
- Email/SMS reminder trước 24h và 1h theo cấu hình.
- Notification khi appointment cancelled/rescheduled.
- Staff notification khi được phân công.
- Follow-up sau completed appointment.
- Delivery log và retry basic.

## API Endpoints

- `GET /notification-templates`
- `PATCH /notification-templates/:id`
- `GET /notification-settings`
- `PATCH /notification-settings`
- `GET /notification-logs`
- `POST /notification-logs/:id/resend`

## Database Changes

- `notification_templates`
- `notification_settings`
- `notification_logs`
- `scheduled_notifications`

## Frontend Screens

- Customer-facing confirmation content via email/SMS links.

## Admin Screens

- Notification settings.
- Template editor.
- Delivery log.

## Validation Rules

- Template không được trống với event enabled.
- SMS phải giới hạn độ dài theo provider.
- Không gửi reminder cho cancelled/no-show/completed appointment.
- Retry có giới hạn để tránh spam.

## Acceptance Criteria

- Booking mới tạo notification confirmation.
- Reminder được schedule đúng thời điểm.
- Reschedule/cancel gửi thông báo phù hợp.
- Admin xem được trạng thái gửi và lỗi provider.

## Technical Notes

- Tách provider abstraction để thay Email/SMS vendor.
- Queue worker xử lý schedule/retry.

## Dependencies

- F0
- F8

## Estimate

32h

## Priority

High
