import { CustomerLoginForm } from "@/components/customer/CustomerForms";

export const metadata = {
  title: "Đăng nhập khách hàng | Huyền Cảnh",
};

type Props = {
  searchParams: Promise<{ reason?: string }>;
};

const notices: Record<string, string> = {
  "no-session": "Vui lòng đăng nhập để xem tài khoản khách hàng.",
  "customer-not-found": "Tài khoản Auth chưa được liên kết với hồ sơ khách hàng.",
  "query-error": "Không thể đọc hồ sơ khách hàng. Vui lòng thử lại sau.",
};

export default async function CustomerLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const notice = params.reason ? notices[params.reason] : undefined;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-24">
      <CustomerLoginForm notice={notice} />
    </main>
  );
}
