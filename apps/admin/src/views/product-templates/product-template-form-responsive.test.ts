import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const formUrl = new URL(
  "./components/product-template-form.tsx",
  import.meta.url,
);
const imageUploadUrl = new URL(
  "../../components/common/image-upload.tsx",
  import.meta.url,
);
const detailViewUrl = new URL(
  "./product-template-detail.view.tsx",
  import.meta.url,
);

test("product template dynamic media cannot widen the mobile form", async () => {
  const [form, imageUpload] = await Promise.all([
    readFile(formUrl, "utf8"),
    readFile(imageUploadUrl, "utf8"),
  ]);

  assert.match(form, /className="min-w-0 space-y-2"/);
  assert.match(imageUpload, /w-full min-w-0 max-w-full space-y-3/);
  assert.match(
    imageUpload,
    /w-full min-w-0 max-w-full overflow-hidden rounded-md/,
  );
  assert.match(
    imageUpload,
    /flex min-w-0 flex-col items-stretch gap-2 border-t/,
  );
  assert.match(imageUpload, /className="w-full sm:w-auto sm:self-start"/);
});

test("product template add actions fill mobile width only", async () => {
  const form = await readFile(formUrl, "utf8");
  const responsiveActions =
    form.match(/className="w-full sm:w-auto"/g)?.length ?? 0;

  assert.equal(responsiveActions, 4);
});

test("product template detail actions fill mobile width only", async () => {
  const detailView = await readFile(detailViewUrl, "utf8");

  assert.match(
    detailView,
    /className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end"/,
  );
  assert.equal(
    detailView.match(/<Button\s+asChild\s+className="w-full sm:w-auto"/g)
      ?.length ?? 0,
    1,
  );
});
