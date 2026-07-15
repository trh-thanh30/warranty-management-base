import { ServiceCenterDetailView } from "@/src/views/service-centers/service-center-detail.view";

type ServiceCenterDetailPageProps = {
  params: Promise<{ serviceCenterId: string }>;
};

export default async function ServiceCenterDetailPage({
  params,
}: ServiceCenterDetailPageProps) {
  const { serviceCenterId } = await params;

  return <ServiceCenterDetailView serviceCenterId={serviceCenterId} />;
}
