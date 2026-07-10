import { adminHttpClient } from "@/src/lib/admin-http-client";
import {
  createCustomersService,
  type CustomersHttpClient,
} from "./create-customers.service";

export const customersService = createCustomersService(
  adminHttpClient as unknown as CustomersHttpClient,
);
