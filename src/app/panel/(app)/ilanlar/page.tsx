import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq, inArray, like, or, type SQL } from "drizzle-orm";
import { ImageOff, Pencil, Search } from "lucide-react";
import { db } from "@/db";
import { agents, listingImages, listings, media } from "@/db/schema";
import { EmptyState, NewButton, PageHeader } from "@/components/panel/ui";
import { Select } from "@/components/site/form-controls";
import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES, labelOf } from "@/lib/constants";
import { formatDateTime, formatPrice } from "@/lib/format";
import { mediaUrl } from "@/lib/media-url";
import { FlagToggle } from "./flag-toggle";

export const metadata: Metadata = { title: "İlanlar" };

export default async function PanelListingsPage({ searchParams }: PageProps<"/panel/ilanlar">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const durum = sp.durum === "yayinda" || sp.durum === "taslak" ? sp.durum : "";

  const where: (SQL | undefined)[] = [];
  if (q) {
    const term = `%${q.replace(/[%_]/g, "")}%`;
    where.push(or(like(listings.title, term), like(listings.refNo, term), like(listings.neighborhood, term)));
  }
  if (durum) where.push(eq(listings.isPublished, durum === "yayinda"));

  const rows = db
    .select({
      id: listings.id,
      refNo: listings.refNo,
      slug: listings.slug,
      title: listings.title,
      status: listings.status,
      type: listings.type,
      district: listings.district,
      price: listings.price,
      isPublished: listings.isPublished,
      isFeatured: listings.isFeatured,
      updatedAt: listings.updatedAt,
      agentName: agents.name,
    })
    .from(listings)
    .leftJoin(agents, eq(agents.id, listings.agentId))
    .where(and(...where))
    .orderBy(desc(listings.updatedAt))
    .all();

  const covers = new Map<number, string>();
  const coverRows = rows.length
    ? db
        .select({ listingId: listingImages.listingId, key: media.key })
        .from(listingImages)
        .innerJoin(media, eq(media.id, listingImages.mediaId))
        .where(inArray(listingImages.listingId, rows.map((r) => r.id)))
        .orderBy(asc(listingImages.sortOrder))
        .all()
    : [];
  for (const c of coverRows) {
    if (!covers.has(c.listingId)) covers.set(c.listingId, c.key);
  }

  return (
    <>
      <PageHeader
        title="İlanlar"
        description={`${rows.length} ilan${q || durum ? " (filtreli)" : ""}`}
        action={<NewButton href="/panel/ilanlar/yeni" label="Yeni İlan" />}
      />

      <form className="mb-6 flex flex-col gap-3 sm:flex-row" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Başlık, ilan no veya mahalle ara" aria-label="Ara" className="field pl-9" />
        </div>
        <div className="sm:w-48">
          <Select name="durum" defaultValue={durum} aria-label="Yayın durumu">
            <option value="">Tümü</option>
            <option value="yayinda">Yayında</option>
            <option value="taslak">Taslak</option>
          </Select>
        </div>
        <button className="btn-primary">Filtrele</button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title={q || durum ? "Sonuç bulunamadı" : "Henüz ilan yok"}
          text={q || durum ? undefined : "İlk ilanınızı ekleyerek başlayın. Taslak olarak kaydedip daha sonra yayına alabilirsiniz."}
          action={!q && !durum && <NewButton href="/panel/ilanlar/yeni" label="Yeni İlan" />}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[56rem] text-sm">
            <thead className="border-b border-line bg-canvas text-left text-micro tracking-[0.06em] text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-bold">İlan</th>
                <th className="px-4 py-3 font-bold">Konum / Tip</th>
                <th className="px-4 py-3 text-right font-bold">Fiyat</th>
                <th className="px-4 py-3 font-bold">Yayında</th>
                <th className="px-4 py-3 font-bold">Öne çıkan</th>
                <th className="px-4 py-3 font-bold">Güncelleme</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => {
                const cover = covers.get(r.id);
                return (
                  <tr key={r.id} className="hover:bg-canvas/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-panel">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={mediaUrl(cover, "sm")} alt="" className="size-full object-cover" />
                          ) : (
                            <ImageOff className="size-4 text-ink-muted" aria-hidden />
                          )}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <Link href={`/panel/ilanlar/${r.id}`} className="line-clamp-1 font-semibold hover:text-accent-strong">
                            {r.title}
                          </Link>
                          <span className="text-micro text-muted">
                            {r.refNo}
                            {r.agentName && ` · ${r.agentName}`}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {labelOf(DISTRICTS, r.district)}
                      <br />
                      <span className="text-micro">
                        {labelOf(LISTING_STATUSES, r.status)} {labelOf(LISTING_TYPES, r.type)}
                      </span>
                    </td>
                    <td className="tabular px-4 py-3 text-right font-semibold whitespace-nowrap">{formatPrice(r.price, r.status)}</td>
                    <td className="px-4 py-3">
                      <FlagToggle id={r.id} flag="isPublished" value={r.isPublished} label={`${r.title} yayında`} />
                    </td>
                    <td className="px-4 py-3">
                      <FlagToggle id={r.id} flag="isFeatured" value={r.isFeatured} label={`${r.title} öne çıkan`} />
                    </td>
                    <td className="px-4 py-3 text-micro whitespace-nowrap text-muted">{formatDateTime(r.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {r.isPublished && (
                          <Link href={`/ilanlar/${r.slug}`} target="_blank" className="btn-outline btn-sm">
                            Gör
                          </Link>
                        )}
                        <Link href={`/panel/ilanlar/${r.id}`} className="btn-outline btn-sm" aria-label={`${r.title} düzenle`}>
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
