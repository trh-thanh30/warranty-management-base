# Kế Hoạch Web Main Config — API Và Admin

## Trạng Thái

> Cập nhật ngày 2026-07-27: cấu hình Trang chủ được loại khỏi Admin, API và mô
> hình database. Các phần Homepage trong tài liệu này chỉ còn là lịch sử của kế
> hoạch ban đầu, không thuộc phạm vi triển khai hiện tại.

- Loại tài liệu: kế hoạch triển khai.
- Nguồn yêu cầu: `docs/architecture/frontend-admin-config-boundaries.md`.
- Phạm vi hiện tại: Backend API, shared contracts và Admin FE để quản trị cấu hình/nội dung cho Public Web.
- Chưa triển khai trong tài liệu này.

## Mục Tiêu

Xây dựng nơi quản trị tập trung cho dữ liệu và nội dung mà `apps/web` không nên hardcode, đồng thời chuẩn bị public read API ổn định để Web FE tích hợp ở phase sau.

Kết quả mong muốn:

- Admin có thể chỉnh nội dung, dữ liệu vận hành, thứ tự hiển thị và trạng thái publish mà không cần deploy frontend.
- API tách rõ endpoint quản trị có phân quyền và endpoint public chỉ đọc dữ liệu đã publish/active.
- Contract dùng chung nằm trong `packages/shared`.
- Dữ liệu hỗ trợ `vi` và `en` ngay từ schema ban đầu.
- Không biến toàn bộ website config thành một JSON blob hoặc một màn hình form khổng lồ.

## Ngoài Phạm Vi

- Không sửa `apps/web`.
- Không thay constants/hardcode hiện tại trong `apps/web`.
- Không thêm query hooks, loading/error state hoặc rendering logic vào Web FE.
- Không thay route, layout, animation, CSS hay component behavior của Web FE.
- Không xây visual page builder hoặc drag-and-drop layout tự do.
- Không cho Admin chỉnh route architecture, CSS class hoặc validation kỹ thuật.

Public read API vẫn thuộc phạm vi Backend vì đây là contract đầu ra của config. Việc gọi các endpoint này từ `apps/web` được để lại cho phase riêng.

## Audit Hiện Trạng

| Nhóm theo boundary doc         | Hiện trạng trong repo                                                                                                          | Hướng xử lý                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Site settings                  | Chưa có persistence/API/Admin cho company, office, social, default SEO                                                         | Xây module mới                                                                  |
| Navigation                     | Chưa có persistence/API/Admin                                                                                                  | Xây module mới                                                                  |
| Homepage sections              | Chưa có persistence/API/Admin                                                                                                  | Xây module mới, payload có schema theo section type                             |
| Product catalog                | Có categories, products, assets, publish API và public list; tuy nhiên `Product` cũng chứa serial, warranty code và ownership  | Chốt lại domain và tách catalog item khỏi product instance trước khi mở rộng    |
| Dealer/showroom/support center | Có `Dealer`, `ServiceCenter` và Admin CRUD; thiếu geo coordinates, opening hours, services, sort order và public dealer API    | Mở rộng module hiện có                                                          |
| Warranty settings              | Có warranty nghiệp vụ theo từng product instance; chưa có support config, issue options và duration rules cấp catalog/category | Xây module config mới, không trộn với warranty record                           |
| Policy/guide content           | Có Content Pages CRUD, status và public read API                                                                               | Mở rộng i18n, SEO và version/publish behavior                                   |
| Media                          | Có Asset, AssetLink, ProductAsset và upload/storage service                                                                    | Tái sử dụng; bổ sung asset picker/reference rules thay vì tạo media storage mới |
| Admin `/settings`              | Hiện là profile, password và permission của người đang đăng nhập                                                               | Giữ nguyên; tạo khu vực `website-config` riêng                                  |

## Quyết Định Kiến Trúc Cần Chốt

### 1. Tách Website Config Khỏi Account Settings

