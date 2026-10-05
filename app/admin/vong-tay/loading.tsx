export default function AdminBraceletsLoading() {
  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="h-12 w-80 animate-pulse rounded bg-gilded/20" />
        <div className="mt-8 h-24 animate-pulse rounded-lg border border-gilded/30 bg-card-deep/60" />
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-lg border border-gilded/30 bg-card-deep/60" />
          ))}
        </div>
      </div>
    </main>
  );
}
