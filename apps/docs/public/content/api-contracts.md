# API Contracts

Module docs nên ghi rõ contract mà frontend cần dùng, tránh phải đọc controller backend trực tiếp.

## Nên có trong mỗi module

- Base route, ví dụ `/api/bookings`.
- Danh sách endpoint frontend được phép gọi.
- Query params, body, response shape.
- Auth/permission cần thiết.
- Error code quan trọng và cách FE nên hiển thị.
- Trạng thái loading, empty, error gợi ý cho UI.

## Cách mở docs khi review contract

Từ root repo:

```bash
pnpm dev:docs
```

Mở `http://127.0.0.1:8080`, chọn module cần review ở sidebar.

Trước khi merge thay đổi contract, chạy:

```bash
pnpm build:docs
```

Lệnh này kiểm tra `modules.json` và các file `.md` được khai báo có tồn tại.

## Ví dụ format

```txt
GET /api/bookings

Query:
- page: number
- limit: number
- status?: BookingStatus

Response:
- data: BookingSummary[]
- meta: PaginationMeta
```

## Rule type dùng chung

- API response type, DTO và enum dùng lại giữa API/Admin/Web đặt trong `packages/shared/src/types`.
- Type chỉ phục vụ UI state đặt trong feature folder của app frontend.
- Nếu contract thay đổi, update `packages/shared` trước rồi cập nhật docs module.

## Checklist khi cập nhật contract

- Cập nhật DTO/type trong `packages/shared` nếu shape dùng chung.
- Cập nhật service tương ứng ở Admin/Web nếu endpoint đổi.
- Cập nhật markdown module trong `apps/docs/public/content`.
- Chạy `pnpm build:docs` để chắc module docs vẫn hợp lệ.
