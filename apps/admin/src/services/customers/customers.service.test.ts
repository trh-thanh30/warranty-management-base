import assert from "node:assert/strict";
import test from "node:test";
import {
  createCustomersService,
  type CustomersHttpClient,
} from "./create-customers.service.ts";

const customer = {
  id: "customer-id",
  userId: null,
  customerCode: "CUS-WALKIN-001",
  fullName: "Le Thi Minh",
  phone: "0900000003",
  email: "walkin.customer@example.com",
  address: "Da Nang",
  metadata: null,
  createdAt: "2026-07-09T00:00:00.000Z",
  updatedAt: "2026-07-09T00:00:00.000Z",
};

test("customer directory requests paginated customers and unwraps the response", async () => {
  const calls: unknown[] = [];
  const response = {
    items: [customer],
    meta: {
      page: 2,
      limit: 10,
      total: 11,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    },
  };
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createCustomersService(
    http as unknown as CustomersHttpClient,
  ).listCustomers({
    limit: 10,
    page: 2,
    search: "walkin",
  });

  assert.deepEqual(calls, [
    {
      url: "/customers",
      config: {
        params: {
          limit: 10,
          page: 2,
          search: "walkin",
        },
      },
    },
  ]);
  assert.deepEqual(result, response);
});

test("creating a customer profile does not require a user account", async () => {
  const calls: unknown[] = [];
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: customer } };
    },
  };

  const result = await createCustomersService(
    http as unknown as CustomersHttpClient,
  ).createCustomer({
    address: "Da Nang",
    customerCode: "CUS-WALKIN-001",
    email: "walkin.customer@example.com",
    fullName: "Le Thi Minh",
    phone: "0900000003",
  });

  assert.deepEqual(calls, [
    {
      url: "/customers",
      body: {
        address: "Da Nang",
        customerCode: "CUS-WALKIN-001",
        email: "walkin.customer@example.com",
        fullName: "Le Thi Minh",
        phone: "0900000003",
      },
    },
  ]);
  assert.equal(result.userId, null);
});

test("updating a customer sends required contact fields", async () => {
  const calls: unknown[] = [];
  const updatedCustomer = {
    ...customer,
    fullName: "Le Thi Minh Updated",
  };
  const http = {
    async patch(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: updatedCustomer } };
    },
  };

  const result = await createCustomersService(
    http as unknown as CustomersHttpClient,
  ).updateCustomer("customer-id", {
    address: "Da Nang",
    email: "walkin.customer@example.com",
    fullName: "Le Thi Minh Updated",
    phone: "0900000003",
  });

  assert.deepEqual(calls, [
    {
      url: "/customers/customer-id",
      body: {
        address: "Da Nang",
        email: "walkin.customer@example.com",
        fullName: "Le Thi Minh Updated",
        phone: "0900000003",
      },
    },
  ]);
  assert.deepEqual(result, updatedCustomer);
});
