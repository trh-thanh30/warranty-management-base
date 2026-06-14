# F13 - Audit Log & Operational Monitoring

## Overview

Ghi nhận các hành động quan trọng trong hệ thống và cung cấp màn hình audit để truy vết thay đổi dữ liệu nghiệp vụ, domain, booking, quyền và impersonation.

## Business Goal

Tăng độ tin cậy, hỗ trợ xử lý tranh chấp/lỗi vận hành và đáp ứng yêu cầu kiểm soát bảo mật cho SaaS.

## User Stories

- Là Chủ cơ sở, tôi muốn biết ai đã hủy hoặc sửa lịch hẹn.
- Là Super Admin, tôi muốn truy vết thay đổi domain và tenant.
- Là Engineering/Ops, tôi muốn xem lỗi notification/job để hỗ trợ khách hàng.

## Functional Requirements

- Audit event model.
- Ghi log cho create/update/delete quan trọng.
- Ghi log appointment status transition.
- Ghi log login/logout/security event.
- Ghi log domain verification và tenant suspend/reactivate.
- Audit search/filter.
- Operational logs cho job/notification failed.

## API Endpoints

- `GET /audit-logs`
- `GET /audit-logs/:id`
- `GET /platform/audit-logs`
- `GET /operations/job-runs`
- `GET /operations/system-events`

## Database Changes

- `audit_logs`
- `security_events`
- Reuse `job_runs`, `system_events`, `notification_logs`

## Frontend Screens

- None

## Admin Screens

- Tenant audit log page.
- Appointment status history panel.
- Platform audit log page.
- Operational monitoring table.

## Validation Rules

- Audit log là append-only.
- Business Admin chỉ thấy log tenant của mình.
- Super Admin thấy platform log.
- Sensitive data phải được redact.

## Acceptance Criteria

- Sửa/hủy appointment tạo audit event.
- Đổi role/user permission tạo audit event.
- Suspend/reactivate tenant tạo platform audit event.
- Audit table filter được theo actor, action, entity, date.

## Technical Notes

- Có thể dùng interceptor/service để ghi log sau use case.
- Không phụ thuộc vào UI để tạo audit event.

## Dependencies

- F1
- F8
- F12

## Estimate

24h

## Priority

High
