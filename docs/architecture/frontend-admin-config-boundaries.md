# Ranh giới cấu hình Admin cho Public Web

## Mục tiêu

Tài liệu này định nghĩa những phần dữ liệu/nội dung không nên hardcode trong giao diện `apps/web`, mà nên được quản lý từ Backend/Admin Setting hoặc CMS nội bộ.

Nguyên tắc chính:

- Frontend chịu trách nhiệm hiển thị, tương tác, responsive, animation và trải nghiệm người dùng.
- Backend/Admin chịu trách nhiệm dữ liệu vận hành, nội dung marketing, cấu hình business và nội dung có thể thay đổi.
- Không đưa mọi thứ lên Admin Setting. Chỉ đưa những gì business/admin có khả năng cần thay đổi mà không muốn deploy lại frontend.

## Những gì không nên hardcode ở Frontend

Frontend không nên hardcode các nhóm sau:

- Hotline, email, địa chỉ, tên công ty.
- Social links.
- Menu header/footer và thứ tự hiển thị nếu business thường đổi.
- Hero/banner/CTA content.
- Danh sách sản phẩm, thông số kỹ thuật, danh mục sản phẩm.
- Nội dung trang sản phẩm chi tiết.
- Danh sách đại lý, showroom, trạm bảo hành, tọa độ map.
- Nội dung chính sách, hướng dẫn, FAQ.
- Warranty support hotline, issue options, warranty duration rule.
- Gallery/dự án thực tế/khách hàng/images có thể thay đổi.
- Text hiển thị đa ngôn ngữ trong TSX.

Frontend chỉ nên giữ:

- Component structure.
- Layout, responsive, animation, interaction.
- UI tokens/classes.
- TypeScript types/interfaces.
- Route constants cốt lõi.
- Fallback UI/loading/error state.
- Validation logic cơ bản.
- Source policy tests.

## Nhóm cấu hình nên đưa vào Backend/Admin

### 1. Site Settings

Quản lý thông tin site-level dùng toàn trang.

Nên có:

- Company name.
- Logo header/footer.
- Email liên hệ.
- Hotline theo chi nhánh/khu vực.
- Địa chỉ trụ sở/chi nhánh.
- Social links: Facebook, Zalo, TikTok, YouTube.
- Footer legal/company info.
- SEO mặc định: title, description, OG image.

Không nên hardcode ở FE:

- Số hotline.
- Email.
- Company name.
- Địa chỉ văn phòng.
- Social URL.

Schema gợi ý:

```ts
type SiteSetting = {
  companyName: string;
  logoUrl: string;
  email: string;
  offices: Array<{
    id: string;
    label: string;
    address: string;
    phone?: string;
  }>;
  socialLinks: Array<{
    id: "facebook" | "zalo" | "tiktok" | "youtube";
    label: string;
    url: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  seo: {
    title: string;
    description: string;
    ogImageUrl?: string;
  };
};
```

### 2. Navigation Settings

Quản lý menu chính và footer navigation.

Nên có:

- Header nav items.
- Footer navigation groups.
- Policy links.
- CTA chính: tìm đại lý, tra cứu bảo hành, liên hệ.
- Active/inactive.
- Sort order.
- Locale-aware label.

Không nên hardcode:

- Label menu.
- Thứ tự menu nếu có thể thay đổi.
- Footer policy links.

Schema gợi ý:

```ts
type NavigationItem = {
  id: string;
  group: "header" | "footer" | "policy";
  label: string;
  href: string;
  isExternal: boolean;
  isActive: boolean;
  sortOrder: number;
};
```

### 3. Homepage Content

Trang chủ là khu vực marketing thay đổi thường xuyên, nên tách dần khỏi FE.

Nên quản lý:

- Hero slides.
- Featured products.
- Technology/intro sections.
- Gallery/dự án thực tế.
- Customer/project images.
- FAQ/quick help.
- CTA sections.

Không nên hardcode:

- Hero title/subtitle/button.
- Danh sách ảnh gallery.
- FAQ questions/answers.
- CTA label/link.
- Nội dung marketing section.

Schema gợi ý:

```ts
type HomeSection = {
  id: string;
  type: "hero" | "featuredProducts" | "technology" | "gallery" | "faq" | "cta";
  title?: string;
  description?: string;
  items?: unknown[];
  isActive: boolean;
  sortOrder: number;
};
```

### 4. Product Catalog

Đây là nhóm quan trọng nhất nên chuyển từ FE constants sang Backend/Admin.

Nên quản lý:

