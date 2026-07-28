import assert from "node:assert/strict";
import test from "node:test";
import {
  getActiveWebsiteOffices,
  getPrimaryWebsiteHotline,
} from "./site-settings.utils.ts";

const offices = [
  {
    address: "Văn phòng đứng sau",
    id: "office-later",
    isActive: true,
    isHeadquarters: false,
    label: "Văn phòng 2",
    phone: "0989 017 999",
    sortOrder: 20,
  },
  {
    address: "Văn phòng chính",
    id: "office-primary",
    isActive: true,
    isHeadquarters: false,
    label: "Văn phòng 1",
    phone: "0886 33 77 33",
    sortOrder: 10,
  },
  {
    address: "Văn phòng đã tắt",
    id: "office-inactive",
    isActive: false,
    isHeadquarters: false,
    label: "Văn phòng ẩn",
    phone: "1800 123 456",
    sortOrder: 0,
  },
];

test("returns active offices ordered by configured sort order", () => {
  assert.deepEqual(
    getActiveWebsiteOffices({ offices }).map((office) => office.id),
    ["office-primary", "office-later"],
  );
});

test("uses the first active configured office with a phone as hotline", () => {
  assert.deepEqual(getPrimaryWebsiteHotline({ offices }), {
    displayValue: "0886 33 77 33",
    href: "tel:0886337733",
    officeId: "office-primary",
  });
});

test("prioritizes the configured headquarters over office sort order", () => {
  const configuredOffices = offices.map((office) => ({
    ...office,
    isHeadquarters: office.id === "office-later",
  }));

  assert.deepEqual(getPrimaryWebsiteHotline({ offices: configuredOffices }), {
    displayValue: "0989 017 999",
    href: "tel:0989017999",
    officeId: "office-later",
  });
});

test("does not invent a fallback hotline when config is unavailable", () => {
  assert.equal(getPrimaryWebsiteHotline(null), null);
  assert.equal(
    getPrimaryWebsiteHotline({
      offices: offices.map((office) => ({ ...office, phone: null })),
    }),
    null,
  );
});
