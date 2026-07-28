import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");
const contactViewPath = path.join(
  webRoot,
  "src",
  "views",
  "contact",
  "contact.view.tsx",
);
const contactPagePath = path.join(
  webRoot,
  "app",
  "[locale]",
  "contact",
  "page.tsx",
);
const contactUtilsPath = path.join(
  webRoot,
  "src",
  "views",
  "contact",
  "contact.utils.ts",
);
const contactFormPath = path.join(
  webRoot,
  "src",
  "views",
  "contact",
  "components",
  "contact-message-form.tsx",
);
const contactSchemaPath = path.join(
  webRoot,
  "src",
  "views",
  "contact",
  "contact-form.schema.ts",
);
const commonFormPath = path.join(
  webRoot,
  "src",
  "components",
  "common",
  "form.tsx",
);

test("contact page delegates message form behavior to a shadcn-style form component", async () => {
  const [viewSource, formSource, schemaSource, commonFormSource] =
    await Promise.all([
      readFile(contactViewPath, "utf8"),
      readFile(contactFormPath, "utf8"),
      readFile(contactSchemaPath, "utf8"),
      readFile(commonFormPath, "utf8"),
    ]);

  assert.match(viewSource, /<ContactMessageForm \/>/);
  assert.doesNotMatch(viewSource, /formData/);
  assert.doesNotMatch(viewSource, /handleSubmit = \(e: React\.FormEvent\)/);

  for (const expected of [
    "useForm",
    "zodResolver",
    "Form",
    "FormField",
    "FormControl",
    "FormMessage",
    "Input",
    "Textarea",
    "Button",
    "form.handleSubmit",
  ]) {
    assert.match(formSource, new RegExp(expected));
  }

  assert.match(schemaSource, /createContactMessageSchema/);
  assert.match(schemaSource, /fullName/);
  assert.match(schemaSource, /phone/);
  assert.match(schemaSource, /content/);

  assert.match(commonFormSource, /const Form = FormProvider/);
  assert.match(commonFormSource, /function FormControl/);
  assert.match(commonFormSource, /function FormMessage/);
});

test("contact page renders published site settings with local fallback data", async () => {
  const [pageSource, viewSource, utilsSource] = await Promise.all([
    readFile(contactPagePath, "utf8"),
    readFile(contactViewPath, "utf8"),
    readFile(contactUtilsPath, "utf8"),
  ]);

  assert.match(pageSource, /getPublicSiteSettings\(locale\)/);
  assert.match(pageSource, /<ContactView siteSettings=\{siteSettings\} \/>/);

  assert.match(viewSource, /siteSettings\?: PublicWebsiteSiteSetting \| null/);
  assert.match(viewSource, /getPublishedContactOffices\(siteSettings\)/);
  assert.match(viewSource, /siteSettings\?\.contactEmail/);
  assert.match(viewSource, /siteSettings\?\.websiteUrl/);
  assert.match(viewSource, /toTelephoneHref/);
  assert.match(viewSource, /FALLBACK_EMAIL/);
  assert.match(viewSource, /FALLBACK_WEBSITE_URL/);

  assert.match(utilsSource, /siteSettings\?\.offices/);
  assert.match(utilsSource, /office\.isActive/);
  assert.match(utilsSource, /sortOrder/);
});

test("contact form validation messages exist in every locale", async () => {
  const requiredKeys = ["fullNameMin", "phoneInvalid", "contentMin"];
  const missing = [];

  for (const locale of ["vi", "en"]) {
    const messages = JSON.parse(
      await readFile(
        path.join(webRoot, "src", "messages", `${locale}.json`),
        "utf8",
      ),
    );

    for (const key of requiredKeys) {
      if (typeof messages.ContactPage?.form?.validation?.[key] !== "string") {
        missing.push(`${locale}:ContactPage.form.validation.${key}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});
