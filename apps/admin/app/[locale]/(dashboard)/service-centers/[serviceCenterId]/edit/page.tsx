import { ServiceCenterFormView } from "@/src/views/service-centers/service-center-form.view";

type EditServiceCenterPageProps = {
  params: Promise<{ serviceCenterId: string }>;
};

export default async function EditServiceCenterPage({
  params,
}: EditServiceCenterPageProps) {
  const { serviceCenterId } = await params;

  return (
    <ServiceCenterFormView mode="edit" serviceCenterId={serviceCenterId} />
  );
}
