# Kế Hoạch Chi Tiết Website Config Phase 1

## Trạng Thái

> Cập nhật phạm vi ngày 2026-07-27: cấu hình Trang chủ đã được loại khỏi
> Admin, API và mô hình database. Các phần Homepage bên dưới chỉ còn giá trị lịch sử
> của kế hoạch ban đầu; phạm vi đang hoạt động chỉ gồm Tổng quan, Thông tin
> website và Điều hướng.

- Loại tài liệu: kế hoạch triển khai chi tiết.
- Tài liệu nguồn: `docs/prd/web-main-config-api-admin-plan.md`.
- Phạm vi phase:
  - Tổng quan cấu hình: `/website-config`.
  - Thông tin website: `/website-config/site`.
  - Điều hướng: `/website-config/navigation`.
- Lớp triển khai: Database, Backend API, `packages/shared` và `apps/admin`.
- Không tích hợp hoặc sửa `apps/web` trong phase này.

## 1. Kết Quả Cần Đạt

Sau phase này, Admin có thể:

1. Xem trạng thái cấu hình của Site, Navigation và Homepage tại một màn hình tổng quan.
2. Chỉnh sửa dữ liệu dưới dạng draft mà không làm thay đổi dữ liệu public.
3. Preview draft theo `vi` hoặc `en`.
4. Publish từng domain cấu hình bằng transaction.
5. Nhận cảnh báo khi draft không hợp lệ, thiếu bản dịch hoặc tham chiếu asset hỏng.
6. Không ghi đè thay đổi của Admin khác khi version đã stale.

Backend cung cấp:

```txt
GET /public/site-settings?locale=vi
GET /public/navigation?locale=vi
GET /public/home?locale=vi
```

Public API chỉ trả dữ liệu đã publish. Việc `apps/web` gọi ba endpoint trên thuộc phase sau.

## 2. Phạm Vi Chức Năng

### 2.1. Tổng Quan Cấu Hình

Route:

```txt
/website-config
```

Màn hình gồm ba card:

- Thông tin website.
- Điều hướng.
- Trang chủ.

Mỗi card hiển thị:

- Trạng thái `Chưa cấu hình`, `Draft`, `Đã publish` hoặc `Có thay đổi chưa publish`.
- Draft version hiện tại.
- Published version hiện tại.
- Thời điểm publish gần nhất.
- Người publish gần nhất nếu có.
- Số validation warning đang chặn publish.
- Link đi tới màn hình chỉnh sửa.

Tổng quan không có bảng dữ liệu riêng và không có form chỉnh nội dung. Đây là read model tổng hợp từ ba domain cấu hình.

### 2.2. Thông Tin Website

Route:

```txt
/website-config/site
```

Các nhóm field:

#### Nhận diện

- Company name theo `vi/en`.
- Header logo.
- Footer logo.

#### Liên hệ

- Email liên hệ.
- Danh sách văn phòng:
  - Stable ID.
  - Label theo `vi/en`.
  - Address theo `vi/en`.
  - Phone.
  - Active.
  - Sort order.

#### Mạng xã hội

- Platform: `FACEBOOK`, `ZALO`, `TIKTOK`, `YOUTUBE`, `OTHER`.
- Label.
- HTTPS URL.
- Active.
- Sort order.

#### Footer và pháp lý

- Footer text theo `vi/en`.
- Legal/company information theo `vi/en`.

#### SEO mặc định

- SEO title theo `vi/en`.
- SEO description theo `vi/en`.
- OG image asset.

Hành động:

- Save draft.
- Preview theo locale.
- Publish.
- Thêm/xóa/sắp xếp office và social link trong draft.

### 2.3. Điều Hướng

Route:

```txt
/website-config/navigation
```

Nhóm menu phase đầu:

```txt
HEADER
FOOTER
POLICY
CTA
```

Mỗi item gồm:

- Stable ID.
- Group.
- Label theo `vi/en`.
- Link type: `INTERNAL` hoặc `EXTERNAL`.
- Href.
- Active.
- Sort order trong group.
- Optional parent ID.

Internal route allowlist ban đầu được lấy từ route constants hiện tại của `apps/web`:

