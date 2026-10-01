import { notFound } from "next/navigation";
import { PageHero } from "./section";

/** Panelden düzenlenen düz metin sayfaları; metin girilmemişse sayfa yayında görünmez. */
export function TextPage({ title, text }: { title: string; text: string }) {
  if (!text.trim()) notFound();
  return (
    <>
      <PageHero title={title} />
      <section className="container-site py-14">
        <div className="prose-text max-w-3xl">{text}</div>
      </section>
    </>
  );
}
