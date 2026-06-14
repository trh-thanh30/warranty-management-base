# F6 - Availability Engine & Slot Calculation

## Overview

Tính toán khung giờ trống theo giờ mở cửa, ngày nghỉ, lịch nhân viên, dịch vụ, buffer time và appointment đã tồn tại.

## Business Goal

Ngăn double-booking và giúp khách chỉ chọn các slot thực sự có thể phục vụ.

## User Stories

- Là Khách hàng, tôi chỉ muốn thấy giờ còn trống.
- Là Manager, tôi muốn hệ thống tự chặn trùng lịch nhân viên.
- Là Business Admin, tôi muốn slot tự cập nhật khi đổi giờ mở cửa hoặc lịch nhân viên.

## Functional Requirements

- Tính available slots theo tenant, service, staff optional, date range.
- Hỗ trợ chọn "bất kỳ nhân viên nào".
- Tính tổng duration khi chọn nhiều dịch vụ/combo.
- Áp dụng buffer time.
- Loại trừ ngày đóng cửa business và ngày off staff.
- Loại trừ appointment confirmed/in-progress.
- API giữ slot ngắn hạn khi khách đang checkout nếu cần.

## API Endpoints

- `GET /availability/slots`
- `POST /availability/validate`
- `POST /availability/holds`
- `DELETE /availability/holds/:id`

## Database Changes

- `availability_holds`
- Indexes trên `appointments(tenant_id, staff_id, starts_at, ends_at, status)`

## Frontend Screens

- Date picker.
- Time slot picker.
- Staff auto-assign option.
- Unavailable/closed state.

## Admin Screens

- Slot preview/debug panel trong settings hoặc calendar.

## Validation Rules

- Date range query có giới hạn tối đa.
- Slot phải nằm trong giờ mở cửa và staff working hours.
- Không cho hold slot đã bị appointment chiếm.
- Timezone tenant phải được áp dụng nhất quán.

## Acceptance Criteria

- Slot không xuất hiện khi business đóng cửa.
- Slot không xuất hiện khi staff nghỉ hoặc đã có booking.
- Chọn nhiều service tính đúng duration.
- API validate chặn booking nếu slot vừa bị người khác lấy.

## Technical Notes

- Đây là domain service cốt lõi, cần unit test mạnh.
- Nên tách `AvailabilityCalculator` thuần để test bằng mocked repositories.

## Dependencies

- F2
- F3
- F4

## Estimate

36h

## Priority

Critical
