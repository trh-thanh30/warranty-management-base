import { CustomerProductsView } from "@/src/views/customers/customer-products.view";

type CustomerProductsPageProps = {
  params: Promise<{
    customerId: string;
  }>;
};

export default async function CustomerProductsPage({
  params,
}: CustomerProductsPageProps) {
  const { customerId } = await params;

  return <CustomerProductsView customerId={customerId} />;
}