- Product category.
- Product code: SP50, SP10, B55, B15...
- Product slug.
- Product name.
- Product images/gallery.
- Product specs: VLT, UV, IR, TSER...
- Warranty years.
- Technology type.
- Recommended glass position.
- Product detail content.
- SEO metadata.
- Active/inactive.
- Sort order.

Không nên hardcode:

- Product list.
- Product specs.
- Product images.
- Product categories.
- Warranty years.
- Product detail copy.

Schema gợi ý:

```ts
type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
};

type Product = {
  id: string;
  categoryId: string;
  code: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description?: string;
  technologyType?: string;
  warrantyYears?: number;
  images: Array<{
    url: string;
    alt: string;
    sortOrder: number;
  }>;
  specs: Array<{
    key: string;
    label: string;
    value: string;
    unit?: string;
  }>;
  isActive: boolean;
  sortOrder: number;
};
```

### 5. Warranty Settings

Warranty flow không nên giữ nhiều mock/config trong FE.

Nên quản lý:

- Warranty lookup examples.
- Warranty support hotline.
- Warranty duration rules theo product/category.
- Warranty issue options.
- Warranty status labels.
- SLA/copy hỗ trợ.
- Policy links liên quan bảo hành.
- Activation/request/track form field config nếu sau này cần dynamic.

Không nên hardcode:

- Hotline bảo hành.
- Sample phone/plate/code.
- Issue options.
- Warranty year rules.
- Support message.
- Mock customer data.

Schema gợi ý:

```ts
type WarrantySetting = {
  supportPhone: string;
  lookupExamples: {
    phone?: string;
    carPlate?: string;
    warrantyCode?: string;
  };
  durationRules: Array<{
    productCode?: string;
    categorySlug?: string;
    warrantyYears: number;
  }>;
  issueOptions: Array<{
    id: string;
    label: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  supportMessage?: string;
};
```

### 6. Dealer / Showroom / Support Center Settings

Dealer data nên đến từ Backend để Admin có thể cập nhật địa chỉ, số điện thoại và tọa độ.

Nên quản lý:

- Dealer/showroom/support center list.
- Type: showroom, dealer, warranty center.
- Address.
- Phone.
- Province/city.
- Latitude/longitude.
- Opening hours.
- Services.
- Active/inactive.
- Sort order.

Không nên hardcode:

- Dealer list.
- Phone/address.
- Marker location.
- Service center labels.

Schema gợi ý:

```ts
type DealerLocation = {
  id: string;
  type: "showroom" | "dealer" | "warrantyCenter";
  name: string;
  address: string;
  phone?: string;
  province: string;
  latitude: number;
  longitude: number;
  openingHours?: string;
  services: string[];
  isActive: boolean;
  sortOrder: number;
};
```

Lưu ý về map:

- GeoJSON Việt Nam có thể vẫn là static asset nếu ít thay đổi.
- Label Hoàng Sa / Trường Sa có thể là config riêng nếu Admin cần quản lý copy.
- Marker/showroom data nên lấy từ Backend.

### 7. Policy / Guide / Static Content

Các trang chính sách và hướng dẫn nên được quản lý như CMS content hoặc structured content.

Nên quản lý:

- Chính sách bảo hành/đổi trả.
- Chính sách bảo mật.
- Chính sách mua hàng.
- Chính sách giao hàng.
- Chính sách thanh toán.
- Điều khoản chung.
- Hướng dẫn sử dụng/bảo hành.

Không nên hardcode:

- Nội dung policy dài trong TSX.
- Policy section list.
- Policy CTA/contact.

Schema gợi ý:

```ts
type ContentPage = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  sections: Array<{
    id: string;
    heading: string;
    body: string;
    sortOrder: number;
  }>;
  seo?: {
    title?: string;
    description?: string;
  };
  isActive: boolean;
};
```

### 8. Media / Asset Settings

Ảnh nên được quản lý qua media library hoặc storage/CDN.

Nên quản lý:

- Logo.
- Hero images.
- Product images.
- Gallery images.
- Customer/project images.
- Alt text theo locale.
- Image order.
- Active/inactive.

Không nên hardcode lâu dài:

- `/product/product_1.jpg`
- `/guest/guest_1.jpg`
- Hero/gallery asset list.

Schema gợi ý:

```ts
type MediaAsset = {
  id: string;
  url: string;
  alt: string;
  type: "logo" | "hero" | "product" | "gallery" | "customer" | "project";
  isActive: boolean;
  sortOrder: number;
};
```

## Quy tắc i18n cho Admin-managed Content

Nếu Admin cần quản lý nhiều ngôn ngữ, Backend nên thiết kế content theo locale.

