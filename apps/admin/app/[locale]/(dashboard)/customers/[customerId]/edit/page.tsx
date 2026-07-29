import { CustomerFormView } from "@/src/views/customers/customer-form.view";

type EditCustomerPageProps = {
  params: Promise<{
    customerId: string;
  }>;
};

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { customerId } = await params;

  return <CustomerFormView mode="edit" customerId={customerId} />;
}
