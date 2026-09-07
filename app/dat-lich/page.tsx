import { BookingForm } from "@/components/booking/BookingForm";
import { Header } from "@/components/Header";
import { getCustomerAccess } from "@/lib/auth/customer";
import { getActiveServices } from "@/lib/queries/services";

export const metadata = {
  title: "Đặt lịch Tarot | Huyền Cảnh",
  description: "Đặt lịch đọc Tarot tại Huyền Cảnh.",
};

type Props = {
  searchParams: Promise<{ service?: string }>;
};

export default async function BookingPage({ searchParams }: Props) {
  const params = await searchParams;
  const [services, customerAccess] = await Promise.all([getActiveServices(), getCustomerAccess()]);
  const initialServiceId = services.some((service) => service.id === params.service) ? params.service : undefined;

  return (
    <>
      <Header />
      <main className="min-h-screen px-5 pb-24 pt-32 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-antique-gold">Đặt lịch</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold text-ivory md:text-7xl">Chọn một khoảng lặng</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-mist">
            Gửi yêu cầu đặt lịch đọc Tarot. Thông tin sẽ được xác nhận trước khi phiên đọc diễn ra.
          </p>
          <div className="mt-12">
            <BookingForm
              services={services}
              initialServiceId={initialServiceId}
              customer={customerAccess.ok ? { fullName: customerAccess.customer.full_name, phone: customerAccess.customer.phone, email: customerAccess.customer.email ?? "" } : null}
            />
          </div>
        </div>
      </main>
    </>
  );
}
