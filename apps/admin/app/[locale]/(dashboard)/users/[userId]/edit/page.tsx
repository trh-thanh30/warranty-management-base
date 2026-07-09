import { StaffAccountFormView } from "@/src/views/users/staff-account-form.view";

type EditUserPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { userId } = await params;

  return <StaffAccountFormView mode="edit" userId={userId} />;
}
