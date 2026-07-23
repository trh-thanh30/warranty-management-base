import { DealerFormView } from "@/src/views/dealers/dealer-form.view";

type EditDealerPageProps = {
  params: Promise<{
    dealerId: string;
  }>;
};

export default async function EditDealerPage({ params }: EditDealerPageProps) {
  const { dealerId } = await params;

  return <DealerFormView dealerId={dealerId} mode="edit" />;
}
