import type {
  Category,
  Customer,
  Product,
  ProductTemplate,
  ServiceCenter,
  User,
  Warranty,
  WarrantyClaim,
  WarrantyClaimServiceCenterHistory,
  WarrantyClaimStatusHistory,
} from '@prisma/client';

export type WarrantyClaimAttachmentResponse = {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  type: string;
  accessType: string;
  uploadedById: string | null;
  createdAt: Date;
};

export type WarrantyClaimWithRelations = WarrantyClaim & {
  product?:
    | (Product & {
        template?:
          | (ProductTemplate & { category_ref?: Category | null })
          | null;
      })
    | null;
  warranty?: Warranty;
  customer?: Customer | null;
  service_center?: ServiceCenter | null;
  status_history?: Array<
    WarrantyClaimStatusHistory & {
      changed_by?: User | null;
    }
  >;
  service_center_history?: Array<
    WarrantyClaimServiceCenterHistory & {
      changed_by?: User | null;
    }
  >;
};
