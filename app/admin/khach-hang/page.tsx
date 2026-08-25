import Link from "next/link";

import { requireAdminProfile } from "@/lib/auth/admin";
import { AdminCreateCustomerForm } from "@/components/customer/CustomerForms";
import { getAdminCustomers } from "@/lib/queries/customer/admin";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireAdminProfile();
  const customers = await getAdminCustomers();

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin" className="text-sm text-antique-gold">← Dashboard</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Khách hàng</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-mist">
          Tạo tài khoản đăng nhập cho khách hàng bằng số điện thoại. Mật khẩu mặc định được đặt theo yêu cầu nghiệp vụ và khách phải đổi ngay lần đầu đăng nhập.
        </p>
        <div className="mt-8">
          <AdminCreateCustomerForm />
        </div>
        <section className="mt-10 rounded-lg border border-gilded/40 bg-card-deep/75 p-5">
          <h2 className="font-serif text-3xl text-ivory">Khách hàng gần đây</h2>
          <div className="mt-5 grid gap-3">
            {customers.length === 0 ? (
              <p className="text-stone-mist">Chưa có khách hàng nào.</p>
            ) : (
              customers.map((customer) => (
                <article key={customer.id} className="rounded-sm border border-gilded/30 p-4 text-sm text-stone-mist">
                  <p className="font-serif text-2xl text-ivory">{customer.full_name}</p>
                  <p>{customer.masked_phone}</p>
                  <p>{customer.has_account ? "Đã có tài khoản đăng nhập" : "Chưa liên kết tài khoản"}</p>
                  {customer.must_change_password ? <p className="text-antique-gold">Cần đổi mật khẩu lần đầu</p> : null}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