```txt
/
/about
/products
/products/:slug
/warranty
/warranty/lookup
/warranty/activate
/warranty/request
/warranty/track
/dealers
/support-centers
/contact
/guide
/policies
/policies/general
/policies/privacy
/policies/purchasing
/policies/warranty-return
/policies/shipping
/policies/payment
```

Locale prefix không được lưu trong Admin. Web FE phase sau chịu trách nhiệm tạo locale-aware URL.

Quy tắc URL:

- Internal link phải khớp allowlist.
- External link chỉ nhận `https`.
- Không nhận `javascript:`, `data:`, protocol-relative URL hoặc raw HTML.
- Không cho parent trỏ vào chính nó hoặc tạo cycle.
- Mỗi group có deterministic order.

Hành động:

- Tạo, sửa và xóa item trong draft.
- Bật/tắt item.
- Reorder theo batch.
- Preview theo group và locale.
- Publish toàn bộ navigation trong một transaction.

### 2.4. Trang Chủ

Route:

```txt
/website-config/home
```

Section type được mở trong phase này:

```txt
HERO
TECHNOLOGY
GALLERY
FAQ
CTA
```

`FEATURED_PRODUCTS` chưa mở trong phase này. Section đó phải tham chiếu `CatalogProduct`, trong khi model catalog chưa nằm trong phạm vi phase. Không được tham chiếu `Product` hiện tại vì entity đó chứa serial number, warranty code và ownership.

Mỗi section có:

- Stable key.
- Type.
- Active.
- Sort order.
- Translation `vi/en`.
- Typed payload theo section type.
- Asset references bằng Asset ID.

Payload tối thiểu:

#### HERO

- Eyebrow.
- Title.
- Description.
- Primary action label/href.
- Optional secondary action label/href.
- Desktop background asset.
- Optional mobile background asset.
- Alt text theo locale.

#### TECHNOLOGY

- Eyebrow.
- Title.
- Description.
- Optional highlights list.
- Optional action label/href.
- Primary image asset.
- Alt text theo locale.

#### GALLERY

- Eyebrow.
- Title.
- Description.
- Danh sách gallery item:
  - Asset ID.
  - Category code.
  - Caption theo locale.
  - Alt text theo locale.
  - Sort order.

#### FAQ

- Eyebrow.
- Title.
- Danh sách item:
  - Stable ID.
  - Question theo locale.
  - Answer theo locale.
  - Active.
  - Sort order.

#### CTA

- Eyebrow.
- Title.
- Description.
- Action label/href.
- Optional background asset.
- Alt text theo locale nếu asset mang nội dung.

Hành động:

- Tạo section từ danh sách type cho phép.
- Chỉnh nội dung theo `vi/en`.
- Chọn/upload asset.
- Bật/tắt và reorder.
- Xóa section khỏi draft.
- Preview public-shaped draft.
- Publish toàn bộ homepage trong một transaction.

Không hỗ trợ:

- Custom HTML.
- CSS class.
- Tên React component.
- Arbitrary layout JSON.
- Drag-and-drop page builder.
- `FEATURED_PRODUCTS` trước khi có `CatalogProduct`.

## 3. Quyết Định Kỹ Thuật Cần Chốt Trước Migration

Tạo ADR cho bốn nội dung:

1. Revision model cho draft/published.
2. `vi/en`, required locale và fallback.
3. Internal URL allowlist.
4. Typed payload và asset reference policy của Home section.

Đề xuất mặc định:

- `vi` là locale bắt buộc.
- `en` được phép thiếu trong draft.
- Khi publish, field bắt buộc của `vi` phải đầy đủ.
- Public request `locale=en` fallback từng translation sang `vi`.
- Nếu bản `vi` thiếu field bắt buộc thì không cho publish, không trả partial public content.

## 4. Data Model Đề Xuất

Không dùng một JSON blob cho toàn bộ Site, Navigation hoặc Homepage.

### 4.1. Revision Metadata

Mỗi domain có revision root riêng:

- `WebsiteSiteRevision`.
- `WebsiteNavigationRevision`.
- `WebsiteHomeRevision`.

Các revision root có chung metadata:

