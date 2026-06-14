# F10 - Branding, Templates & Domain Setup

## Overview

Cho doanh nghiệp cấu hình logo, màu thương hiệu, banner, template booking page, subdomain và custom domain.

## Business Goal

Đảm bảo khách hàng cuối chỉ nhìn thấy thương hiệu của doanh nghiệp, không thấy dấu hiệu của phần mềm bên thứ ba.

## User Stories

- Là Chủ cơ sở, tôi muốn upload logo và chọn màu chủ đạo.
- Là Chủ cơ sở, tôi muốn có link booking dạng subdomain riêng.
- Là Chủ cơ sở, tôi muốn dùng custom domain như `booking.spaabc.com`.

## Functional Requirements

- Branding settings CRUD.
- Upload logo/banner.
- Theme color configuration.
- Template selection từ thư viện có sẵn.
- Subdomain registration.
- Custom domain record và trạng thái verify.
- Preview booking page.
- Email sender display name theo business brand.

## API Endpoints

- `GET /branding`
- `PATCH /branding`
- `GET /booking-templates`
- `PATCH /booking-templates/current`
- `GET /domains`
- `POST /domains`
- `POST /domains/:id/verify`
- `DELETE /domains/:id`

## Database Changes

- `branding_settings`
- `booking_templates`
- `tenant_template_settings`
- `domain_verifications`

## Frontend Screens

- Booking page áp dụng theme/logo/banner.
- Domain not verified fallback.

## Admin Screens

- Branding settings.
- Template picker.
- Domain management.
- Booking page preview.

## Validation Rules

- Subdomain phải unique, lowercase, không chứa ký tự đặc biệt ngoài hyphen.
- Custom domain phải unique.
- Logo/banner giới hạn loại file và dung lượng.
- Màu phải là hex hợp lệ.

## Acceptance Criteria

- Branding thay đổi phản ánh trên booking page.
- Subdomain resolve đúng tenant.
- Custom domain có trạng thái pending/verified/failed.
- Email notification dùng tên cơ sở.

## Technical Notes

- Domain resolve phụ thuộc F0.
- Asset storage có thể dùng local/S3 adapter tùy env.

## Dependencies

- F0
- F2
- F7

## Estimate

32h

## Priority

High
