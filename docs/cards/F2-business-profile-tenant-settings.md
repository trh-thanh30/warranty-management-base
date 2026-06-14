# F2 - Business Profile & Tenant Settings

## Overview

Cho Business Admin thiết lập hồ sơ doanh nghiệp, thông tin liên hệ, ngành nghề, giờ mở cửa, ngày nghỉ và cấu hình vận hành cơ bản.

## Business Goal

Doanh nghiệp có thể tự cấu hình để đưa hệ thống vào vận hành trong vài giờ mà không cần đội IT.

## User Stories

- Là Chủ Spa, tôi muốn cập nhật tên thương hiệu, địa chỉ, số điện thoại để khách thấy thông tin chính xác.
- Là Quản lý, tôi muốn cài giờ mở cửa theo từng ngày.
- Là Chủ cơ sở, tôi muốn đánh dấu ngày nghỉ lễ để khách không đặt lịch vào ngày đóng cửa.

## Functional Requirements

- CRUD business profile.
- Cấu hình giờ mở cửa theo ngày trong tuần.
- Cấu hình ngày đóng cửa bất thường/ngày lễ.
- Lưu lĩnh vực kinh doanh: Spa, Salon, Clinic, Nail, Barber, Massage, Tattoo.
- Quản lý trạng thái tenant: active, suspended, trial.
- Hiển thị thông tin gói SaaS đang sử dụng.

## API Endpoints

- `GET /business/profile`
- `PATCH /business/profile`
- `GET /business/opening-hours`
- `PUT /business/opening-hours`
- `GET /business/closures`
- `POST /business/closures`
- `DELETE /business/closures/:id`

## Database Changes

- `business_profiles`
- `business_opening_hours`
- `business_closures`
- `subscription_snapshots`

## Frontend Screens

- Public business info block trên booking page.
- Closed day state trên luồng chọn ngày.

## Admin Screens

- Business settings page.
- Opening hours editor.
- Holiday/closure calendar.
- Subscription summary panel.

## Validation Rules

- Tên doanh nghiệp là bắt buộc.
- Giờ đóng cửa phải sau giờ mở cửa.
- Không cho tạo closure trùng ngày cùng tenant.
- Số điện thoại/email phải đúng format.

## Acceptance Criteria

- Business Admin cập nhật profile và thấy thay đổi trên booking page.
- Ngày đóng cửa không sinh slot đặt lịch.
- Giờ mở cửa ảnh hưởng đến availability engine.
- Staff không được sửa business settings nếu không có quyền.

## Technical Notes

- Business settings là nguồn dữ liệu đầu vào cho F6.
- Response type dùng chung cho admin/web nên đặt ở `packages/shared`.

## Dependencies

- F0
- F1

## Estimate

28h

## Priority

Critical