- Giữ `/settings` cho profile/security của tài khoản.
- Tạo route group `/website-config/*` và sidebar group “Website”.
- Các domain lớn như Catalog, Locations và Content Pages tiếp tục có màn hình riêng; trang Website Config chỉ điều hướng/tổng hợp trạng thái publish, không nhét mọi form vào một tab duy nhất.

### 2. Không Dùng Một JSON Blob Cho Toàn Bộ Website

- Dùng first-class columns/table cho field cần query, sort, relation, permission hoặc publish.
- Chỉ dùng JSON cho payload section có cấu trúc được validate theo discriminator.
- Mỗi loại homepage section phải có shared type và API DTO cụ thể; không nhận `unknown[]`.

### 3. Phân Biệt Catalog Product Và Product Instance

`Product` hiện có `serial_number`, `warranty_code`, ownership và warranty nên đang mang nghĩa một sản phẩm vật lý/instance đã bán. Public catalog lại cần model/SKU như SP50, SP10, B55 với nội dung marketing, specs và gallery dùng chung.

Khuyến nghị:

- Tạo `CatalogProduct` (hoặc canonical term được chốt trong ADR) cho model/SKU public.
- Giữ `Product` là product instance dùng cho activation, ownership và warranty.
- Thêm nullable `catalog_product_id` vào `Product` để migration dần.
- Category, specs, gallery, technology, recommended position, SEO, publish state và warranty default thuộc `CatalogProduct`.
- Serial, warranty code, owner, purchase/activation state và warranty thực tế thuộc `Product`.

Không tiếp tục thêm marketing fields vào `Product.metadata`; những field cần filter/display ổn định phải là column hoặc child records.

### 4. i18n Là Persistence Concern

- Entity giữ field không phụ thuộc locale: slug/code/status/order/relation/url.
- Text hiển thị nằm trong translation records theo `locale`.
- Admin API trả đủ translations để chỉnh `vi` và `en`.
- Public API nhận `locale=vi|en`, mặc định `vi`, và trả đúng một locale.
- Quy tắc fallback đề xuất: locale được yêu cầu → `vi` → không publish nếu thiếu field bắt buộc.

### 5. Draft, Publish Và Concurrency

