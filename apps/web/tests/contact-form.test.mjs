import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");
const globalStylesPath = path.join(webRoot, "app", "globals.css");
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
  "components",
  "common",
  "contact-message-form.tsx",
);
const contactSchemaPath = path.join(
  webRoot,
  "src",
  "components",
  "common",
  "contact-message-form.schema.ts",
);
const contactServicePath = path.join(
  webRoot,
  "src",
  "services",
  "contact-submissions",
  "contact-submissions.service.ts",
);
const locationsServicePath = path.join(
  webRoot,
  "src",
  "services",
  "locations",
  "locations.service.ts",
);
const vietnamProvincesHookPath = path.join(
  webRoot,
  "src",
  "hooks",
  "use-vietnam-provinces.ts",
);
const queryProviderPath = path.join(
  webRoot,
  "src",
  "components",
  "providers",
  "query-provider.tsx",
);
const contactSubmissionConstantsPath = path.join(
  process.cwd(),
  "packages",
  "shared",
  "src",
  "constants",
  "contact-submissions.ts",
);
const contactSubmissionTypesPath = path.join(
  process.cwd(),
  "packages",
  "shared",
  "src",
  "types",
  "contact-submission.types.ts",
);
const commonFormPath = path.join(
  webRoot,
  "src",
  "components",
  "common",
  "form.tsx",
);
const quickChatPath = path.join(
  webRoot,
  "src",
  "components",
  "common",
  "public-quick-chat.tsx",
);
const quickContactActionsPath = path.join(
  webRoot,
  "src",
  "components",
  "common",
  "public-contact-actions.tsx",
);
const localeLayoutPath = path.join(webRoot, "app", "[locale]", "layout.tsx");
const siteFooterPath = path.join(
  webRoot,
  "src",
  "components",
  "layout",
  "site-footer.tsx",
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
  const [pageSource, layoutSource, viewSource, utilsSource] = await Promise.all(
    [
      readFile(contactPagePath, "utf8"),
      readFile(localeLayoutPath, "utf8"),
      readFile(contactViewPath, "utf8"),
      readFile(contactUtilsPath, "utf8"),
    ],
  );

  assert.match(pageSource, /<ContactView \/>/);
  assert.doesNotMatch(pageSource, /get(?:Cached|Public)SiteSetting/);

  assert.match(layoutSource, /getCachedSiteSetting\(locale\)/);
  assert.match(
    layoutSource,
    /<SiteSettingsProvider siteSettings=\{siteSettings\}>/,
  );

  assert.match(viewSource, /const siteSettings = useSiteSettings\(\)/);
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
  const requiredKeys = [
    "fullNameMin",
    "fullNameMax",
    "phoneInvalid",
    "contentMin",
    "contentMax",
    "consultationTopicRequired",
    "phonePending",
    "provinceRequired",
    "rateLimit",
    "submitError",
  ];
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

test("contact form enforces the same maximum lengths as the public API", async () => {
  const schemaSource = await readFile(contactSchemaPath, "utf8");

  assert.match(schemaSource, /CONTACT_SUBMISSION_LIMITS/);
  assert.match(
    schemaSource,
    /\.max\(CONTACT_SUBMISSION_LIMITS\.fullName\.max,\s*messages\.fullNameMax\)/,
  );
  assert.match(
    schemaSource,
    /\.max\(CONTACT_SUBMISSION_LIMITS\.phone\.max,\s*messages\.phoneInvalid\)/,
  );
  assert.match(
    schemaSource,
    /\.max\(CONTACT_SUBMISSION_LIMITS\.content\.max,\s*messages\.contentMax\)/,
  );
});

test("contact form submits public messages through contact submissions service", async () => {
  const [formSource, serviceSource, sharedTypesSource] = await Promise.all([
    readFile(contactFormPath, "utf8"),
    readFile(contactServicePath, "utf8"),
    readFile(contactSubmissionTypesPath, "utf8"),
  ]);
  const createBodyType = sharedTypesSource.match(
    /export type CreateContactSubmissionBody = \{[\s\S]*?\};/,
  )?.[0];

  assert.match(
    formSource,
    /contactSubmissionsService\.createContactSubmission/,
  );
  assert.doesNotMatch(formSource, /provinceName/);
  assert.match(formSource, /form\.formState\.isSubmitting/);
  assert.match(formSource, /form\.setError\("root"/);
  assert.match(formSource, /\bw-full\b/);
  assert.match(formSource, /\bsm:w-auto\b/);
  assert.match(serviceSource, /class ContactSubmissionsService/);
  assert.match(serviceSource, /"\/public\/contact-submissions"/);
  assert.ok(createBodyType);
  assert.doesNotMatch(createBodyType, /provinceName/);
});

test("contact form shows a pending submission conflict on the phone field", async () => {
  const [formSource, constantsSource] = await Promise.all([
    readFile(contactFormPath, "utf8"),
    readFile(contactSubmissionConstantsPath, "utf8"),
  ]);

  assert.match(
    constantsSource,
    /PHONE_PENDING:\s*"CONTACT_SUBMISSION_PHONE_PENDING"/,
  );
  assert.match(formSource, /CONTACT_SUBMISSION_ERROR_CODES/);
  assert.match(formSource, /catch \(error\)/);
  assert.match(
    formSource,
    /error\.code === CONTACT_SUBMISSION_ERROR_CODES\.PHONE_PENDING/,
  );
  assert.match(formSource, /form\.setError\(\s*"phone"/);
  assert.match(formSource, /t\("form\.validation\.phonePending"\)/);
});

test("contact form shows a specific message when the API rate limit is reached", async () => {
  const formSource = await readFile(contactFormPath, "utf8");

  assert.match(formSource, /error\.status === 429/);
  assert.match(formSource, /t\("form\.validation\.rateLimit"\)/);
  assert.match(formSource, /form\.setError\("root"/);
});

test("contact form renders consultation heading and required topic and province selects", async () => {
  const [viewSource, formSource, schemaSource, constantsSource] =
    await Promise.all([
      readFile(contactViewPath, "utf8"),
      readFile(contactFormPath, "utf8"),
      readFile(contactSchemaPath, "utf8"),
      readFile(contactSubmissionConstantsPath, "utf8"),
    ]);

  assert.match(viewSource, /t\("form\.title"\)/);
  assert.match(viewSource, /t\("form\.description"\)/);
  assert.match(viewSource, /text-2xl font-semibold text-premium-red/);
  assert.match(viewSource, /text-base leading-6 text-stone-gray/);
  assert.doesNotMatch(viewSource, /t\("form\.eyebrow"\)/);
  assert.match(formSource, /SelectTrigger/);
  assert.match(formSource, /name="consultationTopic"/);
  assert.match(formSource, /name="provinceCode"/);
  assert.equal(
    (
      formSource.match(
        /SelectTrigger\s+className=\{`[^`]*\$\{formControlFocusClassName\}`\}/g,
      ) ?? []
    ).length,
    2,
  );
  assert.equal(
    (
      formSource.match(
        /FormLabel className="text-sm font-semibold uppercase text-deep-black"/g,
      ) ?? []
    ).length,
    5,
  );
  assert.match(formSource, /useVietnamProvinces/);
  assert.match(
    formSource,
    /viewportClassName="h-auto max-h-72 overflow-y-auto"/,
  );
  assert.match(formSource, /onWheelCapture=\{handleProvinceSelectWheel\}/);
  assert.match(formSource, /viewport\.scrollTop \+= event\.deltaY/);
  assert.match(schemaSource, /consultationTopicRequired/);
  assert.match(schemaSource, /provinceRequired/);
  assert.match(constantsSource, /PRODUCT_CONSULTATION/);
  assert.match(constantsSource, /DEALER_REGISTRATION/);
});

test("web locations service reads provinces from the public locations API", async () => {
  const serviceSource = await readFile(locationsServicePath, "utf8");

  assert.match(serviceSource, /class LocationsService/);
  assert.match(serviceSource, /listVietnamProvinces/);
  assert.match(serviceSource, /"\/locations\/vietnam\/provinces"/);
  assert.match(serviceSource, /publicHttpClient/);
});

test("province options share a query cache and quick chat loads them lazily", async () => {
  const [
    hookSource,
    formSource,
    quickChatSource,
    providerSource,
    layoutSource,
  ] = await Promise.all([
    readFile(vietnamProvincesHookPath, "utf8"),
    readFile(contactFormPath, "utf8"),
    readFile(quickChatPath, "utf8"),
    readFile(queryProviderPath, "utf8").catch(() => ""),
    readFile(localeLayoutPath, "utf8"),
  ]);

  assert.match(hookSource, /useQuery/);
  assert.match(hookSource, /enabled/);
  assert.match(hookSource, /queryKey:\s*VIETNAM_PROVINCES_QUERY_KEY/);
  assert.match(hookSource, /staleTime:\s*24 \* 60 \* 60 \* 1000/);
  assert.doesNotMatch(hookSource, /requestVersion|useEffect|useState/);
  assert.match(formSource, /loadLocations\?: boolean/);
  assert.match(
    formSource,
    /useVietnamProvinces\(\{\s*enabled:\s*loadLocations\s*\}\)/,
  );
  assert.match(
    quickChatSource,
    /<ContactMessageForm\s+loadLocations=\{isOpen\}\s+variant="quickChat"\s+\/>/,
  );
  assert.match(providerSource, /QueryClientProvider/);
  assert.match(layoutSource, /<QueryProvider>/);
});

test("opening a Radix select preserves the root layout during scroll lock", async () => {
  const globalStyles = await readFile(globalStylesPath, "utf8");

  assert.match(globalStyles, /html\s*\{\s*scrollbar-gutter:\s*stable;/);
  assert.match(
    globalStyles,
    /html body\[data-scroll-locked\]\s*\{\s*margin-right:\s*0\s*!important;/,
  );
});

test("contact message form supports a compact quick-chat variant", async () => {
  const formSource = await readFile(contactFormPath, "utf8");

  assert.match(formSource, /variant\?: "page" \| "quickChat"/);
  assert.match(formSource, /variant = "page"/);
  assert.match(formSource, /variant === "quickChat"/);
  assert.match(formSource, /variant === "page"/);
  assert.match(formSource, /sourcePath/);
  assert.match(formSource, /isQuickChat \? "z-70"/);
});

test("header consultation actions open the quick-chat form instead of leaving the site", async () => {
  const headerSource = await readFile(
    path.join(webRoot, "src", "components", "layout", "site-header.tsx"),
    "utf8",
  );

  assert.equal(
    (headerSource.match(/openPublicQuickChat\(\)/g) ?? []).length,
    1,
  );
  assert.match(headerSource, /onClick=\{openPublicQuickChat\}/);
  assert.match(headerSource, /closeMobileMenu\(\);\s*openPublicQuickChat\(\);/);
});

test("contact form requires Turnstile and resets it after a failed submission", async () => {
  const formSource = await readFile(contactFormPath, "utf8");

  assert.match(formSource, /<TurnstileWidget/);
  assert.match(formSource, /!isQuickChat \|\| loadLocations/);
  assert.match(formSource, /turnstileToken \?\? undefined/);
  assert.match(formSource, /isTurnstileEnabled && turnstileToken === null/);
  assert.match(formSource, /setTurnstileResetKey\(\(value\) => value \+ 1\)/);
});

test("contact submission service sends Turnstile token in the verification header", async () => {
  const { ContactSubmissionsService } =
    await import("../src/services/contact-submissions/contact-submissions.service.ts");
  const calls = [];
  const service = new ContactSubmissionsService({
    async post(url, body, config) {
      calls.push({ url, body, config });
      return { data: { id: "submission-1" } };
    },
  });
  const body = { fullName: "Test" };

  await service.createContactSubmission(body, "captcha-token");

  assert.deepEqual(calls, [
    {
      url: "/public/contact-submissions",
      body,
      config: { headers: { "X-Turnstile-Token": "captcha-token" } },
    },
  ]);
});

test("public layout mounts one accessible responsive quick chat", async () => {
  const [quickChatSource, layoutSource] = await Promise.all([
    readFile(quickChatPath, "utf8"),
    readFile(localeLayoutPath, "utf8"),
  ]);

  assert.equal(
    (
      layoutSource.match(
        /<PublicQuickChat siteSettings=\{siteSettings\} \/>/g,
      ) ?? []
    ).length,
    1,
  );
  assert.match(
    quickChatSource,
    /<ContactMessageForm\s+loadLocations=\{isOpen\}\s+variant="quickChat"\s+\/>/,
  );
  assert.match(quickChatSource, /aria-expanded=\{isOpen\}/);
  assert.match(quickChatSource, /event\.key === "Escape"/);
  assert.match(quickChatSource, /max-h-\[80dvh\]/);
  assert.match(quickChatSource, /inset-x-4/);
  assert.match(quickChatSource, /overflow-y-auto/);
  assert.match(quickChatSource, /data-lenis-prevent/);
});

test("quick chat only expands after deliberate mouse movement", async () => {
  const quickChatSource = await readFile(quickChatPath, "utf8");

  assert.match(quickChatSource, /onPointerMove/);
  assert.match(quickChatSource, /event\.pointerType === "mouse"/);
  assert.match(quickChatSource, /isTriggerHovered && "sm:w-44"/);
  assert.doesNotMatch(quickChatSource, /sm:hover:w-44/);
  assert.doesNotMatch(quickChatSource, /group-hover:opacity-100/);
});

test("public layout renders configured quick contact actions", async () => {
  const [actionsSource, quickChatSource] = await Promise.all([
    readFile(quickContactActionsPath, "utf8"),
    readFile(quickChatPath, "utf8"),
  ]);

  assert.equal(
    (
      quickChatSource.match(
        /<PublicContactActions[\s\S]*?isVisible=\{isOpen\}[\s\S]*?siteSettings=\{siteSettings\}[\s\S]*?\/>/g,
      ) ?? []
    ).length,
    1,
  );
  assert.match(actionsSource, /flex-row-reverse/);
  assert.match(actionsSource, /findActiveSocialUrl\(siteSettings, "ZALO"\)/);
  assert.match(
    actionsSource,
    /findActiveSocialUrl\(siteSettings, "FACEBOOK"\)/,
  );
  assert.match(actionsSource, /toTelephoneHref\(phone\)/);
  assert.match(actionsSource, /SiZalo/);
  assert.match(actionsSource, /FaFacebookF/);
  assert.match(actionsSource, /Phone/);
});

test("back-to-top control is stacked above the quick-chat trigger", async () => {
  const footerSource = await readFile(siteFooterPath, "utf8");

  assert.match(footerSource, /fixed bottom-24 right-6/);
});
