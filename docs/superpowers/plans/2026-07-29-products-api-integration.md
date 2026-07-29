# Products API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Web product catalog mock data with public Product and Product Category APIs while preserving the current search, filters, sorting, pagination, grid/list UI, and honest empty/error states.

**Architecture:** `ProductsService` owns the public product HTTP contract. A feature-local `useProductsCatalog` hook owns TanStack Query state and query keys. `ProductsView` owns user interaction and renders API DTOs directly; it never imports product mock constants. Missing product data produces an empty state, request failures produce an error state, and only a real product with no usable cover image receives a neutral image placeholder.

**Tech Stack:** Next.js 16, React 19, TypeScript, TanStack Query, next-intl, shared HTTP client, Tailwind CSS, Lucide React.

## Global Constraints

- `GET /api/v1/public/products` is the only product-list data source.
- `GET /api/v1/public/product-categories` is the only category data source.
- Never render mock products or mock categories after an API failure or empty response.
- An empty successful product response renders “Chưa có sản phẩm”.
- A failed product request renders an error state and retry action.
- A missing or failed cover image renders a neutral placeholder for that real product.
- Keep the current page size at `6`.
- Map sort options exactly: newest → `publishedAt/desc`, A-Z → `name/asc`, Z-A → `name/desc`.
- Keep `page.tsx` thin and all client state inside `src/views/products`.
- Do not add another HTTP adapter or use `as unknown as`.
- Do not change the backend contract in this implementation slice.

---

## File Structure

- Create `apps/web/src/services/products/products.service.ts`: typed public Product HTTP calls.
- Create `apps/web/src/views/products/products.utils.ts`: pure UI-state-to-API-query mapping.
- Create `apps/web/src/views/products/use-products-catalog.ts`: product/category TanStack Query orchestration.
- Create `apps/web/src/views/products/components/product-cover-image.tsx`: API cover rendering and neutral fallback.
- Modify `apps/web/src/services/product-categories/product-categories.service.ts`: accept request cancellation signal.
- Modify `apps/web/src/views/products/products.view.tsx`: replace mock filtering/pagination with query results.
- Modify `apps/web/src/messages/vi.json`: loading/error/empty/image copy.
- Modify `apps/web/src/messages/en.json`: matching English copy.
- Create `apps/web/tests/products-service.test.mjs`: service contract regression tests.
- Create `apps/web/tests/products-query-mapping.test.mjs`: sort/filter/pagination query tests.
- Modify `apps/web/tests/products-contact-pricing.test.mjs`: assert no product mock imports.
- Create `apps/web/tests/products-api-view.test.mjs`: loading/error/empty and API DTO rendering policy.

---

### Task 1: Typed Products Service

**Files:**

- Create: `apps/web/src/services/products/products.service.ts`
- Modify: `apps/web/src/services/product-categories/product-categories.service.ts`
- Test: `apps/web/tests/products-service.test.mjs`

**Interfaces:**

- Consumes: `HttpClient`, `ApiResponse`, `ListPublicProductsQuery`, `PaginatedResponse`, `PublicProductSummary` from `@repo/shared`.
- Produces: `ProductsService.listProducts(query, signal?)`.
- Produces: `ProductCategoriesService.listProductCategories(query, signal?)`.

- [ ] **Step 1: Write the failing service contract tests**

```js
test("products service sends filters and abort signal to the public endpoint", async () => {
  const calls = [];
  const payload = { items: [], meta: emptyMeta };
  const service = new ProductsService({
    get: async (url, config) => {
      calls.push({ url, config });
      return { data: payload };
    },
  });
  const signal = new AbortController().signal;
  const query = {
    page: 2,
    limit: 6,
    search: "camera",
    categoryId: "category-id",
    sortBy: "name",
    sortOrder: "asc",
  };

  assert.deepEqual(await service.listProducts(query, signal), payload);
  assert.deepEqual(calls, [
    {
      url: "/public/products",
      config: { params: query, signal },
    },
  ]);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm --filter @repo/web exec tsx --test tests/products-service.test.mjs
```

Expected: FAIL because `ProductsService` does not exist.

- [ ] **Step 3: Implement the typed service**