- Nội dung marketing có trạng thái `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- Admin lưu draft riêng với public version; public endpoint không bao giờ đọc draft.
- Publish cần transaction và tăng `version`.
- Update nhận `expectedVersion` hoặc ETag để tránh hai Admin ghi đè lẫn nhau.
- Site settings có thể là singleton theo `siteKey = "main"` nhưng vẫn phải có draft/published revision.
- Reorder phải dùng endpoint batch/transaction, không PATCH từng item.

## Data Model Đề Xuất

Tên cụ thể có thể điều chỉnh trong ADR, nhưng boundary nên giữ như sau.

### Website Site Settings

- `WebsiteSiteSetting`: `site_key`, logo asset references, email, footer legal info, default SEO asset, version/timestamps.
- `WebsiteSiteSettingTranslation`: `locale`, company name, footer text, SEO title/description.
- `WebsiteOffice`: label/address/phone/order/active.
- `WebsiteOfficeTranslation`: locale-aware label/address khi cần.
- `WebsiteSocialLink`: platform, label, URL, active, sort order.

### Navigation

- `WebsiteNavigationItem`: group, href, external flag, active, sort order, optional parent.
- `WebsiteNavigationItemTranslation`: locale, label.
- Validate internal href bằng allowlist route prefix; external href chỉ cho `https`.

### Homepage

- `WebsiteHomeSection`: stable key, type, status, sort order, draft/published version.
- `WebsiteHomeSectionTranslation`: locale, title, description và typed JSON payload.
- Supported types phase đầu: `HERO`, `FEATURED_PRODUCTS`, `TECHNOLOGY`, `GALLERY`, `FAQ`, `CTA`.
- Relation tới catalog product/asset phải lưu bằng ID; không lưu URL hoặc object copy nếu dữ liệu đã có entity owner.

### Catalog

- `CatalogProduct`: category, code, slug, technology type, recommended position, active/publish/order/SEO asset/version.
- `CatalogProductTranslation`: locale, name, short description, description, SEO title/description.
- `CatalogProductSpec`: key, value, unit, sort order; label nằm trong translation hoặc spec translation.
- `CatalogProductAsset`: asset, role, alt translations, sort order.
- `Product.catalog_product_id`: optional relation từ warranty product instance tới catalog item.

### Warranty Config

- `WarrantyPublicSetting`: support phone, support message translations, lookup examples, policy page relation, version.
- `WarrantyDurationRule`: ưu tiên catalog product → category → default; dùng `duration_months`, không dùng `warrantyYears`.
- `WarrantyIssueOption`: code, active, sort order.
- `WarrantyIssueOptionTranslation`: locale, label/help text.
- Use case phải reject rule overlap/ambiguity và định nghĩa precedence rõ ràng.

### Locations

- Mở rộng `Dealer` và `ServiceCenter` với latitude, longitude, opening hours, services, sort order.
- Nếu showroom là khái niệm riêng, thêm location type sau khi chốt glossary; không ép Dealer và ServiceCenter vào một table chỉ để phục vụ UI.
- Public API có thể aggregate hai nguồn thành `PublicLocation` với discriminator `DEALER | SERVICE_CENTER | SHOWROOM`.

### Content Pages

- Giữ `ContentPage` làm entity gốc cho slug, kind, category, status và publish metadata.
- Chuyển title/summary/content/SEO sang `ContentPageTranslation`.
- Bổ sung SEO title/description/OG asset.
- Nội dung rich text phải được sanitize ở API trước khi publish.

### Assets

- Tái sử dụng `Asset`/`AssetLink`/storage hiện có.
- Thêm reference validation: asset phải tồn tại, chưa deleted, public-readable và đúng MIME role.
- Không hard delete asset đang được config/catalog/content tham chiếu.
- Admin cần asset picker với filter theo type/folder và preview; upload tiếp tục qua Assets API hiện có.

## API Contract

### Admin API

Các endpoint protected dùng permission guard hiện tại:

```txt
GET    /website-config/site-settings
PATCH  /website-config/site-settings/draft
POST   /website-config/site-settings/publish

GET    /website-config/navigation
POST   /website-config/navigation
PATCH  /website-config/navigation/:id
DELETE /website-config/navigation/:id
POST   /website-config/navigation/reorder
POST   /website-config/navigation/publish

GET    /website-config/home-sections
POST   /website-config/home-sections
PATCH  /website-config/home-sections/:id
DELETE /website-config/home-sections/:id
POST   /website-config/home-sections/reorder
POST   /website-config/home-sections/publish

