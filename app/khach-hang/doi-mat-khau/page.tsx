import { CustomerChangePasswordForm } from "@/components/customer/CustomerForms";
import { requireCustomerAllowPasswordChange } from "@/lib/auth/customer";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ required?: string }>;
};

export default async function CustomerChangePasswordPage({ searchParams }: Props) {
  await requireCustomerAllowPasswordChange();
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-24">
      <CustomerChangePasswordForm required={params.required === "1"} />
    </main>
  );
}