```ts
export class ProductsService {
  constructor(private readonly http: Pick<HttpClient, "get">) {}

  async listProducts(
    query: ListPublicProductsQuery,
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<PublicProductSummary>> {
    const response = await this.http.get<
      ApiResponse<PaginatedResponse<PublicProductSummary>>
    >("/public/products", { params: query, signal });

    return response.data;
  }
}

export const productsService = new ProductsService(publicHttpClient);
```

Update `listProductCategories` to accept `signal?: AbortSignal` and pass `{ params: query, signal }`.

- [ ] **Step 4: Run the service tests and verify GREEN**

Run:

```bash
pnpm --filter @repo/web exec tsx --test tests/products-service.test.mjs
```

Expected: PASS.

---

### Task 2: Query Mapping and Catalog Hook

**Files:**

- Create: `apps/web/src/views/products/products.utils.ts`
- Create: `apps/web/src/views/products/use-products-catalog.ts`
- Test: `apps/web/tests/products-query-mapping.test.mjs`

**Interfaces:**

- Produces: `ProductSortOption = "newest" | "name-asc" | "name-desc"`.
- Produces: `buildPublicProductsQuery(input): ListPublicProductsQuery`.
- Produces: `useProductsCatalog(query)` returning product/category data and independent retry states.

- [ ] **Step 1: Write failing query mapping tests**

```js
assert.deepEqual(
  buildPublicProductsQuery({
    page: 3,
    limit: 6,
    search: " camera ",
    categoryId: "all",
    sort: "newest",
  }),
  {
    page: 3,
    limit: 6,
    search: "camera",
    sortBy: "publishedAt",
    sortOrder: "desc",
  },
);

assert.deepEqual(
  buildPublicProductsQuery({
    page: 1,
    limit: 6,
    search: "",
    categoryId: "category-id",
    sort: "name-desc",
  }),
  {
    page: 1,
    limit: 6,
    categoryId: "category-id",
    sortBy: "name",
    sortOrder: "desc",
  },
);
```

- [ ] **Step 2: Run mapping tests and verify RED**

Run:

```bash
pnpm --filter @repo/web exec tsx --test tests/products-query-mapping.test.mjs
```

Expected: FAIL because the mapper does not exist.

- [ ] **Step 3: Implement the pure mapper**

```ts
export function buildPublicProductsQuery(
  input: ProductsCatalogQueryInput,
): ListPublicProductsQuery {
  const search = input.search.trim();
  const nameSort = input.sort === "name-asc" || input.sort === "name-desc";

  return {
    page: input.page,
    limit: input.limit,
    search: search || undefined,
    categoryId:
      input.categoryId === ALL_PRODUCT_CATEGORIES
        ? undefined
        : input.categoryId,
    sortBy: nameSort ? "name" : "publishedAt",
    sortOrder:
      input.sort === "name-asc"
        ? "asc"
        : input.sort === "name-desc"
          ? "desc"
          : "desc",
  };
}
```

- [ ] **Step 4: Implement `useProductsCatalog`**

Use two independent `useQuery` calls:

```ts
const productsQuery = useQuery({
  queryKey: ["public-products", query],
  queryFn: ({ signal }) => productsService.listProducts(query, signal),
});

const categoriesQuery = useQuery({
  queryKey: ["public-product-categories", "catalog-filter"],
  queryFn: ({ signal }) =>
    productCategoriesService.listProductCategories(
      { page: 1, limit: 100 },
      signal,
    ),
  staleTime: 5 * 60 * 1000,
});
```

Do not use mock `initialData`, mock `placeholderData`, or catch failures into an empty successful result.

- [ ] **Step 5: Run mapping tests and verify GREEN**

Run:

```bash
pnpm --filter @repo/web exec tsx --test tests/products-query-mapping.test.mjs
```

Expected: PASS.

---

### Task 3: Product Cover With Honest Placeholder

**Files:**

