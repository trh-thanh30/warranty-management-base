# F8 - Appointment Calendar & Booking Management

## Overview

Quản lý lịch hẹn trong Business Admin Portal: xem calendar, tạo lịch thủ công, chỉnh sửa, reschedule, hủy, check-in, hoàn thành và đánh dấu no-show.

## Business Goal

Lễ tân, quản lý và chủ cơ sở có màn hình trung tâm để vận hành ngày làm việc, theo dõi tiến độ và xử lý phát sinh.

## User Stories

- Là Lễ tân, tôi muốn tạo lịch thủ công cho khách walk-in hoặc gọi điện.
- Là Manager, tôi muốn kéo đổi lịch sang giờ hoặc nhân viên khác.
- Là Staff, tôi muốn cập nhật trạng thái lịch mình phục vụ.

## Functional Requirements

- Calendar day/week/month hoặc day/week MVP.
- Filter theo staff, service, status, date.
- Create appointment từ admin.
- Edit appointment: customer, service, staff, time, note.
- Reschedule appointment.
- Cancel appointment với reason.
- Status flow: pending/confirmed/check-in/in-progress/completed/cancelled/no-show.
- Waitlist basic khi hết slot.

## API Endpoints

- `GET /appointments`
- `POST /appointments`
- `GET /appointments/:id`
- `PATCH /appointments/:id`
- `POST /appointments/:id/reschedule`
- `POST /appointments/:id/cancel`
- `POST /appointments/:id/check-in`
- `POST /appointments/:id/complete`
- `POST /appointments/:id/no-show`
- `GET /waitlist`
- `POST /waitlist`

## Database Changes

- `appointments`
- `appointment_services`
- `appointment_status_history`
- `appointment_notes`
- `waitlist_entries`

## Frontend Screens

- Customer confirmation detail.
- Optional cancellation link page.

## Admin Screens

- Appointment calendar.
- Appointment detail drawer.
- Create/edit appointment modal.
- Reschedule interaction.
- Waitlist panel.

## Validation Rules

- Appointment time phải pass availability validation.
- Không reschedule completed appointment.
- Cancel reason bắt buộc khi hủy từ admin.
- Staff chỉ update appointment được phân công nếu quyền giới hạn.
- Completed appointment ghi nhận doanh thu ước tính.

## Acceptance Criteria

- Admin xem toàn bộ lịch theo ngày/tuần.
- Tạo thủ công và reschedule không gây double-booking.
- Status history được lưu đầy đủ.
- Completed booking xuất hiện trong report.

## Technical Notes

- Use case appointment phải gọi F6 trước khi tạo/reschedule.
- Status transition nên được gom trong domain service.

## Dependencies

- F5
- F6
- F7

## Estimate

40h

## Priority

Critical