```txt
id
site_key
state                 DRAFT | PUBLISHED | ARCHIVED
revision_number       version public, tăng khi publish
lock_version          optimistic concurrency của draft
published_at
published_by_id
created_at
updated_at
```

Quy tắc:

- Mỗi `site_key` chỉ có một draft đang chỉnh và một published revision hiện hành.
- Public query chỉ đọc revision `PUBLISHED`.
- Save/reorder tăng `lock_version`.
- Mutation nhận `expectedVersion`; khác `lock_version` trả `409`.
- Publish validate toàn aggregate, archive published revision cũ, publish draft và tạo draft kế tiếp từ snapshot vừa publish trong cùng transaction.
- Published revision không bị mutation trực tiếp.

### 4.2. Site Tables

```txt
WebsiteSiteRevision
WebsiteSiteTranslation
WebsiteOffice
WebsiteOfficeTranslation
WebsiteSocialLink
```

Field cần relation/query như Asset ID, email, phone, active và order phải là column.

Logo/OG image dùng relation tới `Asset`; chỉ nhận asset:

- Tồn tại.
- `is_deleted = false`.
- `access_type = PUBLIC`.
- MIME thuộc image.

### 4.3. Navigation Tables

```txt
WebsiteNavigationRevision
WebsiteNavigationItem
WebsiteNavigationItemTranslation
```

Constraint:

- Unique order theo revision/group/parent.
- Parent phải cùng revision và group.
- Xóa parent có children phải bị reject hoặc yêu cầu move children rõ ràng.

### 4.4. Homepage Tables

```txt
WebsiteHomeRevision
WebsiteHomeSection
WebsiteHomeSectionTranslation
WebsiteHomeSectionAsset
```

`WebsiteHomeSectionTranslation.payload` được phép là JSON vì payload thay đổi theo discriminator, nhưng:

- Phải parse bằng schema cụ thể cho từng section type.
- Không nhận `unknown[]`.
- Không chứa raw asset URL hoặc copied Asset object.
- Asset relation được lưu riêng qua `WebsiteHomeSectionAsset`.
- FAQ/gallery item phải có stable ID và sort order.

### 4.5. Audit

`ActivityLog` hiện tại chỉ có `admin_id`, `admin_name`, `action`, `type` nên chưa đủ cho yêu cầu versioned config.

Thêm audit model/helper có tối thiểu:

```txt
actor_id
domain
entity_id hoặc site_key
action
before_version
after_version
change_summary
created_at
```

Ghi audit cho:

- Save draft.
- Publish.
- Reorder.
- Add/remove/replace asset.

## 5. Shared Contracts

Thêm:

```txt
packages/shared/src/types/website-config-common.types.ts
packages/shared/src/types/website-config-overview.types.ts
packages/shared/src/types/website-site-setting.types.ts
packages/shared/src/types/website-navigation.types.ts
packages/shared/src/types/website-home.types.ts
```

Contract chung:

```ts
type WebsiteLocale = "vi" | "en";

type WebsiteRevisionMeta = {
  draftVersion: number;
  publishedVersion: number | null;
  hasUnpublishedChanges: boolean;
  lastPublishedAt: string | null;
  lastPublishedBy: { id: string; name: string } | null;
};

type VersionedMutation = {
  expectedVersion: number;
};
```

Home payload phải dùng discriminated union:

```ts
type WebsiteHomeSection =
  | WebsiteHeroSection
  | WebsiteTechnologySection
  | WebsiteGallerySection
  | WebsiteFaqSection
  | WebsiteCtaSection;
```

Không copy lại response types trong `apps/admin`.

## 6. Permission

Thêm vào Prisma enum và shared constants:

```txt
WEBSITE_CONFIG_VIEW
WEBSITE_CONFIG_UPDATE
WEBSITE_CONFIG_PUBLISH
```

Dependency:

```txt
WEBSITE_CONFIG_UPDATE  -> WEBSITE_CONFIG_VIEW
WEBSITE_CONFIG_PUBLISH -> WEBSITE_CONFIG_VIEW
```

Đề xuất role:

- `ADMIN`: có cả ba permission.
- `MODERATOR`: có thể được cấp/revoke cả ba bằng permission override.
- `CUSTOMER`: không có.

