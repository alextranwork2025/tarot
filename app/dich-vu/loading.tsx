import { Header } from "@/components/Header";

export default function ServicesLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen px-5 pb-24 pt-32 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6">
          <div className="h-5 w-28 rounded-sm bg-gilded/30" />
          <div className="h-16 w-full max-w-2xl rounded-sm bg-gilded/20" />
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-96 rounded-lg border border-gilded/30 bg-card-deep/60" />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
