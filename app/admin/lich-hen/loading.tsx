export default function AdminAppointmentsLoading() {
  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="h-5 w-28 animate-pulse rounded bg-gilded/40" />
        <div className="mt-4 h-14 w-80 max-w-full animate-pulse rounded bg-card-deep" />
        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-lg border border-gilded/30 bg-card-deep/70" />
          ))}
        </section>
        <div className="mt-8 h-40 animate-pulse rounded-lg border border-gilded/30 bg-card-deep/70" />
        <div className="mt-6 h-80 animate-pulse rounded-lg border border-gilded/30 bg-card-deep/70" />
      </div>
    </main>
  );
}