UI behavior:

- Không có `VIEW`: ẩn sidebar group và route render forbidden state.
- Có `VIEW`, không có `UPDATE`: màn hình read-only.
- Có `UPDATE`, không có `PUBLISH`: được save draft nhưng không thấy publish action.

API vẫn là nguồn bảo vệ chính và phải trả `403` độc lập với UI.

## 7. API Contract

### 7.1. Overview

```txt
GET /website-config/overview
```

Permission: `WEBSITE_CONFIG_VIEW`.

Response tổng hợp trạng thái Site, Navigation và Home. Endpoint không tạo dữ liệu hoặc auto-publish.

### 7.2. Site Settings

```txt
GET   /website-config/site-settings
PATCH /website-config/site-settings/draft
GET   /website-config/site-settings/preview?locale=vi
POST  /website-config/site-settings/publish
GET   /public/site-settings?locale=vi
```

`PATCH` và `POST publish` nhận `expectedVersion`.

Office/social reorder được gửi trong cùng aggregate payload hoặc endpoint batch riêng; không PATCH từng order.

### 7.3. Navigation

```txt
GET    /website-config/navigation
POST   /website-config/navigation/items
PATCH  /website-config/navigation/items/:id
DELETE /website-config/navigation/items/:id
POST   /website-config/navigation/reorder
GET    /website-config/navigation/preview?locale=vi
POST   /website-config/navigation/publish
GET    /public/navigation?locale=vi
```

Mọi mutation draft nhận `expectedVersion`.

### 7.4. Homepage

```txt
GET    /website-config/home-sections
POST   /website-config/home-sections
PATCH  /website-config/home-sections/:id
DELETE /website-config/home-sections/:id
POST   /website-config/home-sections/reorder
GET    /website-config/home-sections/preview?locale=vi
POST   /website-config/home-sections/publish
GET    /public/home?locale=vi
```

### 7.5. Error Codes

Chuẩn hóa stable error code:

```txt
WEBSITE_CONFIG_VERSION_CONFLICT       409
WEBSITE_CONFIG_PUBLISH_INVALID        422
WEBSITE_CONFIG_REQUIRED_LOCALE_MISSING 422
WEBSITE_CONFIG_ASSET_INVALID          422
WEBSITE_CONFIG_URL_INVALID            422
WEBSITE_CONFIG_REFERENCE_CONFLICT     409
```

Version conflict response phải trả version mới nhất để Admin cho phép reload.

## 8. Admin FE Architecture

### Routes

```txt
apps/admin/app/[locale]/(dashboard)/website-config/page.tsx
apps/admin/app/[locale]/(dashboard)/website-config/site/page.tsx
apps/admin/app/[locale]/(dashboard)/website-config/navigation/page.tsx
apps/admin/app/[locale]/(dashboard)/website-config/home/page.tsx
```

Các `page.tsx` là server component mỏng và chỉ render view.

### Views

```txt
apps/admin/src/views/website-config/
├── overview/
├── site/
├── navigation/
├── home/
└── components/
```

Component dùng chung trong feature:

- Revision status header.
- Draft/published badge.
- Locale tabs.
- Publish confirmation dialog.
- Version conflict state.
- Validation summary.
- Asset picker.

Không đưa component đặc thù Website Config vào `src/components/common` nếu chưa có consumer ngoài feature.

### Services

```txt
apps/admin/src/services/website-config/
├── website-config-overview.service.ts
├── website-site.service.ts
├── website-navigation.service.ts
├── website-home.service.ts
└── website-config.service.test.ts
```

Query keys đặt ở app constants và tách theo domain/version.

### UI/UX Contract

- Mỗi màn hình có đúng một primary action tại một thời điểm.
- Save draft và Publish phải có loading/disabled state.
- Publish luôn có confirmation và validation summary.
- Lỗi field hiển thị cạnh field và được screen reader announce.
- Sau submit lỗi, focus field invalid đầu tiên.
- Reorder có nút Move up/Move down hoặc keyboard control; drag-and-drop chỉ là bổ sung.
- Touch target tối thiểu khoảng `44x44`.
- Không dựa riêng vào màu để thể hiện Draft/Published/Error.
- Có loading, empty, error, forbidden và stale-version state.
- Form dài được chia section và có navigation nội bộ hoặc progressive disclosure.
- Asset có preview với kích thước/aspect ratio ổn định để tránh layout shift.
- Hỗ trợ light/dark theo token và responsive tại `375`, `768`, `1024`, `1440`.

