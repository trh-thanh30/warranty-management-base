import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import { WarrantiesService } from "../src/services/warranties/warranties.service.ts";
import { getWarrantyLookupErrorKind } from "../src/hooks/use-warranty-lookup.ts";
import {
  formatWarrantyDealerAddress,
  getPopulatedWarrantyFilmItems,
} from "../src/utils/warranty-lookup.utils.ts";

test("dealer address does not repeat locality already in the full address", () => {
  assert.equal(
    formatWarrantyDealerAddress({
      address: "Phường Ba Đình, Thành phố Hà Nội",
      district: "Phường Ba Đình",
      province: "Thành phố Hà Nội",
    }),
    "Phường Ba Đình, Thành phố Hà Nội",
  );
  assert.equal(
    formatWarrantyDealerAddress({
      address: "62 Nghĩa Đô",
      district: "Cầu Giấy",
      province: "Hà Nội",
    }),
    "62 Nghĩa Đô, Cầu Giấy, Hà Nội",
  );
  assert.equal(formatWarrantyDealerAddress(null), null);
});

test("lookup displays activation code instead of product serial", async () => {
  const source = await readFile(
    new URL("../src/components/warranty-lookup-result.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /label=\{t\("activationCode"\)\}/);
  assert.match(source, /value=\{warranty.activationCode\}/);
  assert.doesNotMatch(source, /label=\{t\("serial"\)\}/);
});

const lookupResult = {
  product: {
    id: "product-1",
    name: "Lexzenz SP50",
    brand: "Lexzenz",
    model: "SP50",
    serialNumber: "SERIAL-001",
    warrantyCode: "WM-2026-ABCDEF",
    productCode: "LEX-SP50-001",
    displayName: "Lexzenz SP50",
    category: {
      id: "category-1",
      name: "Window film",
      slug: "window-film",
    },
  },
  warranty: {
    warrantyCode: "WM-2026-ABCDEF",
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2031-01-01T00:00:00.000Z",
    durationMonths: 60,
    terms: "Official warranty terms",
    status: "ACTIVE",
  },
  installation: {
    installedAt: "2026-01-01T00:00:00.000Z",
    vehicleModel: "Toyota Camry",
    dealer: {
      id: "dealer-1",
      name: "FUJITEK Hanoi",
      phone: "19009169",
      address: "62 Nghia Do",
      province: "Hanoi",
      district: null,
    },
    filmItems: {
      windshield: "B55",
      frontLeftSide: "B15",
    },
  },
};

test("warranty service normalizes the code and calls the public lookup API", async () => {
  const calls = [];
  const signal = new AbortController().signal;
  const service = new WarrantiesService({
    async get(url, config) {
      calls.push({ config, url });
      return { data: lookupResult };
    },
  });

  const result = await service.lookupWarranty("  wm-2026-abcdef  ", signal);

  assert.deepEqual(result, lookupResult);
  assert.deepEqual(calls, [
    {
      url: "/public/warranties/lookup",
      config: {
        params: { code: "WM-2026-ABCDEF" },
        signal,
      },
    },
  ]);
});

test("warranty lookup errors distinguish invalid, missing, and rate-limited requests", () => {
  assert.equal(
    getWarrantyLookupErrorKind(
      new HttpClientError({
        isNetworkError: false,
        message: "Warranty not found",
        status: 404,
      }),
    ),
    "notFound",
  );
  assert.equal(
    getWarrantyLookupErrorKind(
      new HttpClientError({
        isNetworkError: false,
        message: "Validation failed",
        status: 400,
      }),
    ),
    "invalid",
  );
  assert.equal(
    getWarrantyLookupErrorKind(
      new HttpClientError({
        isNetworkError: false,
        message: "Too many requests",
        status: 429,
      }),
    ),
    "rateLimit",
  );
  assert.equal(
    getWarrantyLookupErrorKind(new Error("Network failed")),
    "request",
  );
});

test("warranty lookup rate-limit messages exist in every entry point and locale", async () => {
  const [viSource, enSource] = await Promise.all([
    readFile(new URL("../src/messages/vi.json", import.meta.url), "utf8"),
    readFile(new URL("../src/messages/en.json", import.meta.url), "utf8"),
  ]);

  for (const source of [viSource, enSource]) {
    const messages = JSON.parse(source);

    assert.equal(
      typeof messages.WarrantyLookupModal.errors.rateLimit,
      "string",
    );
    assert.equal(typeof messages.Warranty.lookup.errors.rateLimit, "string");
  }
});

test("warranty film rows only include populated installation positions", () => {
  assert.deepEqual(
    getPopulatedWarrantyFilmItems({
      windshield: " B55 ",
      frontLeftSide: "B15",
      sunroof: "",
    }),
    [
      { key: "windshield", value: "B55" },
      { key: "frontLeftSide", value: "B15" },
    ],
  );
  assert.deepEqual(getPopulatedWarrantyFilmItems(null), []);
});

test("warranty page and modal share API lookup state without mock fallback", async () => {
  const [hookSource, pageSource, modalSource, resultSource] = await Promise.all(
    [
      readFile(
        new URL("../src/hooks/use-warranty-lookup.ts", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../src/views/warranty/lookup.view.tsx", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../src/components/warranty-lookup-modal.tsx", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL(
          "../src/components/warranty-lookup-result.tsx",
          import.meta.url,
        ),
        "utf8",
      ),
    ],
  );

  assert.match(hookSource, /useMutation/);
  assert.match(hookSource, /warrantiesService\.lookupWarranty/);
  assert.match(pageSource, /useWarrantyLookup/);
  assert.match(modalSource, /useWarrantyLookup/);
  assert.match(resultSource, /product\.category/);
  assert.match(resultSource, /warranty\.durationMonths/);
  assert.match(resultSource, /warranty\.terms/);
  assert.match(resultSource, /installation\?\.dealer/);
  assert.match(resultSource, /getPopulatedWarrantyFilmItems/);
  assert.doesNotMatch(pageSource, /demoWarrantyLookupRecord|mock\./);
  assert.doesNotMatch(modalSource, /demoWarrantyLookupRecord|mock\./);
});

test("warranty support hotline comes from public site settings", async () => {
  const [pageSource, modalSource] = await Promise.all([
    readFile(
      new URL("../src/views/warranty/lookup.view.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/warranty-lookup-modal.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  for (const source of [pageSource, modalSource]) {
    assert.match(source, /usePrimaryWebsiteHotline/);
    assert.match(source, /hotline &&/);
    assert.doesNotMatch(source, /warrantyLookupSupportPhone/);
  }
});

test("warranty support hotline actions use the shared medium radius", async () => {
  const [pageSource, modalSource] = await Promise.all([
    readFile(
      new URL("../src/views/warranty/lookup.view.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/warranty-lookup-modal.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  for (const source of [pageSource, modalSource]) {
    assert.match(
      source,
      /href=\{hotline\.href\}[\s\S]*?className="[^"]*rounded-md[^"]*"/,
    );
  }
});
