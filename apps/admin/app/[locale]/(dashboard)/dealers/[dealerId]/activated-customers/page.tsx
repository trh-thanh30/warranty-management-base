import { DealerActivatedCustomersView } from "@/src/views/dealers/dealer-activated-customers.view";

type PageProps = {
  params: Promise<{ dealerId: string }>;
};

export default async function DealerActivatedCustomersPage({
  params,
}: PageProps) {
  const { dealerId } = await params;
  return <DealerActivatedCustomersView dealerId={dealerId} />;
}
