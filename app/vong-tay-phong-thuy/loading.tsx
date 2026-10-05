import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function BraceletsLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen px-5 pb-24 pt-32 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-4 w-48 animate-pulse rounded bg-gilded/30" />
          <div className="mt-4 h-16 w-full max-w-2xl animate-pulse rounded bg-gilded/20" />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-96 animate-pulse rounded-lg border border-gilded/30 bg-card-deep/60" />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
