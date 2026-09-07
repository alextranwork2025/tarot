export default function LoadingAdminStoneJars() {
  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-12 w-64 rounded bg-card-deep" />
        <div className="mt-8 h-24 rounded-lg border border-gilded/30 bg-card-deep/70" />
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-48 rounded-lg border border-gilded/30 bg-card-deep/70" />)}
        </div>
      </div>
    </main>
  );
}
