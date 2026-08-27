# Category Activation Form Preview Implementation Plan

**Goal:** Cho phép admin xem trước riêng phần form thông tin kích hoạt theo danh mục từ draft hiện tại.

**Architecture:** Tách renderer field dùng chung giữa form cấu hình preview và form tạo yêu cầu. Preview nhận `DraftActivationField[]`, không gọi API và không làm thay đổi dữ liệu. Dialog có vùng nội dung cuộn riêng để dùng được với nhiều field.

**Tech Stack:** Next.js, React, TypeScript, `@repo/ui`, `lucide-react`, `next-intl`.

## Global Constraints

- Preview chỉ hiển thị khối thông tin kích hoạt theo danh mục.
- Preview phải dùng draft hiện tại, kể cả khi chưa bấm lưu.
- Không gọi API sản phẩm trong preview.
- Không thay đổi business logic lưu cấu hình hoặc gửi yêu cầu.
- Desktop giữ layout hai cột; màn hình nhỏ chuyển một cột.

### Task 1: Shared preview renderer

**Files:**

- Create: `apps/admin/src/views/categories/components/category-activation-fields-preview.tsx`
- Modify: `apps/admin/src/views/categories/category-activation-fields.view.tsx`
- Test: `apps/admin/src/views/categories/category-activation-fields-preview.test.ts`

- [ ] Viết test kiểm tra renderer hiển thị label, required marker, placeholder, SELECT options và PRODUCT_SELECT placeholder.
- [ ] Implement renderer nhận `fields: DraftActivationField[]`, chỉ render UI read-only và không gọi service.
- [ ] Dùng renderer trong dialog preview từ draft state hiện tại.
- [ ] Chạy test và lint.

### Task 2: Preview dialog and action

**Files:**

- Create: `apps/admin/src/views/categories/components/category-activation-fields-preview-dialog.tsx`
- Modify: `apps/admin/src/views/categories/category-activation-fields.view.tsx`
- Modify: `apps/admin/src/messages/en.json`
- Modify: `apps/admin/src/messages/vi.json`

- [ ] Thêm nút `Xem trước` cạnh nhóm nút thao tác.
- [ ] Mở dialog chứa duy nhất `Thông tin kích hoạt theo danh mục`.
- [ ] Giữ header/footer dialog cố định; body cuộn khi có nhiều field.
- [ ] Bổ sung bản dịch cho title, description, close và empty state.
- [ ] Chạy admin test, lint và typecheck.

### Task 3: Regression verification

**Files:**

- Modify: `apps/admin/src/views/categories/category-activation-fields-preview.test.ts`

- [ ] Kiểm tra draft chưa lưu vẫn xuất hiện trong preview.
- [ ] Kiểm tra preview không chứa customer/product request fields và không gọi API.
- [ ] Chạy `pnpm --filter @repo/admin test`, lint và typecheck.
