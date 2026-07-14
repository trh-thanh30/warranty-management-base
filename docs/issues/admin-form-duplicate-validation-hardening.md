# Admin Form Duplicate Validation Hardening

## Trạng Thái

- Technical debt phát hiện sau khi bổ sung kiểm tra trùng phone/email cho Service Centers.
- Loại công việc: AFK.
- Chưa triển khai trong phase Service Centers Management hiện tại.

## Mục Tiêu

- Đồng bộ validation dữ liệu liên hệ giữa Admin, shared schema và API DTO.
- Ngăn dữ liệu trùng do khác chữ hoa/thường hoặc khác cách trình bày số điện thoại.
- Trả lỗi conflict ổn định về đúng field kể cả khi hai request ghi dữ liệu đồng thời.
- Không để Admin phụ thuộc vào nội dung error message tiếng Anh để xác định field lỗi.

## Hiện Trạng Audit

### Service Centers

- Đã validate định dạng phone/email ở Admin và API.
- Đã normalize phone/email trước khi kiểm tra và lưu.
- Đã pre-check duplicate phone/email khi create/update, loại trừ bản ghi hiện tại khi edit.
- Đã bắt Prisma `P2002` để xử lý race condition và trả conflict theo field.
- Không cần sửa thêm trong ticket này, chỉ dùng làm pattern tham chiếu.

### Customers

- Đã pre-check duplicate `customerCode`, `phone`, `email` và Admin đã map lỗi vào field.
- Phone hiện chỉ kiểm tra required/độ dài nên vẫn có thể nhận chuỗi không phải số điện thoại.
- Email chưa được normalize lowercase trước khi kiểm tra và lưu.
- Phone chưa được canonicalize nên các cách viết khác nhau của cùng một số có thể không bị xem là trùng.
- Create/update chưa map Prisma `P2002` thành conflict nghiệp vụ theo field.
- Customer code tuần tự có thể va chạm khi nhiều customer được tạo đồng thời.

### Staff Accounts

- Database duplicate email/username/phone đã được bắt bằng Prisma `P2002` và Admin map đúng field.
- Shared form schema và create API chưa validate chặt định dạng phone.
- Update API chỉ kiểm tra email là string, chưa dùng email validator.
- Update API chưa giới hạn và validate định dạng phone.
- Create/update chưa thống nhất trim/lowercase/canonicalization cho username, email và phone.

### Categories

- Đã pre-check unique theo cặp `(type, slug)` và Admin map duplicate slug vào field.
- Chưa map Prisma `P2002` phát sinh do request đồng thời thành conflict nghiệp vụ ổn định.

### Products

- Đã pre-check duplicate serial number và warranty code; Admin map lỗi vào đúng field.
- Product code có bước kiểm tra trước khi tạo.
- Chưa map Prisma `P2002` phát sinh do request đồng thời cho product code, warranty code hoặc serial number.

### Warranty Claims Và Warranties

- Warranty Claims đã retry khi generated claim code va chạm `P2002`; không cần sửa cùng loại.
- Warranty Activation dùng warranty code đã tồn tại để lookup/activate, không có form tạo identifier mới cần kiểm tra duplicate.

### Global Prisma Error Handling

- Global exception filter đã bắt `P2002` nhưng chỉ trả HTTP `400`, code `UNIQUE_CONSTRAINT` và message chung.
- Response chung không đủ để Admin xác định chính xác field lỗi.
- Một số form đang map field bằng nội dung error message; cách này dễ hỏng khi message thay đổi hoặc khi lỗi đến trực tiếp từ Prisma.

## Slice 1 — Chuẩn Hóa Contact Validation Cho Customers

### Objective

Đảm bảo customer phone/email hợp lệ và cùng một contact không thể được lưu dưới nhiều cách biểu diễn khác nhau.

### Scope

- Dùng chung phone pattern giữa Admin và API.
- Normalize email về lowercase và trim trước khi kiểm tra/lưu.
- Xác định canonical phone rule rồi áp dụng trước khi kiểm tra/lưu.
- Giữ validation của Admin và API DTO đồng nhất.
- Thêm test cho phone sai định dạng, email khác casing và phone khác formatting.

### Acceptance Criteria

- [ ] Customer phone chứa chữ hoặc sai format bị từ chối ở cả Admin và API.
- [ ] Email chỉ khác chữ hoa/thường bị xem là cùng một email.
- [ ] Các cách trình bày được hỗ trợ của cùng một số điện thoại không tạo thành nhiều customer.
- [ ] Create và update dùng cùng normalization rule.
- [ ] Edit không báo trùng với chính customer hiện tại.

## Slice 2 — Chuẩn Hóa Contact Validation Cho Staff

### Objective

Đồng bộ staff validation giữa shared schema, create DTO và update DTO mà không làm thay đổi duplicate handling hiện có.

### Scope

