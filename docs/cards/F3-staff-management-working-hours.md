# F3 - Staff Management & Working Hours

## Overview

Quản lý nhân viên, chuyên môn, vai trò, lịch làm việc, ngày nghỉ và dịch vụ có thể thực hiện.

## Business Goal

Giúp chủ cơ sở phân công đúng người, tránh trùng lịch và cho nhân viên chủ động xem lịch cá nhân.

## User Stories

- Là Business Admin, tôi muốn thêm nhân viên với ảnh, chuyên môn và thông tin liên hệ.
- Là Manager, tôi muốn thiết lập ca làm việc của từng nhân viên.
- Là Staff, tôi muốn xem lịch được phân công theo ngày/tuần.

## Functional Requirements

- CRUD staff profile.
- Gán user account cho staff.
- Gán role nội bộ: Manager, Receptionist, Staff.
- Cấu hình working hours theo tuần.
- Cấu hình staff day off.
- Gán dịch vụ staff có thể thực hiện.
- Staff calendar read model.

## API Endpoints

- `GET /staff`
- `POST /staff`
- `GET /staff/:id`
- `PATCH /staff/:id`
- `DELETE /staff/:id`
- `PUT /staff/:id/working-hours`
- `POST /staff/:id/days-off`
- `DELETE /staff/:id/days-off/:dayOffId`
- `PUT /staff/:id/services`

## Database Changes

- `staff_profiles`
- `staff_working_hours`
- `staff_days_off`
- `staff_service_assignments`

## Frontend Screens

- Staff selection trong customer booking flow.
- Staff profile snippet public.

## Admin Screens

- Staff list.
- Staff create/edit form.
- Staff schedule editor.
- Staff service assignment form.
- My schedule view cho Staff.

## Validation Rules

- Staff phải thuộc tenant hiện tại.
- Working hours không được overlap trong cùng ngày.
- Không cho xóa staff đang có appointment tương lai nếu chưa reassign/cancel.
- Staff chỉ được gán dịch vụ active của tenant.

## Acceptance Criteria

- Admin tạo staff và thiết lập ca làm việc thành công.
- Staff chỉ thấy lịch cá nhân khi quyền giới hạn.
- Availability engine chỉ dùng staff đang active, có working hours và được gán dịch vụ.

## Technical Notes

- Tách staff profile khỏi user auth để hỗ trợ nhân viên chưa có tài khoản đăng nhập.
- Repository cần query theo tenant bắt buộc.

## Dependencies

- F1
- F2

## Estimate

36h

## Priority

Critical
