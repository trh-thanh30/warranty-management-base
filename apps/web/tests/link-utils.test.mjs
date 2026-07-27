import assert from "node:assert/strict";
import test from "node:test";
import {
  displayWebsite,
  normalizeExternalUrl,
  toTelephoneHref,
} from "../src/utils/link.utils.ts";

test("toTelephoneHref keeps only dialable digits and the country prefix", () => {
  assert.equal(toTelephoneHref("0886 33 77 33"), "0886337733");
  assert.equal(toTelephoneHref("+84 (886) 33-77-33"), "+84886337733");
});

test("normalizeExternalUrl accepts HTTP websites and supplies HTTPS", () => {
  assert.equal(
    normalizeExternalUrl("fujitekvietnam.com"),
    "https://fujitekvietnam.com/",
  );
  assert.equal(
    normalizeExternalUrl(" http://fujitekvietnam.com/contact "),
    "http://fujitekvietnam.com/contact",
  );
});

test("normalizeExternalUrl rejects empty, malformed, and unsafe protocols", () => {
  assert.equal(normalizeExternalUrl(), null);
  assert.equal(normalizeExternalUrl("   "), null);
  assert.equal(normalizeExternalUrl("not a website"), null);
  assert.equal(normalizeExternalUrl("javascript://alert(1)"), null);
  assert.equal(normalizeExternalUrl("ftp://fujitekvietnam.com"), null);
});

test("displayWebsite removes the HTTP protocol and trailing slash", () => {
  assert.equal(
    displayWebsite(" https://fujitekvietnam.com/ "),
    "fujitekvietnam.com",
  );
  assert.equal(
    displayWebsite("http://fujitekvietnam.com/contact/"),
    "fujitekvietnam.com/contact",
  );
});