- Thêm phone format validation vào shared staff schema và API DTO.
- Dùng email validator cho update API.
- Bổ sung giới hạn độ dài còn thiếu trong update API.
- Normalize username/email/phone nhất quán khi create và update.
- Giữ nguyên mapping `USER_ACCOUNT_EXISTS` và danh sách field duplicate.

### Acceptance Criteria

- [ ] Create và update từ chối email không hợp lệ.
- [ ] Create và update từ chối phone sai format.
- [ ] Email/username/phone được normalize nhất quán trước khi lưu.
- [ ] Duplicate email/username/phone vẫn hiển thị lỗi đúng field trên Admin.
- [ ] Blank optional phone vẫn được chấp nhận.

## Slice 3 — Bảo Vệ Customer Duplicate Khi Ghi Đồng Thời

### Objective

Đảm bảo database vẫn trả lỗi nghiệp vụ rõ ràng khi pre-check không ngăn được concurrent write.

### Scope

- Bắt Prisma `P2002` trong create/update customer.
- Map constraint target sang `customerCode`, `phone` hoặc `email`.
- Trả stable error code và `details.fields` cho Admin.
- Bổ sung retry hoặc chiến lược cấp code an toàn cho generated customer code.
- Cập nhật Admin ưu tiên error code/details thay vì so khớp message.

### Acceptance Criteria

- [ ] Concurrent duplicate không trả generic database error.
- [ ] Admin hiển thị lỗi đúng field từ stable error details.
- [ ] Generated customer code không làm request thất bại ngay khi xảy ra collision có thể retry.
- [ ] Có unit test mô phỏng Prisma `P2002` cho từng unique field.

## Slice 4 — Chuẩn Hóa Duplicate Conflict Cho Categories Và Products

### Objective

Giữ trải nghiệm lỗi field-level ổn định khi category/product được tạo hoặc cập nhật đồng thời.

### Scope

- Map Category `P2002` của `(type, slug)` thành duplicate slug conflict.
- Map Product `P2002` của product code, warranty code và serial number thành conflict theo field.
- Trả stable error code/details.
- Cập nhật Admin mapping để không phụ thuộc hoàn toàn vào message.

### Acceptance Criteria

- [ ] Concurrent category slug collision hiển thị lỗi tại field slug.
- [ ] Concurrent product serial/warranty code collision hiển thị lỗi đúng field.
- [ ] Product code collision được retry hoặc trả lỗi nghiệp vụ rõ ràng.
- [ ] Existing pre-check và edit self-exclusion behavior không bị thay đổi.

## Slice 5 — Chuẩn Hóa Contract Lỗi Unique Toàn Hệ Thống

### Objective

Thiết lập một contract lỗi unique dùng được cho các module mà không làm mất message nghiệp vụ riêng.

### Scope

- Quy ước HTTP `409 Conflict` cho unique constraint.
- Quy ước stable error code theo domain hoặc một code chung kèm `details.fields`.
- Giữ global filter làm fallback cho constraint chưa được module map cụ thể.
- Tài liệu hóa cách use case map `P2002` và cách Admin gắn lỗi vào form field.

### Acceptance Criteria

- [ ] Unique constraint được trả dưới dạng HTTP 409.
- [ ] Response có field machine-readable, không yêu cầu parse message.
- [ ] Admin vẫn có toast fallback khi không xác định được field.
- [ ] Service Centers, Customers, Staff, Categories và Products tuân theo cùng contract.
- [ ] Warranty Claim retry hiện tại tiếp tục hoạt động.

## Thứ Tự Triển Khai Đề Xuất

1. Slice 1 — Customer contact validation.
2. Slice 2 — Staff contact validation.
3. Slice 3 — Customer concurrent duplicate handling.
4. Slice 4 — Category/Product concurrent duplicate handling.
5. Slice 5 — Chuẩn hóa contract và tài liệu hóa sau khi các module đã chứng minh pattern.

## Verification

```bash
pnpm.cmd --filter @repo/shared check-types
pnpm.cmd --filter @repo/admin lint
pnpm.cmd --filter @repo/admin test
pnpm.cmd --filter @repo/admin check-types
pnpm.cmd --filter @repo/api check-types
pnpm.cmd --filter @repo/api exec eslint "{src,apps,libs,test}/**/*.ts" --quiet
pnpm.cmd --filter @repo/api test -- --runInBand
git diff --check
```

## Ghi Chú

- Không chỉ dựa vào pre-check để đảm bảo unique; database constraint vẫn là lớp bảo vệ cuối cùng.
- Không nên kiểm tra duplicate bằng cách gọi list API từ Admin trước khi submit vì vẫn tồn tại race condition.
- FE validation phục vụ UX; API validation và database constraint mới là boundary đảm bảo dữ liệu.
- Canonical phone rule cần được chốt trước khi migrate dữ liệu cũ. Nếu thay đổi representation đã lưu, cần audit và xử lý collision trước khi thêm hoặc giữ unique constraint.
- Content Pages cũng có pre-check slug nhưng hiện chưa có Admin management trong scope audit này; có thể áp dụng cùng pattern khi feature được triển khai.
