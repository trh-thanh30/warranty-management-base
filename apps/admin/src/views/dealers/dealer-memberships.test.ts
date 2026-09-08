import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createDealersService } from "../../services/dealers/create-dealers.service.ts";
import type { DealersHttpClient } from "../../services/dealers/dealers.types.ts";

test("dealer service manages membership through dealer-scoped endpoints", async () => {
  const calls: Array<{ method: string; url: string; body?: unknown }> = [];
  const membership = {
    id: "membership-id",
    dealerId: "dealer-id",
    userId: "staff-id",
  };
  const http = {
    async delete(url: string) {
      calls.push({ method: "DELETE", url });
      return { data: { success: true, data: { id: "membership-id" } } };
    },
    async get(url: string) {
      calls.push({ method: "GET", url });
      return { data: { success: true, data: [membership] } };
    },
    async post(url: string, body: unknown) {
      calls.push({ method: "POST", url, body });
      return { data: { success: true, data: membership } };
    },
  };
  const service = createDealersService(http as unknown as DealersHttpClient);

  await service.listDealers({ limit: 10, page: 1 });
  await service.listMembers("dealer-id");
  await service.addMember("dealer-id", { userId: "staff-id" });
  await service.removeMember("dealer-id", "membership-id");

  assert.deepEqual(calls, [
    { method: "GET", url: "/dealers/managed" },
    { method: "GET", url: "/dealers/dealer-id/members" },
    {
      method: "POST",
      url: "/dealers/dealer-id/members",
      body: { userId: "staff-id" },
    },
    {
      method: "DELETE",
      url: "/dealers/dealer-id/members/membership-id",
    },
  ]);
});

test("dealer edit view temporarily hides the membership tab", () => {
  const source = readFileSync(
    new URL("./dealer-form.view.tsx", import.meta.url),
    "utf8",
  );
  const constants = readFileSync(
    new URL("./dealers.constants.ts", import.meta.url),
    "utf8",
  );

  assert.match(constants, /DEALER_MEMBERSHIP_UI_ENABLED = false/);
  assert.match(source, /DEALER_MEMBERSHIP_UI_ENABLED/);
  assert.match(source, /membersTab/);
  assert.match(source, /DealerMembersCard/);
});
