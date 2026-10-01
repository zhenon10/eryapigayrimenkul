"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, X } from "lucide-react";
import { mediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/cn";

export type UploadedImage = { id: number; key: string; width: number; height: number; alt: string };

async function upload(file: File): Promise<UploadedImage> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/panel/upload", { method: "POST", body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Yükleme başarısız");
  return json;
}

/**
 * Görselleri anında yükler ve formda sıralı `name` gizli alanları olarak taşır.
 * `multiple` kapalıyken tek görsel (ör. danışman fotoğrafı) yönetir.
 */
export function ImageUploader({
  name,
  initial = [],
  multiple = true,
  max = 40,
}: {
  name: string;
  initial?: UploadedImage[];
  multiple?: boolean;
  max?: number;
}) {
  const [images, setImages] = useState(initial);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const limit = multiple ? max : 1;

  async function addFiles(files: FileList | File[]) {
    setError("");
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const room = limit - (multiple ? images.length : 0);
    const batch = list.slice(0, Math.max(0, room));
    if (list.length > batch.length) setError(`En fazla ${limit} görsel eklenebilir.`);
    setPending((n) => n + batch.length);
    // Sırayı korumak için tek tek yükle.
    for (const file of batch) {
      try {
        const img = await upload(file);
        setImages((prev) => (multiple ? [...prev, img] : [img]));
      } catch (e) {
        setError(`${file.name}: ${(e as Error).message}`);
      } finally {
        setPending((n) => n - 1);
      }
    }
  }

  const move = (i: number, d: number) =>
    setImages((prev) => {
      const next = [...prev];
      const j = i + d;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  const canAdd = images.length + pending < limit;

  return (
    <div className="flex flex-col gap-3">
      {images.map((img) => (
        <input key={img.id} type="hidden" name={name} value={img.id} />
      ))}

      <div className={cn("grid gap-3", multiple ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "w-40")}>
        {images.map((img, i) => (
          <figure key={img.id} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl(img.key, "sm")} alt="" className="size-full object-cover" />
            {multiple && i === 0 && (
              <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded bg-ink/85 px-1.5 py-0.5 text-[10px] font-bold text-white">
                <Star className="size-3 fill-accent-bright text-accent-bright" aria-hidden /> Kapak
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-ink/80 to-transparent p-1.5 opacity-100 transition md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
              {multiple ? (
                <span className="flex gap-1">
                  <IconBtn label="Sola taşı" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowLeft className="size-3.5" />
                  </IconBtn>
                  <IconBtn label="Sağa taşı" onClick={() => move(i, 1)} disabled={i === images.length - 1}>
                    <ArrowRight className="size-3.5" />
                  </IconBtn>
                </span>
              ) : (
                <span />
              )}
              <IconBtn label="Kaldır" onClick={() => setImages((prev) => prev.filter((x) => x.id !== img.id))}>
                <X className="size-3.5" />
              </IconBtn>
            </div>
          </figure>
        ))}
        {Array.from({ length: pending }, (_, i) => (
          <div key={`p${i}`} className="flex aspect-[4/3] items-center justify-center rounded-md border border-dashed border-line-strong bg-white">
            <Loader2 className="size-5 animate-spin text-muted" aria-label="Yükleniyor" />
          </div>
        ))}
      </div>

      {canAdd && (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-md border-2 border-dashed px-4 py-6 text-sm transition",
            dragging ? "border-accent bg-accent-tint" : "border-line-strong bg-white hover:border-ink-muted",
          )}
        >
          <ImagePlus className="size-6 text-muted" aria-hidden />
          <span className="font-semibold">{multiple ? "Fotoğraf ekle" : images.length ? "Fotoğrafı değiştir" : "Fotoğraf seç"}</span>
          <span className="text-micro text-muted">Sürükleyip bırakın veya tıklayın · JPG, PNG, WebP · en fazla 15 MB</span>
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        hidden
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="text-micro font-semibold text-danger">{error}</p>}
      {pending > 0 && (
        <>
          <p className="text-micro text-muted">Görseller yükleniyor, kaydetmeden önce tamamlanmasını bekleyin…</p>
          {/* Yükleme sürerken formun gönderilmesini tarayıcı doğrulamasıyla engelle. */}
          <input
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            required
            value=""
            onChange={() => {}}
            ref={(el) => el?.setCustomValidity("Görsellerin yüklenmesi bitmeden kaydedemezsiniz.")}
          />
        </>
      )}
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-7 items-center justify-center rounded bg-white/90 text-ink hover:bg-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}
