# F14 - Online Payment & Deposits

## Overview

Phase 2: Tích hợp thanh toán online để khách đặt cọc hoặc thanh toán trước khi đến, giảm no-show và hỗ trợ mô hình dịch vụ giá trị cao.

## Business Goal

Tăng cam kết của khách, giảm thất thoát doanh thu và mở đường cho POS/billing nâng cao.

## User Stories

- Là Chủ cơ sở, tôi muốn yêu cầu đặt cọc cho một số dịch vụ.
- Là Khách hàng, tôi muốn thanh toán online an toàn khi đặt lịch.
- Là Manager, tôi muốn thấy trạng thái thanh toán trên lịch hẹn.

## Functional Requirements

- Payment provider configuration.
- Deposit policy theo tenant/service.
- Tạo payment intent/session khi confirm booking.
- Webhook cập nhật paid/failed/refunded.
- Payment status trong appointment.
- Refund/cancel policy cơ bản.

## API Endpoints

- `GET /payment-settings`
- `PATCH /payment-settings`
- `POST /public/:tenantSlug/bookings/:id/pay`
- `POST /payments/webhook`
- `GET /appointments/:id/payments`
- `POST /payments/:id/refund`

## Database Changes

- `payment_settings`
- `payment_transactions`
- `deposit_policies`
- Add `payment_status` to `appointments`

## Frontend Screens

- Payment step trong booking flow.
- Payment success/failure page.
- Deposit required indicator.

## Admin Screens

- Payment settings.
- Appointment payment panel.
- Refund action.

## Validation Rules

- Không đánh dấu paid từ client; chỉ từ webhook/provider verification.
- Deposit amount không vượt quá service total.
- Webhook signature phải được verify.
- Refund chỉ cho appointment hợp lệ và quyền phù hợp.

## Acceptance Criteria

- Tenant bật deposit thì booking yêu cầu thanh toán.
- Webhook cập nhật trạng thái appointment/payment chính xác.
- Admin thấy trạng thái paid/unpaid/refunded.
- Booking unpaid theo policy có thể auto-cancel sau timeout.

## Technical Notes

- Nên dùng abstraction để hỗ trợ nhiều cổng thanh toán.
- Nếu dùng Stripe, tuân thủ best practices cho webhook và Checkout/PaymentIntent.

## Dependencies

- F7
- F8

## Estimate

40h

## Priority

Medium
