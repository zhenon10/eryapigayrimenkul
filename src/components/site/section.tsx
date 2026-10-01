import type { ReactNode } from "react";

/** Bölüm başlığı: başlık + isteğe bağlı kısa açıklama, sağda isteğe bağlı bağlantı/aksiyon. */
export function SectionHeading({ title, text, children }: { title: ReactNode; text?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        <h2 className="font-display text-headline-md font-semibold text-ink">{title}</h2>
        {text && <p className="text-[15px] leading-7 text-muted">{text}</p>}
      </div>
      {children}
    </div>
  );
}

/** İç sayfaların başlık alanı. */
export function PageHero({ title, text, children }: { title: ReactNode; text?: ReactNode; children?: ReactNode }) {
  return (
    <section className="border-b border-line bg-canvas">
      <div className="container-site flex flex-col gap-3 py-7 md:py-12">
        <h1 className="max-w-3xl font-display text-[1.75rem] leading-tight font-semibold text-balance text-ink md:text-headline">{title}</h1>
        {text && <p className="line-clamp-3 max-w-2xl text-[15px] leading-7 text-muted md:line-clamp-none">{text}</p>}
        {children}
      </div>
    </section>
  );
}
