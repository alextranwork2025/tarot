import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ServiceNotFound() {
  return (
    <>
      <Header />
      <main className="grid min-h-screen place-items-center px-5 py-32 text-center md:px-8">
        <section className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-antique-gold">404</p>
          <h1 className="mt-4 font-serif text-5xl text-ivory">Không tìm thấy dịch vụ</h1>
          <p className="mt-5 text-sm leading-7 text-stone-mist">
            Dịch vụ này chưa được xuất bản, đang tạm ẩn hoặc không còn tồn tại.
          </p>
          <Link href="/dich-vu" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian hover:bg-ivory">
            Xem danh sách dịch vụ
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
