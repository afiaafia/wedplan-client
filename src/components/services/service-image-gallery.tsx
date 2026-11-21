"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function ServiceImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [failedIndices, setFailedIndices] = useState<number[]>([]);
  const available = images
    .map((src, index) => ({ src, index }))
    .filter(
      ({ src, index }) => src.trim().length > 0 && !failedIndices.includes(index)
    );
  const [primary, ...gallery] = available;

  function markFailed(index: number) {
    setFailedIndices((current) =>
      current.includes(index) ? current : [...current, index]
    );
  }

  if (!primary) {
    return (
      <div
        role="img"
        aria-label="No image available"
        className="flex h-72 items-center justify-center rounded-[28px] border border-border/80 bg-secondary text-muted/60 sm:h-[460px]"
      >
        <div className="text-center">
          <ImageOff size={40} strokeWidth={1.3} className="mx-auto" />
          <p className="mt-3 text-sm">Images coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-border/80 bg-secondary shadow-sm">
      <div className="relative h-72 bg-secondary sm:h-[460px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primary.src}
          alt={`${title} — primary image`}
          className="h-full w-full object-cover"
          onError={() => markFailed(primary.index)}
        />
        <span className="absolute bottom-4 left-4 rounded-full bg-background/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground shadow-sm backdrop-blur-sm">
          {title}
        </span>
      </div>

      {gallery.length > 0 && (
        <div className="grid grid-cols-2 gap-2 border-t border-border/80 p-2 sm:grid-cols-3">
          {gallery.map((image) => (
            <div
              key={`${image.src}-${image.index}`}
              className="h-28 overflow-hidden rounded-xl bg-secondary sm:h-36"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={`${title} — image ${image.index + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                onError={() => markFailed(image.index)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