GET    /website-config/warranty-settings
PATCH  /website-config/warranty-settings/draft
POST   /website-config/warranty-settings/publish
```

Catalog, Dealer, Service Center, Content Page và Asset tiếp tục dùng module/controller riêng; chỉ bổ sung field, translation, publish và public-read behavior còn thiếu. Không tạo proxy CRUD tương ứng dưới `/website-config`.

### Public Read API

```txt
GET /public/site-settings?locale=vi
GET /public/navigation?locale=vi
GET /public/home?locale=vi
GET /public/catalog-products?locale=vi
GET /public/catalog-products/:slug?locale=vi
GET /public/locations?locale=vi
GET /public/warranty-settings?locale=vi
GET /public/content-pages/:slug?locale=vi
```

Quy tắc chung:

- Chỉ trả record active/published.
- Không trả draft, internal note, audit field hoặc raw asset path.
- Trả `version` và `updatedAt`; hỗ trợ `ETag`/`If-None-Match` nếu caching layer cần.
- Collection có deterministic order.
- Slug/detail không tồn tại hoặc chưa publish trả `404`.
- Public DTO là explicit projection, không serialize Prisma model trực tiếp.

### Shared Contracts

Thêm vào `packages/shared/src/types` theo domain:

- `website-site-setting.types.ts`
- `website-navigation.types.ts`
- `website-home.types.ts`
- `catalog-product.types.ts`
- `warranty-public-setting.types.ts`
- `public-location.types.ts`

Shared package chứa response/body/query types và union/discriminator; Nest-only validation DTO vẫn nằm trong `apps/api`.

## Permission Và Audit

Thêm permission tối thiểu:

- `WEBSITE_CONFIG_VIEW`
- `WEBSITE_CONFIG_UPDATE`
- `WEBSITE_CONFIG_PUBLISH`

Giữ permission hiện có cho Product/Catalog, Dealer, Service Center, Content Page và Asset. Nếu business cần phân quyền biên tập từng nhóm, tách permission sau khi có role matrix thực tế.

Mọi thao tác publish, archive, reorder và thay asset phải ghi audit:

- actor;
- entity/config key;
- version trước/sau;
- timestamp;
- action;
- optional change summary.

## Admin FE Information Architecture

### Sidebar Và Routes

```txt
Website
├── Tổng quan cấu hình       /website-config
├── Thông tin website       /website-config/site
├── Điều hướng              /website-config/navigation
├── Trang chủ               /website-config/home
├── Catalog                 /catalog-products
├── Địa điểm                /dealers và /service-centers
├── Bảo hành công khai      /website-config/warranty
├── Nội dung                /content-pages
└── Media                   /assets (khi asset library screen sẵn sàng)
```

`/settings` vẫn là Account Settings và không đổi ý nghĩa.

### Pattern Mỗi Màn Hình Config

- Page route là server component mỏng, render view trong `src/views`.
- View/client state ở `src/views/website-config/<feature>`.
- API calls ở `src/services/website-config`.
- Query keys ở app constants; form schema/type chỉ phục vụ UI nằm trong feature.
- Header hiển thị trạng thái draft/published, version và lần publish gần nhất.
- Form có Save draft, Preview data và Publish; Publish yêu cầu confirm.
- Có dirty-state guard, field-level error, loading, empty, forbidden và stale-version state.
- Reorder dùng accessible controls/keyboard fallback, không chỉ phụ thuộc drag-and-drop.
- Locale editor dùng tab `vi`/`en` và chỉ cho publish khi locale bắt buộc hợp lệ.
- Asset field dùng picker/upload, preview và alt text; không cho nhập raw internal path.

## Vertical Slices

### Slice 0 — Contract, ADR Và Foundation

**API/shared**

- Viết ADR chốt `CatalogProduct` so với `Product` instance, i18n storage, publish/version model và URL policy.
- Thêm permission enum/shared constants/dependencies.
- Thêm locale DTO, publish metadata contract và optimistic concurrency error contract.
- Chuẩn hóa audit helper dùng cho publish/reorder.

**Admin**

- Thêm sidebar group/routes rỗng có permission gate.
- Tạo service boundary/query key và shared state components cho draft/published/version.
- Giữ nguyên `/settings`.

**Acceptance**

- [ ] Thuật ngữ catalog item và product instance không còn nhập nhằng.
- [ ] `vi`/`en`, fallback và required locale được chốt.
- [ ] Unauthorized Admin không thấy route và API trả `403`.
- [ ] Stale update có stable error code, không silently overwrite.

### Slice 1 — Site Settings Tracer Bullet

**API**

- Migration cho site setting, translations, offices và social links.
- Repository + get/update-draft/publish use cases + unit tests.
- Admin endpoints và `GET /public/site-settings`.
- Seed `siteKey=main` với draft ban đầu.

**Admin**

- `/website-config/site` với company, logo, contact, offices, socials, footer và default SEO.
- Service tests, form schema/utils tests và publish confirmation.

**Acceptance**

- [ ] Admin lưu draft không làm đổi public response.
- [ ] Publish tăng version và public API trả đúng locale.
- [ ] Office/social reorder được lưu atomically.
- [ ] Asset reference và external URL được validate.

### Slice 2 — Navigation

**API**

- Navigation entity/translation CRUD, batch reorder và publish.
- Validate duplicate order, internal/external URL và optional hierarchy.
- Public projection theo group và locale.

**Admin**

- Quản lý Header/Footer/Policy/CTA theo group.
- Bật/tắt, reorder, edit label cho `vi`/`en`, chọn internal link hoặc external URL.

**Acceptance**

- [ ] Public API chỉ trả active published item theo deterministic order.
- [ ] Invalid route/URL không publish được.
- [ ] Reorder không tạo trạng thái nửa chừng.

### Slice 3 — Catalog Product

**API**

- Tạo catalog models và relation từ Product instance.
- Migrate dữ liệu public hiện có theo script idempotent; không tự suy luận mapping không chắc chắn.
- CRUD/publish/spec/assets/category/SEO endpoints và public list/detail.
- Giữ backward compatibility cho endpoint Product instance trong thời gian migration.

**Admin**

- Tạo `/catalog-products` hoặc chuyển màn hình Products hiện tại chỉ sau khi terminology/route migration được chốt.
- Form quản lý translations, specs, gallery, warranty default, technology, recommended position, SEO và publication.
- Product instance form chọn catalog product thay vì lặp marketing data.

**Acceptance**

- [ ] Một catalog item có thể liên kết nhiều product instances.
- [ ] Public catalog không lộ serial, warranty code hoặc ownership.
- [ ] Specs/gallery giữ đúng order và asset roles.
- [ ] Existing activation/warranty flows không regression.

### Slice 4 — Dealer, Showroom Và Support Center

**API**

- Mở rộng entity/DTO/repository hiện có cho geo/opening hours/services/order.
- Thêm public dealer/location projection active-only.
- Validate latitude/longitude, phone và service codes.

**Admin**

- Mở rộng form/list hiện tại, có map coordinate inputs và reorder.
- Không gom Dealer với Service Center nếu nghiệp vụ/permission khác nhau.

**Acceptance**

- [ ] Inactive location không xuất hiện public.
- [ ] Geo data hợp lệ và API có thể filter province/type.
- [ ] Update location không ảnh hưởng warranty claim assignment.

### Slice 5 — Warranty Public Settings

**API**

- Persistence cho support config, duration rules và issue options.
- Rule resolver có precedence rõ: catalog product → category → default.
- Public projection không chứa lookup mock/customer data nhạy cảm.

**Admin**

- `/website-config/warranty` quản lý hotline/message/examples/policy link/rules/options.
- Form ngăn overlapping rule và tham chiếu entity không active.

**Acceptance**

- [ ] Resolver trả đúng duration cho product/category/default.
- [ ] Issue options active-only và ordered.
- [ ] Config không thay đổi warranty đã kích hoạt trừ khi có use case migration riêng.

### Slice 6 — Homepage Sections

**API**

- Typed section DTOs, relation validation, reorder và atomic publish.
- Public home response resolve catalog/asset references thành explicit DTO.

**Admin**

- `/website-config/home` quản lý section list và editor theo type.
- Chỉ hỗ trợ tập section đã định nghĩa; không có arbitrary component/CSS input.

**Acceptance**

- [ ] Payload sai discriminator/schema bị từ chối.
- [ ] Publish không để homepage tham chiếu asset/catalog item inactive.
- [ ] Preview API có thể trả draft cho Admin có quyền nhưng public API không thấy draft.

### Slice 7 — Content Pages Và Media Hardening

**API**

- Migration Content Page translations + SEO + publish version.
- Rich-text sanitization và asset reference protection.
- Bổ sung list/filter Asset API đủ cho picker nếu hiện tại còn thiếu.

**Admin**

- Locale editor, SEO fields, asset picker và publish status cho Content Pages.
- Media library/picker dùng lại upload service hiện có.

**Acceptance**

- [ ] Existing published page được migrate sang locale `vi`.
- [ ] Script/unsafe markup không được publish.
- [ ] Asset đang được dùng không thể bị xóa mà không có conflict rõ ràng.

### Slice 8 — Release Readiness

- Seed/import baseline content từ dữ liệu đang hardcode để môi trường mới không rỗng; chỉ đọc `apps/web` làm nguồn inventory, không sửa Web FE.
- Contract test cho toàn bộ public endpoints.
- Permission/audit/concurrency regression tests.
- OpenAPI examples và tài liệu handoff cho phase Web FE.
- Theo dõi cache/version và payload size.

**Acceptance**

- [ ] Fresh database có baseline draft hợp lệ.
- [ ] Public API chỉ có dữ liệu sau explicit publish.
- [ ] Có mapping inventory từ hardcoded source sang config entity.
- [ ] Web FE team có contract và sample response nhưng chưa có code integration.

## Thứ Tự Ưu Tiên

1. Slice 0 — Chốt boundary và foundation.
2. Slice 1 — Site Settings.
3. Slice 2 — Navigation.
4. Slice 3 — Catalog Product.
5. Slice 4 — Locations.
6. Slice 5 — Warranty Public Settings.
7. Slice 6 — Homepage.
8. Slice 7 — Content Pages/Media hardening.
9. Slice 8 — Release readiness.

Site Settings là tracer bullet để chứng minh trọn luồng migration → repository/use case → protected Admin API → Admin form → publish → public read API trước khi nhân rộng pattern.

## Test Strategy

### API

- Unit test use case bằng mocked repository cho draft, publish, reorder, locale fallback và rule resolution.
- Repository integration test cho transaction, version conflict, ordering và active/published filter.
- Controller/e2e test cho DTO validation, permission `403`, public data leakage và `404`.
- Migration/seed idempotency test cho catalog/content hiện có.

### Admin

- Service tests kiểm tra endpoint/method/payload.
- Schema/utils tests cho locale fields, URL, coordinates, typed section payload và error mapping.
- Component interaction tests cho save draft, publish confirm, reorder và stale version.
- Accessibility checks cho tab locale, form errors, sortable list và confirm dialog.

### Shared

- Type/contract tests cho discriminated unions và permission constants.
- Không copy API response types vào `apps/admin/src/views`.

## Verification Dự Kiến

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

## Rủi Ro Và Guardrails

- **Product domain conflation:** không triển khai catalog bằng cách tiếp tục nhồi marketing data vào Product instance.
- **Partial publish:** nhóm settings/navigation/home phải publish transactionally và versioned.
- **Unvalidated JSON:** mọi section payload phải qua schema theo type.
- **Broken references:** không publish record trỏ tới asset/category/catalog item inactive hoặc deleted.
- **Unsafe content/links:** sanitize rich text; validate URL scheme và internal route policy.
- **Translation drift:** publish validation phải kiểm tra locale bắt buộc.
- **Destructive migration:** migration catalog/content cần script idempotent, report unmapped records và có rollback strategy.
- **Overloaded Admin UI:** giữ feature screens theo domain; Website Config overview chỉ compose links/status.

## Definition Of Done Cho Phạm Vi Hiện Tại

Phạm vi API + Admin FE được xem là hoàn tất khi:

- Admin quản trị được tất cả nhóm đã chọn mà không sửa source code.
- Draft/publish/version/permission/audit hoạt động nhất quán.
- Public read APIs trả active published data theo locale bằng explicit DTO.
- Existing Product, Warranty, Dealer, Service Center và Content Page flows không regression.
- Shared contracts và OpenAPI đủ để bắt đầu ticket tích hợp Web FE riêng.
- Không có thay đổi nào trong `apps/web`.
