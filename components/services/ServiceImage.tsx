import Image from "next/image";

function isImageSupported(src: string) {
  if (src.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(src);
    return url.hostname === "sbvtfkkvijgpzpktmfnh.supabase.co";
  } catch {
    return false;
  }
}

export function ServiceImage({
  src,
  alt,
  priority = false,
  sizes = "(min-width: 1024px) 40vw, 100vw",
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src || !isImageSupported(src)) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-lg border border-gilded/40 bg-card-deep/70 px-6 text-center text-sm text-stone-mist">
        Ảnh dịch vụ đang được cập nhật
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-gilded/40 bg-card-deep">
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
    </div>
  );
}
