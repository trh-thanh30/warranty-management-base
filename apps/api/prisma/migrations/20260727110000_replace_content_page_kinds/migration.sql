ALTER TYPE "content_page_kind" RENAME TO "content_page_kind_old";

CREATE TYPE "content_page_kind" AS ENUM (
    'GENERAL_POLICY',
    'PRIVACY_POLICY',
    'PURCHASE_POLICY',
    'WARRANTY_RETURN_POLICY',
    'SHIPPING_POLICY',
    'PAYMENT_POLICY',
    'FAQ'
);

ALTER TABLE "content_page"
    ALTER COLUMN "kind" DROP DEFAULT;

ALTER TABLE "content_page"
    ALTER COLUMN "kind" TYPE "content_page_kind"
    USING (
        CASE
            WHEN "slug" IN ('chinh-sach-quy-dinh-chung', 'policies-general') THEN 'GENERAL_POLICY'
            WHEN "slug" IN ('chinh-sach-bao-mat', 'policies-privacy') THEN 'PRIVACY_POLICY'
            WHEN "slug" IN ('chinh-sach-mua-hang', 'policies-purchasing') THEN 'PURCHASE_POLICY'
            WHEN "slug" IN ('chinh-sach-bao-hanh-doi-tra', 'policies-warranty-return') THEN 'WARRANTY_RETURN_POLICY'
            WHEN "slug" IN ('chinh-sach-giao-hang', 'policies-shipping') THEN 'SHIPPING_POLICY'
            WHEN "slug" IN ('chinh-sach-thanh-toan', 'policies-payment') THEN 'PAYMENT_POLICY'
            WHEN "kind"::text = 'FAQ' THEN 'FAQ'
            WHEN "kind"::text = 'GUIDE' THEN 'WARRANTY_RETURN_POLICY'
            ELSE 'GENERAL_POLICY'
        END
    )::"content_page_kind";

ALTER TABLE "content_page"
    ALTER COLUMN "kind" SET DEFAULT 'GENERAL_POLICY';

DROP TYPE "content_page_kind_old";
