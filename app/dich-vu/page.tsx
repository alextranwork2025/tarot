import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ServiceCard } from "@/components/services/ServiceCard";
import { getActiveServices } from "@/lib/queries/services";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://huyen-canh.local";

export const metadata: Metadata = {
  title: "Dịch vụ Tarot | Huyền Cảnh",
  description: "Khám phá các dịch vụ đọc Tarot tại Huyền Cảnh và chọn một phiên phù hợp với câu hỏi hiện tại của bạn.",
  alternates: {
    canonical: `${baseUrl}/dich-vu`,
  },
  openGraph: {
    title: "Dịch vụ Tarot | Huyền Cảnh",
    description: "Danh sách dịch vụ Tarot đã xuất bản tại Huyền Cảnh.",
    url: `${baseUrl}/dich-vu`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dịch vụ Tarot | Huyền Cảnh",
    description: "Danh sách dịch vụ Tarot đã xuất bản tại Huyền Cảnh.",
  },
};

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <>
      <Header />
      <main className="min-h-screen px-5 pb-24 pt-32 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-antique-gold">Dịch vụ</p>
          <h1 className="mt-4 font-serif text-5xl font-semibold text-ivory md:text-7xl">Những nhịp mở lá</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-mist">
            Mỗi dịch vụ là một không gian quan sát riêng, được cập nhật trực tiếp từ hệ thống quản trị của Huyền Cảnh.
          </p>

          {services.length === 0 ? (
            <section className="mt-12 rounded-lg border border-gilded/40 bg-card-deep/75 p-8 text-center text-stone-mist">
              Dịch vụ đang được chuẩn bị.
            </section>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => <ServiceCard key={service.id} service={service} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
