# F12 - Platform Super Admin Portal

## Overview

Cổng quản trị nội bộ cho đội vận hành Booking System Base: quản lý tenant, gói dịch vụ, template, domain, trạng thái hệ thống và cấu hình platform.

## Business Goal

Đội vận hành có công cụ quản lý toàn bộ nền tảng SaaS, hỗ trợ khách hàng doanh nghiệp và kiểm soát tăng trưởng.

## User Stories

- Là Super Admin, tôi muốn tạo/suspend tenant.
- Là Super Admin, tôi muốn xem domain và trạng thái verify của từng tenant.
- Là Platform Operator, tôi muốn quản lý template booking page.

## Functional Requirements

- Tenant list/detail.
- Create/update/suspend tenant.
- View subscription plan snapshot.
- Manage booking templates.
- Domain oversight.
- Notification provider settings view.
- System health/status.
- Impersonation support optional với audit bắt buộc.

## API Endpoints

- `GET /platform/tenants`
- `POST /platform/tenants`
- `GET /platform/tenants/:id`
- `PATCH /platform/tenants/:id`
- `POST /platform/tenants/:id/suspend`
- `POST /platform/tenants/:id/reactivate`
- `GET /platform/domains`
- `GET /platform/templates`
- `POST /platform/templates`
- `PATCH /platform/templates/:id`

## Database Changes

- `platform_admins`
- `subscription_plans`
- `tenant_plan_assignments`
- Reuse `tenants`, `tenant_domains`, `booking_templates`

## Frontend Screens

- None

## Admin Screens

- Super Admin tenant list.
- Tenant detail.
- Template manager.
- Domain oversight.
- Platform health dashboard.

## Validation Rules

- Chỉ Super Admin truy cập được endpoint `/platform/*`.
- Suspend tenant phải chặn public booking mới.
- Không xóa tenant có dữ liệu production; chỉ archive/suspend.
- Impersonation phải có reason và audit log.

## Acceptance Criteria

- Super Admin tạo tenant mới và cấp subdomain.
- Suspend tenant làm booking page hiển thị trạng thái không khả dụng.
- Template tạo trong platform có thể được tenant chọn.
- Business Admin không truy cập được portal platform.

## Technical Notes

- Có thể dùng `apps/admin` với route group riêng cho platform hoặc tách portal sau.
- Super Admin role không thuộc tenant thông thường.

## Dependencies

- F0
- F1
- F10

## Estimate

36h

## Priority

High
