import Image from "next/image";

export function StoneImage({ src, alt, priority = false, sizes = "(min-width: 1024px) 30vw, 100vw", square = false }: { src: string | null; alt: string; priority?: boolean; sizes?: string; square?: boolean }) {
  const supported = Boolean(src && (src.startsWith("/") || src.includes(".supabase.co/")));
  const ratio = square ? "aspect-square" : "aspect-[4/3]";
  if (!src || !supported) return <div className={`grid ${ratio} place-items-center rounded-lg border border-gilded/40 bg-card-deep/70 px-5 text-center text-sm text-stone-mist`}>Ảnh đang được cập nhật</div>;
  return <div className={`relative ${ratio} overflow-hidden rounded-lg border border-gilded/40 bg-card-deep`}><Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" /></div>;
}
