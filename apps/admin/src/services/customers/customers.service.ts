import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createCustomersService } from "./create-customers.service";
import type { CustomersHttpClient } from "./customers.types";

export const customersService = createCustomersService(
  adminHttpClient as unknown as CustomersHttpClient,
);
