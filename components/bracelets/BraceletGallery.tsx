"use client";

import { useState } from "react";

import { StoneImage } from "@/components/stones/StoneImage";

export function BraceletGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(images[0] ?? null);

  if (!selected) {
    return <StoneImage src={null} alt={name} priority />;
  }

  return (
    <div className="grid gap-4">
      <a href={selected} target="_blank" rel="noreferrer" aria-label={`Xem ảnh lớn ${name}`}>
        <StoneImage src={selected} alt={name} priority />
      </a>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button key={image} type="button" onClick={() => setSelected(image)} className={`rounded-sm border p-1 ${selected === image ? "border-antique-gold" : "border-gilded/35"}`} aria-label={`Chọn ảnh ${index + 1}`}>
              <StoneImage src={image} alt={`${name} ${index + 1}`} square sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