Khuyến nghị:

- Mỗi text-bearing entity nên có translation records.
- Không để FE tự dịch bằng mapping hardcode.
- API nên trả content theo locale hiện tại, hoặc trả đủ translations nếu Admin UI cần chỉnh nhiều locale cùng lúc.

Mô hình gợi ý:

```txt
products
product_translations
categories
category_translations
content_pages
content_page_translations
site_settings
site_setting_translations
```

Ví dụ:

```ts
type TranslationRecord = {
  entityType: "product" | "category" | "contentPage" | "siteSetting";
  entityId: string;
  locale: "vi" | "en";
  fields: Record<string, string>;
};
```

## API contract gợi ý cho Frontend

Frontend nên có các endpoint đọc public config/content:

```txt
GET /public/site-settings?locale=vi
GET /public/navigation?locale=vi
GET /public/home?locale=vi
GET /public/products?locale=vi
GET /public/products/:slug?locale=vi
GET /public/dealers?locale=vi
GET /public/warranty-settings?locale=vi
GET /public/content-pages/:slug?locale=vi
```

Yêu cầu chung:

- Public API chỉ trả dữ liệu `isActive = true`.
- Admin API cho phép CRUD và preview inactive/draft content.
- Response nên có `updatedAt` hoặc `version` để FE cache/invalidate.
- FE nên có fallback UI khi API lỗi, nhưng không nên fallback bằng nội dung business hardcode dài hạn.

## Thứ tự ưu tiên triển khai

### Ưu tiên 1: Site Settings

Lý do:

- Ít phụ thuộc domain.
- Dễ triển khai.
- Giảm hardcode hotline/email/company/social ngay lập tức.

Bao gồm:

- Company info.
- Hotline.
- Email.
- Social links.
- Footer info.

### Ưu tiên 2: Product Catalog

Lý do:

- Product/spec/category là dữ liệu business cốt lõi.
- Hiện dễ thay đổi khi thêm dòng sản phẩm mới.
- Admin cần tự quản lý lâu dài.

Bao gồm:

- Category.
- Product.
- Specs.
- Images.
- Warranty years.

### Ưu tiên 3: Dealer / Showroom / Support Center

Lý do:

- Địa chỉ/tọa độ/số điện thoại thay đổi theo vận hành.
- FE không nên deploy lại chỉ để sửa địa điểm.

Bao gồm:

- Dealer list.
- Location.
- Services.
- Opening hours.

### Ưu tiên 4: Warranty Settings

Lý do:

- Warranty duration, issue options, hotline hỗ trợ có thể thay đổi.
- Cần đồng bộ với logic BE.

Bao gồm:

- Duration rules.
- Issue options.
- Lookup examples.
- Support phone/message.

### Ưu tiên 5: Homepage CMS Sections

Lý do:

- Marketing content thay đổi thường xuyên.
- Cần Admin tự thay hero, gallery, FAQ, CTA.

Bao gồm:

- Hero slides.
- Gallery.
- FAQ.
- Featured products.
- CTA.

### Ưu tiên 6: Policy / Guide Pages

Lý do:

- Nội dung dài, cần quản lý phiên bản và chỉnh sửa không deploy.

Bao gồm:

- Policy pages.
- Guide pages.
- Terms.

## Migration Checklist cho Frontend

Khi Backend/Admin Setting sẵn sàng, Frontend nên migrate theo checklist:

- [ ] Thay constants hardcode bằng service/query function.
- [ ] Giữ type/interface ở FE hoặc shared package.
- [ ] Thêm loading/empty/error state cho từng nhóm content.
- [ ] Không gọi API trực tiếp trong component sâu nếu đã có service.
- [ ] Message/copy từ API phải theo locale hiện tại.
- [ ] Không lưu text tiếng Việt trong TSX.
- [ ] Không đưa business content vào `src/constants` nếu Admin đã quản lý.
- [ ] Viết regression/source-policy test nếu nhóm content từng gây lỗi hardcode.

## Ranh giới cuối cùng

Nên đưa lên Admin:

- Content.
- Business data.
- Contact/config.
- Product catalog.
- Dealer locations.
- Warranty rules.
- Policy/guide copy.

Không nên đưa lên Admin:

- CSS class.
- Layout implementation.
- Animation implementation.
- Component behavior.
- Route architecture.
- Validation kỹ thuật cơ bản.
- Source policy tests.

Tóm lại: Admin quản lý **nội dung và dữ liệu vận hành**; Frontend quản lý **cách hiển thị và trải nghiệm**.