- Create: `apps/web/src/views/products/components/product-cover-image.tsx`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`
- Test: `apps/web/tests/products-api-view.test.mjs`

**Interfaces:**

- Consumes: `src: string | null`, `alt: string`, `sizes: string`, `className?: string`.
- Produces: `ProductCoverImage`.

- [ ] **Step 1: Write the failing placeholder policy test**

Assert the component:

```js
assert.match(source, /if \(!src \|\| hasError\)/);
assert.match(source, /ImageOff/);
assert.match(source, /onError=\{\(\) => setHasError\(true\)\}/);
assert.doesNotMatch(source, /feat1\.jpg|product_1\.jpg|PRODUCT_META/);
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm --filter @repo/web exec tsx --test tests/products-api-view.test.mjs
```

Expected: FAIL because `ProductCoverImage` does not exist.

- [ ] **Step 3: Implement the component**

Render a neutral `bg-surface-muted` placeholder with Lucide `ImageOff` and translated “Chưa có hình ảnh” when `src` is null or the real image emits `onError`. Reset the error state when `src` changes. Never select another product image.

- [ ] **Step 4: Add translations**

```json
"imageUnavailable": "Chưa có hình ảnh"
```

```json
"imageUnavailable": "Image unavailable"
```

- [ ] **Step 5: Run the placeholder test and verify GREEN**

Run:

```bash
pnpm --filter @repo/web exec tsx --test tests/products-api-view.test.mjs
```

Expected: PASS.

---

### Task 4: Replace Mock Catalog Rendering

**Files:**

- Modify: `apps/web/src/views/products/products.view.tsx`
- Modify: `apps/web/src/views/products/products.constants.ts`
- Modify: `apps/web/src/views/products/products.types.ts`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`
- Modify: `apps/web/tests/products-contact-pricing.test.mjs`
- Modify: `apps/web/tests/products-api-view.test.mjs`

**Interfaces:**

- Consumes: `PublicProductSummary`, `PublicProductCategory`, `PaginationMeta`.
- Removes: `expandedProductsCatalog`, `catalogCategories`, `CatalogCategory`, and translated mock item keys from the listing.

- [ ] **Step 1: Write failing view-policy tests**

```js
assert.doesNotMatch(source, /expandedProductsCatalog|catalogCategories/);
assert.doesNotMatch(source, /catalog\.items\./);
assert.match(source, /useProductsCatalog/);
assert.match(source, /product\.name/);
assert.match(source, /product\.category\?\.name/);
assert.match(source, /product\.specifications/);
assert.match(source, /product\.coverImageUrl/);
```

- [ ] **Step 2: Run view tests and verify RED**

Run:

```bash
pnpm --filter @repo/web exec tsx --test tests/products-api-view.test.mjs tests/products-contact-pricing.test.mjs
```

Expected: FAIL because the view still imports mock catalog data.

- [ ] **Step 3: Replace local data transformations**

Keep only interaction state:

```ts
const [activeCategoryId, setActiveCategoryId] = useState(
  ALL_PRODUCT_CATEGORIES,
);
const [searchQuery, setSearchQuery] = useState("");
const [sortBy, setSortBy] = useState<ProductSortOption>("newest");
const [currentPage, setCurrentPage] = useState(1);
```

Build the API query from debounced search and call `useProductsCatalog`. Use:

- `productsQuery.data?.items ?? []` for rendering.
- `productsQuery.data?.meta.total ?? 0` for count.
- `productsQuery.data?.meta.totalPages ?? 1` for pagination.
- `category.productCount` for category counts.
- `product.name`, `product.category?.name`, `product.specifications.slice(0, 3)`, `product.coverImageUrl`, and `product.slug`.

- [ ] **Step 4: Preserve filter and pagination behavior**

Reset to page `1` when debounced search, category, or sort changes. Use the API meta for pagination. Keep Lenis scroll-to-results behavior after page changes.

- [ ] **Step 5: Remove obsolete mock exports**

Delete `expandedProductsCatalog` and category mock exports from `products.constants.ts`. Remove `CatalogCategory` aliases no longer used by the Products listing. Do not delete shared mock catalog files yet because `ProductDetailView` still imports them.

- [ ] **Step 6: Run view tests and verify GREEN**

Run:

```bash
pnpm --filter @repo/web exec tsx --test tests/products-api-view.test.mjs tests/products-contact-pricing.test.mjs tests/products-search.test.mjs tests/products-pagination.test.mjs tests/products-view-mode.test.mjs
```

Expected: PASS.

---

### Task 5: Loading, Error, Category Error, and Empty States

**Files:**

