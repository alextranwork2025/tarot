import Image from "next/image";

export function BlogImage({ src, alt, priority = false }: { src: string | null; alt: string; priority?: boolean }) {
  if (!src) {
    return (
      <div className="grid aspect-[16/9] place-items-center rounded-lg border border-gilded/40 bg-card-deep/70 text-sm text-stone-mist">
        Chưa có ảnh
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-gilded/40 bg-card-deep">
      <Image src={src} alt={alt} fill priority={priority} sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
    </div>
  );
}
