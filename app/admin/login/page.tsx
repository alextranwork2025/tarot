import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = {
  title: "Đăng nhập quản trị | Huyền Cảnh",
};

type Props = {
  searchParams: Promise<{
    reason?: string;
    detail?: string;
  }>;
};

const notices: Record<string, string> = {
  "no-session": "Phiên đăng nhập chưa tồn tại hoặc cookie chưa được lưu. Vui lòng đăng nhập lại.",
  "profile-query-error": "Không thể đọc bảng profiles. Hãy kiểm tra schema và quyền Supabase secret key.",
  "profile-not-found": "Auth user đã đăng nhập nhưng chưa có profiles.id trùng với user id hiện tại.",
  "profile-inactive": "Profile của tài khoản này đang bị tắt. Hãy đặt is_active = true.",
  "profile-role": "Profile chưa có role admin hoặc staff.",
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const notice = params.reason ? notices[params.reason] : undefined;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-24">
      <AdminLoginForm notice={notice} detail={params.detail} />
    </main>
  );
}