- Modify: `apps/web/src/views/products/products.view.tsx`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`
- Modify: `apps/web/tests/products-api-view.test.mjs`

**Interfaces:**

- Consumes: independent Products and Categories query states from `useProductsCatalog`.
- Produces: explicit user-visible states without mock fallback.

- [ ] **Step 1: Write failing state tests**

Assert source contains separate branches for:

```js
assert.match(source, /productsQuery\.isPending/);
assert.match(source, /productsQuery\.isError/);
assert.match(source, /productsQuery\.refetch/);
assert.match(source, /categoriesQuery\.isError/);
assert.match(source, /catalog\.noProductsTitle/);
assert.match(source, /catalog\.loadErrorTitle/);
```

- [ ] **Step 2: Run state tests and verify RED**

Run:

```bash
pnpm --filter @repo/web exec tsx --test tests/products-api-view.test.mjs
```

Expected: FAIL because API states are not rendered yet.

- [ ] **Step 3: Implement product loading and error states**

- Initial loading: render six shape-stable card skeletons.
- Error: render `loadErrorTitle`, `loadErrorDesc`, and a retry `Button`.
- Do not convert errors to `items: []`.

- [ ] **Step 4: Implement honest empty states**

- No active search/category and `items.length === 0`: `noProductsTitle = "Chưa có sản phẩm"`.
- Search or category active and `items.length === 0`: retain “Không tìm thấy sản phẩm”.
- Clear-filter action resets search and category only for filtered empty results.

- [ ] **Step 5: Implement category loading/error behavior**

Always render the synthetic “Tất cả” filter. While loading, show compact category skeleton rows. On failure, show a category-specific error and retry action; never restore hardcoded category names.

- [ ] **Step 6: Add translations and verify GREEN**

Add matching Vietnamese/English keys for:

- `loadingProducts`
- `loadErrorTitle`
- `loadErrorDesc`
- `retry`
- `noProductsTitle`
- `noProductsDesc`
- `categoryLoadError`
- `imageUnavailable`

Run:

```bash
pnpm --filter @repo/web exec tsx --test tests/products-api-view.test.mjs
```

Expected: PASS.

---

### Task 6: Prevent Incorrect Product Detail Fallback

**Files:**

- Modify: `apps/web/src/views/products/products.view.tsx`
- Test: `apps/web/tests/products-api-view.test.mjs`

**Context:** The backend currently exposes only `GET /public/products`; it does not expose a public product detail endpoint. The current `ProductDetailView` uses mock data and falls back to a default film product for unknown slugs. Linking a real API product to that route can display the wrong product.

- [ ] **Step 1: Write the failing navigation policy test**

Assert that the API-backed card does not send an arbitrary real API slug into the mock detail fallback:

```js
assert.doesNotMatch(source, /APP_ROUTES\.product\(product\.slug\)/);
```

- [ ] **Step 2: Run the test and verify RED**

Expected: FAIL while the detail link still targets the mock detail route.

- [ ] **Step 3: Apply the safe listing-only behavior**

Remove the `Xem chi tiết` link from API-backed cards in this slice and let the prominent `Liên hệ` CTA occupy the action area. Do not fake a detail page from list data and do not map API products back to mock products.

- [ ] **Step 4: Run the navigation policy test and verify GREEN**

Expected: PASS.

Create a separate follow-up for `GET /public/products/:slug` plus the API-backed Product Detail page.

---

### Task 7: Verification

**Files:**

- Verify all modified files.

- [ ] **Step 1: Run focused Products tests**

```bash
pnpm --filter @repo/web exec tsx --test tests/products-service.test.mjs tests/products-query-mapping.test.mjs tests/products-api-view.test.mjs tests/products-contact-pricing.test.mjs tests/products-search.test.mjs tests/products-pagination.test.mjs tests/products-view-mode.test.mjs
```

Expected: all focused tests pass.

- [ ] **Step 2: Run Web lint**

```bash
pnpm --filter @repo/web lint
```

Expected: exit code `0`.

- [ ] **Step 3: Run Web typecheck**

```bash
pnpm --filter @repo/web check-types
```

Expected: exit code `0`. If the known unrelated missing `packages/ui` dependencies remain, report the exact blocking modules and do not claim typecheck passed.

- [ ] **Step 4: Run Web tests**

```bash
pnpm --filter @repo/web test
```

Expected: exit code `0`, or explicitly report pre-existing unrelated failures with file/test names.

- [ ] **Step 5: Validate the diff**

```bash
git diff --check
git diff -- apps/web/src/services/products apps/web/src/services/product-categories apps/web/src/views/products apps/web/src/messages apps/web/tests
```

Confirm:

- No mock product/category import remains in `ProductsView`.
- No fallback product list exists.
- No API error is converted into an empty successful response.
- No generated `apps/web/next-env.d.ts` change remains.
