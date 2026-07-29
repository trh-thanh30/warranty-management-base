import type {
  CreateProductTemplateBody,
  ListProductTemplatesQuery,
  PaginatedResponse,
  ProductTemplateSummary,
  UpdateProductTemplateBody,
} from "@repo/shared";
import { unwrap } from "../service.utils.ts";
import type { ProductTemplatesHttpClient } from "./product-templates.types";

export function createProductTemplatesService(
  http: ProductTemplatesHttpClient,
) {
  return {
    async list(
      query: ListProductTemplatesQuery,
    ): Promise<PaginatedResponse<ProductTemplateSummary>> {
      return unwrap(
        await http.get<PaginatedResponse<ProductTemplateSummary>>(
          "/product-templates",
          { params: query },
        ),
      );
    },

    async detail(templateId: string): Promise<ProductTemplateSummary> {
      return unwrap(
        await http.get<ProductTemplateSummary>(
          `/product-templates/${templateId}`,
        ),
      );
    },

    async create(
      body: CreateProductTemplateBody,
    ): Promise<ProductTemplateSummary> {
      return unwrap(
        await http.post<ProductTemplateSummary>("/product-templates", body),
      );
    },

    async update(
      templateId: string,
      body: UpdateProductTemplateBody,
    ): Promise<ProductTemplateSummary> {
      return unwrap(
        await http.patch<ProductTemplateSummary>(
          `/product-templates/${templateId}`,
          body,
        ),
      );
    },

    async deactivate(templateId: string): Promise<ProductTemplateSummary> {
      return unwrap(
        await http.delete<ProductTemplateSummary>(
          `/product-templates/${templateId}`,
        ),
      );
    },
  };
}
