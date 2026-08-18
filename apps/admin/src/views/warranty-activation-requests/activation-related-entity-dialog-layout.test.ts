import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dialogUrls = [
  new URL(
    "../customers/components/create-customer-dialog.tsx",
    import.meta.url,
  ),
  new URL("../dealers/components/create-dealer-dialog.tsx", import.meta.url),
];
const customerFormUrl = new URL(
  "../customers/components/customer-form.tsx",
  import.meta.url,
);
const dealerFormUrl = new URL(
  "../dealers/components/dealer-form.tsx",
  import.meta.url,
);

test("related entity forms use full-screen dialogs on mobile only", async () => {
  for (const dialogUrl of dialogUrls) {
    const source = await readFile(dialogUrl, "utf8");

    assert.match(source, /h-dvh max-h-dvh w-screen max-w-none/);
    assert.match(
      source,
      /sm:h-fit sm:max-h-\[calc\(100dvh-2rem\)\] sm:w-\[min\(calc\(100vw-2rem\),56rem\)\][^"\n]+sm:rounded-lg/,
    );
  }
});

test("full-screen related entity dialogs provide a mobile close action", async () => {
  for (const dialogUrl of dialogUrls) {
    const source = await readFile(dialogUrl, "utf8");

    assert.match(source, /<DialogClose asChild>/);
    assert.match(source, /className="absolute right-4 top-4 z-10 sm:hidden"/);
  }
});

test("related entity dialogs scroll only the mobile form body", async () => {
  for (const dialogUrl of dialogUrls) {
    const source = await readFile(dialogUrl, "utf8");

    assert.match(source, /flex h-dvh max-h-dvh[^"\n]+flex-col overflow-hidden/);
    assert.match(source, /<header className="shrink-0/);
    assert.match(
      source,
      /<div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:overflow-visible sm:p-0">/,
    );
  }
});

test("embedded related entity actions remain visible on mobile", async () => {
  const customerForm = await readFile(customerFormUrl, "utf8");
  const dealerForm = await readFile(dealerFormUrl, "utf8");

  for (const source of [customerForm, dealerForm]) {
    assert.match(source, /space-y-[56] pb-24 sm:pb-0/);
    assert.match(source, /fixed inset-x-0 bottom-0/);
    assert.match(source, /sm:static/);
  }
});

test("related entity create actions fill the mobile dialog width", async () => {
  const customerForm = await readFile(customerFormUrl, "utf8");
  const dealerForm = await readFile(dealerFormUrl, "utf8");

  assert.match(
    customerForm,
    /className=\{\s*embedded\s+\? "col-span-2 w-full sm:w-auto"\s+: "w-full sm:w-auto"\s+\}/,
  );
  assert.match(
    dealerForm,
    /embedded\s+\? "fixed inset-x-0 bottom-0[^"\n]+sm:flex sm:justify-end[^"\n]+"/,
  );
  assert.match(
    dealerForm,
    /embedded\s+\? "hidden sm:inline-flex"\s+: "w-full sm:w-auto"/,
  );
});
