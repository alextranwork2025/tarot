export default function AdminBlogLoading() {
  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="h-5 w-28 animate-pulse rounded bg-gilded/40" />
        <div className="mt-4 h-14 w-80 max-w-full animate-pulse rounded bg-card-deep" />
        <div className="mt-8 h-28 animate-pulse rounded-lg border border-gilded/30 bg-card-deep/70" />
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-lg border border-gilded/30 bg-card-deep/70" />
          ))}
        </div>
      </div>
    </main>
  );
}
