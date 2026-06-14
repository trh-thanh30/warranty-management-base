# F15 - Marketing, Loyalty & Reviews

## Overview

Phase 2/3: Mở rộng CRM thành marketing automation, loyalty/membership và review sau dịch vụ.

## Business Goal

Tăng tỷ lệ khách quay lại, tạo chương trình chăm sóc theo phân khúc và thu thập phản hồi sau dịch vụ.

## User Stories

- Là Chủ cơ sở, tôi muốn gửi ưu đãi sinh nhật tự động.
- Là Manager, tôi muốn tạo chiến dịch cho khách lâu không quay lại.
- Là Khách hàng, tôi muốn đánh giá dịch vụ sau khi sử dụng.
- Là Chủ cơ sở, tôi muốn phân hạng khách VIP/member.

## Functional Requirements

- Customer segments.
- Campaign email/SMS.
- Birthday automation.
- Win-back automation cho khách lâu không quay lại.
- Loyalty points basic.
- Membership tier.
- Review request sau completed appointment.
- Staff/service rating report.

## API Endpoints

- `GET /segments`
- `POST /segments`
- `GET /campaigns`
- `POST /campaigns`
- `POST /campaigns/:id/send`
- `GET /loyalty/settings`
- `PATCH /loyalty/settings`
- `GET /reviews`
- `POST /public/:tenantSlug/reviews`

## Database Changes

- `customer_segments`
- `campaigns`
- `campaign_recipients`
- `loyalty_accounts`
- `loyalty_transactions`
- `membership_tiers`
- `reviews`

## Frontend Screens

- Public review form.
- Loyalty/membership summary optional.

## Admin Screens

- Segment builder.
- Campaign list/editor.
- Loyalty settings.
- Reviews dashboard.

## Validation Rules

- Campaign phải có consent/opt-out handling.
- Review chỉ cho appointment completed.
- Loyalty points không âm.
- Segment query phải giới hạn để tránh tải quá lớn.

## Acceptance Criteria

- Birthday automation gửi đúng nhóm khách.
- Campaign lưu recipient và delivery status.
- Completed appointment có thể gửi review request.
- Admin xem rating theo service/staff.

## Technical Notes

- Dựa trên F5 CRM và F9 notification.
- Cần cân nhắc consent/anti-spam trước khi gửi SMS/email marketing.

## Dependencies

- F5
- F8
- F9

## Estimate

40h

## Priority

Medium
