"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div className="max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-antique-gold">Có lỗi xảy ra</p>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Trang chưa thể hiển thị</h1>
        <p className="mt-4 text-stone-mist">Vui lòng thử lại. Nếu lỗi tiếp tục, hãy kiểm tra cấu hình Supabase.</p>
        <button
          onClick={reset}
          className="mt-8 min-h-12 rounded-full bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.15em] text-obsidian"
        >
          Thử lại
        </button>
      </div>
    </main>
  );
}
