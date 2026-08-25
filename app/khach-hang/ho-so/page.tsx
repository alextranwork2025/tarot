import Link from "next/link";

import { CustomerProfileForm } from "@/components/customer/CustomerForms";
import { requireCustomer } from "@/lib/auth/customer";
import { maskPhone } from "@/lib/format/privacy";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage() {
  const customer = await requireCustomer();

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/khach-hang" className="text-sm text-antique-gold">← Tài khoản</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Hồ sơ cá nhân</h1>
        <p className="mt-3 text-sm text-stone-mist">Số điện thoại đăng nhập: {maskPhone(customer.phone)}</p>
        <div className="mt-8">
          <CustomerProfileForm customer={customer} />
        </div>
      </div>
    </main>
  );
}
