# Certificate Hero Visual Implementation Plan

> **For agentic workers:** Execute inline and sequentially. Do not use subagents and do not commit without explicit user permission.

**Goal:** Bổ sung ảnh sedan đỏ nền trong suốt và cải thiện hero chứng nhận bảo hành bằng HTML/CSS.

**Architecture:** Asset raster chỉ chứa xe được lưu cạnh template certificate. `WarrantyCertificateHtmlTemplateService` đọc asset một lần, chuyển sang data URI và truyền vào Handlebars; HTML/CSS chịu trách nhiệm bố cục, chữ và màu thương hiệu.

**Tech Stack:** NestJS, Handlebars, HTML/CSS, Puppeteer, Jest.

## Global Constraints

- Không chứa logo hãng xe, chữ hoặc watermark trong ảnh.
- Không gọi CDN hoặc URL ngoài khi render PDF.
- Không thay đổi business data hoặc lifecycle certificate.
- Không commit khi chưa có phép.

---

### Task 1: Generate the vehicle asset

**Files:**

- Create: `apps/api/src/modules/warranty-certificates/templates/assets/red-sedan-hero.png`

- [ ] Tạo sedan đỏ nền trong suốt, góc nhìn 3/4 phía trước, ánh sáng studio.
- [ ] Kiểm tra alpha, viền xe và việc không có logo/chữ/watermark.
- [ ] Copy asset cuối vào workspace.

### Task 2: Embed and lay out the asset

**Files:**

- Modify: `apps/api/src/modules/warranty-certificates/services/warranty-certificate-html-template.service.ts`
- Modify: `apps/api/src/modules/warranty-certificates/templates/certificate.html`
- Modify: `apps/api/src/modules/warranty-certificates/templates/certificate.css`
- Test: `apps/api/src/modules/warranty-certificates/tests/warranty-certificate-html-template.service.spec.ts`

- [ ] Viết test thất bại yêu cầu HTML chứa data URI của vehicle hero.
- [ ] Chạy focused test và xác nhận RED.
- [ ] Đọc asset một lần trong constructor và truyền `vehicleHeroDataUrl` vào template.
- [ ] Thêm ảnh vào hero; chuyển hero sang nền sáng và giữ warranty number dễ đọc.
- [ ] Chạy focused test và xác nhận GREEN.

### Task 3: Verify

- [ ] Chạy certificate test suite.
- [ ] Chạy `pnpm --filter @repo/api check-types`.
- [ ] Chạy `pnpm --filter @repo/api lint`.
- [ ] Chạy `pnpm --filter @repo/api build`.
- [ ] Chạy `git diff --check` và báo rõ các file chưa commit.
