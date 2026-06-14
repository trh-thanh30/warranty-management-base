# F0 - Core Infrastructure & SaaS Foundation

## Overview

Thiết lập nền tảng kỹ thuật cho SaaS multi-tenant white-label: API, web/admin apps, database, cache/job queue, tenant context, health check, logging, environment config và deployment baseline.

## Business Goal

Đảm bảo hệ thống có thể phục vụ nhiều doanh nghiệp trên cùng hạ tầng, cô lập dữ liệu theo tenant và sẵn sàng mở rộng sang booking, CRM, notification, reporting.

## User Stories

- Là Platform Operator, tôi muốn tạo và vận hành nhiều tenant trên cùng hệ thống.
- Là Engineering Team, tôi muốn mọi request có tenant context rõ ràng để tránh lẫn dữ liệu.
- Là Business Admin, tôi muốn hệ thống ổn định, bảo mật và load nhanh trên mobile.

## Functional Requirements

- Khởi tạo module tenant/core.
- Cấu hình database, migration, seed dữ liệu demo.
- Tenant resolution qua subdomain, custom domain hoặc header nội bộ.
- Health check API cho database/cache.
- Structured logging và request correlation id.
- Background job queue baseline cho notification/reminder.
- Environment validation cho API/Admin/Web.
- Shared response shape và error handling chuẩn.

## API Endpoints

- `GET /health`
- `GET /health/readiness`
- `GET /health/liveness`
- `GET /tenants/resolve?host={host}`
- `GET /internal/tenants/:tenantId/context`

## Database Changes

- `tenants`
- `tenant_domains`
- `tenant_settings`
- `job_runs`
- `system_events`

## Frontend Screens

- Public tenant resolution fallback page.
- Error page khi domain chưa cấu hình.
- Maintenance/loading states.

## Admin Screens

- System status panel cho Super Admin.
- Tenant diagnostics view.

## Validation Rules

- Mỗi request nghiệp vụ phải có `tenantId`.
- Domain/subdomain là duy nhất.
- Không cho public API trả dữ liệu tenant khác.
- Env bắt buộc phải được validate lúc boot.

## Acceptance Criteria

- API khởi động thành công với env hợp lệ.
- Health endpoints phản ánh đúng trạng thái database/cache.
- Resolve domain trả đúng tenant.
- Request không có tenant context bị chặn ở module nghiệp vụ.
- Migration và seed chạy được trên môi trường dev.

## Technical Notes

- Backend theo Clean Architecture nhẹ: controller -> use case -> repository.
- Shared tenant DTO có thể đặt trong `packages/shared/src/types`.
- Job queue dùng cho reminder và follow-up về sau.

## Dependencies

- None

## Estimate

32h

## Priority

Critical
