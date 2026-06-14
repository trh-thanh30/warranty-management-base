# F11 - Dashboard & Basic Reports

## Overview

Cung cấp dashboard và báo cáo cơ bản: tổng lịch hẹn, doanh thu ước tính, tỷ lệ hoàn thành/hủy/no-show, top dịch vụ, top nhân viên, xuất Excel.

## Business Goal

Chủ cơ sở nắm hiệu quả vận hành và doanh thu từ xa, không cần cộng sổ thủ công cuối ngày.

## User Stories

- Là Chủ Spa, tôi muốn xem doanh thu theo ngày/tuần/tháng.
- Là Manager, tôi muốn biết tỷ lệ hủy và no-show.
- Là Chủ cơ sở, tôi muốn biết dịch vụ và nhân viên nổi bật.

## Functional Requirements

- Dashboard KPI cards.
- Date range filter.
- Appointment status summary.
- Estimated revenue by period.
- Top booked services.
- Top staff by completed bookings/revenue.
- New vs returning customer count.
- Export Excel.

## API Endpoints

- `GET /reports/summary`
- `GET /reports/revenue`
- `GET /reports/appointments`
- `GET /reports/top-services`
- `GET /reports/top-staff`
- `GET /reports/customers`
- `GET /reports/export`

## Database Changes

- Optional `report_snapshots`
- Indexes cho appointments, appointment_services, customers.

## Frontend Screens

- None

## Admin Screens

- Dashboard home.
- Reports page.
- Export action.

## Validation Rules

- Date range bắt buộc và có max range.
- Revenue chỉ tính completed appointments.
- Tenant isolation bắt buộc trong mọi aggregate.
- Export chỉ cho Business Admin/Manager.

## Acceptance Criteria

- Dashboard hiển thị số liệu đúng theo tenant.
- Completed/cancelled/no-show count khớp calendar.
- Export Excel tải được với filter hiện tại.
- Staff không xem được report nếu không có quyền.

## Technical Notes

- MVP dùng query aggregate trực tiếp; snapshot có thể thêm khi dữ liệu lớn.
- Report DTO dùng chung cho admin UI.

## Dependencies

- F8

## Estimate

32h

## Priority

High