## 9. Kế Hoạch Triển Khai Theo Vertical Slice

### Slice 0 — ADR Và Foundation

#### API/shared

- Viết ADR cho revision/i18n/URL/typed payload.
- Thêm permission enum, shared permission constants và permission dependencies.
- Thêm common contracts cho locale, revision, publish và version conflict.
- Tạo audit helper.
- Thêm website config module shell vào `AppModule`.

#### Admin

- Thêm sidebar group `Website`.
- Thêm bốn route mỏng và permission gate.
- Thêm service/query-key shell.
- Thêm revision header, status badge, validation summary và publish dialog.
- Thêm message keys `vi/en`.

#### Acceptance

- Unauthorized user không thấy sidebar và API trả `403`.
- `/settings` giữ nguyên.
- Route shell không chứa client/business logic trong `page.tsx`.
- ADR giải quyết đủ bốn quyết định trước khi migration.

### Slice 1 — Site Settings Tracer Bullet

#### Database/API

- Migration các bảng Site revision, translation, office và social.
- Seed `site_key = main` với draft rỗng hợp lệ về cấu trúc.
- Repository.
- Get draft/published use case.
- Save draft use case.
- Preview projection use case.
- Publish use case.
- Public site settings use case/controller.
- Asset validation và audit.

#### Admin

- Form theo các nhóm Nhận diện, Liên hệ, Văn phòng, Social, Footer và SEO.
- Locale tabs.
- Office/social accessible reorder.
- Asset picker/upload cho logo và OG image.
- Save/preview/publish workflow.
- Dirty-state guard và stale-version recovery.

#### Acceptance

- Save draft không đổi public response.
- Publish tăng published version.
- Public response đúng locale/fallback.
- Office/social order lưu atomically.
- Invalid email, phone, external URL hoặc Asset chặn publish.
- Hai Admin không silently overwrite nhau.

### Slice 2 — Navigation

#### Database/API

- Migration Navigation revision/item/translation.
- CRUD draft use cases.
- Batch reorder use case.
- Hierarchy/cycle validator.
- Internal/external URL policy validator.
- Preview và publish use cases.
- Public navigation projection.

#### Admin

- Tabs/group filter: Header, Footer, Policy, CTA.
- Item editor với `vi/en`.
- Internal route selector và external URL input.
- Active toggle.
- Accessible reorder.
- Preview theo locale.

#### Acceptance

- Public chỉ trả active item thuộc published revision.
- Order ổn định theo group/parent.
- Link sai policy hoặc hierarchy cycle không publish được.
- Reorder là một transaction.
- Xóa/move parent có children có behavior rõ ràng.

### Slice 3 — Homepage Core

#### Database/API

- Migration Home revision/section/translation/asset relation.
- Schema validator cho năm section type.
- CRUD draft use cases.
- Batch reorder.
- Asset reference validator.
- Preview và publish use cases.
- Public home projection.

#### Admin

- Section directory.
- Add-section dialog chỉ có năm type được hỗ trợ.
- Editor riêng theo discriminator.
- Asset picker cho Hero, Technology, Gallery và CTA.
- FAQ/gallery item reorder.
- Section active/reorder.
- Preview theo locale.

#### Acceptance

- Payload không đúng discriminator trả `422`.
- Raw asset path/object hoặc arbitrary CSS/HTML bị từ chối.
- Asset private/deleted/sai MIME không publish được.
- Public response có deterministic order.
- `FEATURED_PRODUCTS` không xuất hiện trong add-section UI.

### Slice 4 — Overview Và Release Hardening

#### API

- Hoàn thiện overview read model từ ba domain.
- Contract tests cho ba public endpoints.
- Permission, audit và concurrency regression tests.
- OpenAPI examples.
- ETag/`If-None-Match` nếu caching contract được bật trong ADR.

