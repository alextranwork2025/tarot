import { LookupForm } from "@/components/booking/LookupForm";
import { Header } from "@/components/Header";

export const metadata = {
  title: "Tra cứu lịch hẹn | Huyền Cảnh",
  description: "Tra cứu hoặc gửi yêu cầu hủy lịch hẹn Tarot bằng mã đặt lịch và số điện thoại.",
};

export default function LookupPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen px-5 pb-24 pt-32 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-antique-gold">Tra cứu</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold text-ivory md:text-7xl">Lịch hẹn của bạn</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-mist">
            Nhập cả mã đặt lịch và số điện thoại để xem thông tin tối thiểu, không hiển thị dữ liệu nội bộ.
          </p>
          <div className="mt-12">
            <LookupForm />
          </div>
        </div>
      </main>
    </>
  );
}
