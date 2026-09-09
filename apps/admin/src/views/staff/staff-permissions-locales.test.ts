import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PERMISSION_GROUPS, PERMISSIONS } from "@repo/shared/constants";

test("activation-code permissions include expiry extension", () => {
  const activationCodeGroup = PERMISSION_GROUPS.find(
    (group) => group.key === "activationCodes",
  );

  assert.ok(activationCodeGroup);
  assert.ok(
    activationCodeGroup.permissions.includes(
      PERMISSIONS.ACTIVATION_CODE_BATCH_EXTEND,
    ),
  );
});

for (const locale of ["vi", "en"]) {
  test(`every staff permission has a label in the ${locale} locale`, () => {
    const messages = JSON.parse(
      readFileSync(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    ) as {
      Staff?: {
        permissionGroups?: Record<string, string>;
        permissionLabels?: Record<string, string>;
      };
    };

    for (const group of PERMISSION_GROUPS) {
      assert.ok(
        messages.Staff?.permissionGroups?.[group.key],
        `${locale} is missing Staff.permissionGroups.${group.key}`,
      );

      for (const permission of group.permissions) {
        assert.ok(
          messages.Staff?.permissionLabels?.[permission],
          `${locale} is missing Staff.permissionLabels.${permission}`,
        );
      }
    }
  });
}