#### Admin

- Hoàn thiện overview cards, warning count và deep links.
- Cross-screen navigation và refresh state.
- Accessibility/responsive pass.
- Empty/error/forbidden/stale-version pass.

#### Seed/inventory

- Inventory dữ liệu Site, Navigation và Home đang hardcode trong `apps/web`.
- Tạo import/seed idempotent thành draft baseline.
- Không tự động publish baseline.
- Không sửa `apps/web`.

#### Acceptance

- Fresh database có draft baseline hoặc empty state có hướng dẫn rõ.
- Public endpoint chỉ có dữ liệu sau explicit publish.
- Overview phản ánh đúng published/draft state.
- OpenAPI có request/response example để Web FE tích hợp phase sau.

## 10. Test Strategy

### API Unit Tests

- Save draft.
- Locale fallback.
- Required locale validation.
- Publish transaction.
- Version conflict.
- Navigation cycle/URL validation.
- Reorder validation.
- Home discriminator validation.
- Asset reference validation.

Use case test dùng mocked repository.

### Repository Integration Tests

- Chỉ một draft và một current published revision cho `site_key`.
- Publish archive revision cũ và tạo draft kế tiếp atomically.
- Rollback toàn bộ nếu publish/reorder lỗi.
- Deterministic ordering.
- Concurrent update chỉ một request thành công.

### Controller/E2E Tests

- `401/403`.
- DTO validation.
- Public draft leakage.
- Locale query.
- Public `404` hoặc empty policy trước lần publish đầu tiên.
- Stable error code.
- Public DTO không chứa audit, actor hoặc raw asset path.

### Admin Tests

- Service method/path/payload.
- Permission visibility.
- Save draft.
- Publish confirmation.
- Version conflict recovery.
- Field-level validation.
- Locale tabs.
- Accessible reorder.
- Loading/empty/error/forbidden states.

### Shared Tests

- Discriminated union compile contract.
- Permission constants đồng bộ.
- Public/Admin response types không bị trùng định nghĩa.

## 11. Verification Commands

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

Chạy migration/seed idempotency và e2e database trong môi trường test riêng trước rollout.

## 12. Rollout

1. Merge Slice 0 nhưng giữ route bằng permission gate.
2. Deploy migration + Site Settings.
3. Seed draft baseline, không auto-publish.
4. QA Site flow và publish một baseline được duyệt.
5. Lặp lại với Navigation.
6. Lặp lại với Homepage.
7. Bật Overview hoàn chỉnh.
8. Bàn giao OpenAPI/sample response cho phase tích hợp `apps/web`.

Rollback:

- Public API luôn giữ published revision cuối cùng.
- Draft lỗi không ảnh hưởng public.
- Không hard-delete published revision trong phase này.
- Migration phải có kế hoạch rollback và seed/import phải idempotent.

## 13. Dependencies Và Phần Để Lại

### Dependency trong phase

- Assets API/storage hiện có được tái sử dụng.
- Assets list/picker phải hỗ trợ `WEBSITE_CONFIG_VIEW/UPDATE`, không phụ thuộc cứng vào role Admin nếu Moderator được cấp quyền.
- Asset deletion protection phải nhận biết Site/Home references.

### Để lại cho phase sau

- `apps/web` gọi Public API và bỏ hardcode.
- `CatalogProduct`.
- Homepage `FEATURED_PRODUCTS`.
- Warranty public settings.
- Dealer/Service Center public config.
- Content Page i18n/version hardening.
- Visual page builder.

## 14. Definition Of Done

Phase hoàn tất khi:

- Bốn route Admin hoạt động đúng permission.
- Site, Navigation và Home có draft, preview, publish và public read API.
- Overview phản ánh đúng trạng thái của ba domain.
- `vi/en`, fallback và publish validation thống nhất.
- Publish/reorder chạy transactionally.
- Version conflict không gây silent overwrite.
- Asset reference an toàn và asset đang dùng không bị hard-delete.
- Audit ghi đủ actor/action/version.
- Public DTO không lộ draft, audit hoặc raw asset path.
- Test và verification commands đạt.
- Không có thay đổi trong `apps/web`.
