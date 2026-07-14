# Admin Shared Data Table

## Trạng Thái

- Technical debt, chưa triển khai trong phase Warranty Claims Management hiện tại.

## Vấn Đề

- Các feature Admin hiện tự xây dựng table riêng và chỉ dùng chung `PaginationControls`.
- Khi đổi trang hoặc thay đổi số dòng mỗi trang, giao diện chỉ cập nhật query/state và chưa tự cuộn về đầu bảng.
- Không nên đặt `scrollIntoView` trực tiếp vào `PaginationControls` hiện tại vì component này chỉ render phần footer; target cuộn sẽ là pagination thay vì đầu table.

## Hướng Cải Thiện Sau Này

- Tạo shared `DataTable` bao quanh table, mobile view và pagination, theo pattern đang dùng trong ecommerce-base.
- Shared `DataTable` giữ root ref và xử lý tập trung:
  - Cuộn mượt về đầu table sau khi đổi trang.
  - Cuộn về đầu table sau khi đổi page size.
  - Cuộn ngang cho table nhiều cột bằng wrapper `overflow-x-auto` và chiều rộng tối thiểu phù hợp.
  - Cuộn dọc trong vùng table khi danh sách dài, không kéo giãn toàn bộ page không cần thiết.
  - Sticky table header trong vùng cuộn để giữ ngữ cảnh cột.
  - Loading, empty/no-result state.
  - Sorting và pagination.
  - Responsive rendering: dùng table có horizontal scroll hoặc chuyển sang mobile card thông qua API như `renderMobileCard` tùy feature.
- Gọi callback cập nhật trang trước, sau đó dùng `requestAnimationFrame` và `rootRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })`.
- Migrate từng feature theo phase để dễ review: categories, customers, staff, products, warranties và warranty claims.

## Acceptance Criteria

- Đổi trang hoặc page size đưa người dùng về đầu đúng table, không cuộn tới pagination footer.
- Table nhiều cột có thể cuộn ngang mà không làm vỡ page hoặc ép nội dung cột khó đọc.
- Table header vẫn hiển thị khi cuộn dọc trong vùng table.
- Feature có mobile card giữ được khả năng chuyển đổi giữa desktop table và mobile card.
- Hành vi scroll được triển khai một lần trong shared table component, không lặp lại trong từng directory hook.
- Các table hiện tại giữ nguyên filter, sorting, loading, empty state và responsive behavior sau khi migrate.
- Không thay đổi API contract hoặc query behavior của các feature.
