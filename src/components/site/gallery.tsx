"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, ImageOff, X } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { cn } from "@/lib/cn";
import { mediaUrl, type ImageRef } from "@/lib/media-url";

export function Gallery({ images, title }: { images: ImageRef[]; title: string }) {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const count = images.length;
  const go = (d: number) => setIndex((i) => (i + d + count) % count);

  useEffect(() => {
    thumbs.current?.children[index]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [index]);

  if (!count)
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-panel text-ink-muted">
        <ImageOff className="size-10" aria-hidden />
      </div>
    );

  const current = images[index]!;
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  };

  return (
    <div className="flex flex-col gap-3" onKeyDown={onKey}>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-panel">
        <MediaImage
          key={current.key}
          image={current}
          alt={current.alt || `${title} – fotoğraf ${index + 1}`}
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority={index === 0}
          className="size-full object-cover"
        />
        {count > 1 && (
          <>
            <NavButton side="left" onClick={() => go(-1)} />
            <NavButton side="right" onClick={() => go(1)} />
          </>
        )}
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md glass-dark px-3 py-1.5 text-micro font-semibold text-white"
        >
          <Expand className="size-3.5" aria-hidden /> Tam ekran · {index + 1}/{count}
        </button>
      </div>

      {count > 1 && (
        <div ref={thumbs} className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Fotoğraflar">
          {images.map((img, i) => (
            <button
              key={img.key}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Fotoğraf ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-md ring-offset-2 transition",
                i === index ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100",
              )}
            >
              <MediaImage image={img} alt="" sizes="96px" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialog}
        onKeyDown={onKey}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 backdrop:bg-ink/80"
        aria-label={`${title} fotoğrafları`}
      >
        <div className="relative flex size-full items-center justify-center p-4 md:p-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl(current.key, "lg")}
            alt={current.alt || `${title} – fotoğraf ${index + 1}`}
            className="max-h-full max-w-full object-contain"
          />
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Kapat"
            className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-6" />
          </button>
          {count > 1 && (
            <>
              <NavButton side="left" onClick={() => go(-1)} />
              <NavButton side="right" onClick={() => go(1)} />
            </>
          )}
          <span className="tabular absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
            {index + 1} / {count}
          </span>
        </div>
      </dialog>
    </div>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Önceki fotoğraf" : "Sonraki fotoğraf"}
      className={cn(
        "absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-md glass text-ink shadow-card transition hover:bg-white",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
