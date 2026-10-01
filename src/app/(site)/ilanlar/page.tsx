import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX, SlidersHorizontal } from "lucide-react";
import { DistrictOptions, Field, SegmentedRadio, Select, TypeOptions } from "@/components/site/form-controls";
import { GetForm } from "@/components/site/get-form";
import { ListingCard } from "@/components/site/listing-card";
import { PageHero } from "@/components/site/section";
import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES, TYPE_GROUPS, labelOf } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { SORTS, getRoomOptions, searchListings, searchSchema, type SearchFilters } from "@/lib/queries";

function describe(f: SearchFilters) {
  const parts = [
    f.ilce && labelOf(DISTRICTS, f.ilce),
    f.durum && labelOf(LISTING_STATUSES, f.durum),
    f.tip ? labelOf(LISTING_TYPES, f.tip) : f.kategori && labelOf(TYPE_GROUPS, f.kategori),
  ].filter(Boolean);
  return parts.length ? `${parts.join(" ")} İlanları` : "Tüm İlanlar";
}

export async function generateMetadata({ searchParams }: PageProps<"/ilanlar">): Promise<Metadata> {
  const f = searchSchema.parse(await searchParams);
  return {
    title: `${describe(f)} – Balıkesir`,
    alternates: { canonical: "/ilanlar" },
  };
}

export default async function ListingsPage({ searchParams }: PageProps<"/ilanlar">) {
  const raw = await searchParams;
  const f = searchSchema.parse(raw);
  const result = searchListings(f);
  const rooms = getRoomOptions();

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(f)) if (v != null && k !== "sayfa") params.set(k, String(v));
    if (page > 1) params.set("sayfa", String(page));
    const qs = params.toString();
    return qs ? `/ilanlar?${qs}` : "/ilanlar";
  };

  return (
    <>
      <PageHero
        eyebrow="Portföy"
        title={describe(f)}
        text={`${formatNumber(result.total)} ilan listeleniyor.`}
      />

      <div className="container-site grid gap-10 py-12 lg:grid-cols-[18rem_1fr]">
        <aside>
          <div className="card">
            {/* Mobilde filtreler bir düğmeyle açılır (JS gerektirmeyen checkbox yöntemi). */}
            <input type="checkbox" id="filtre-ac" className="peer sr-only" />
            <label
              htmlFor="filtre-ac"
              className="flex cursor-pointer items-center justify-between p-5 font-bold peer-focus-visible:outline-2 peer-focus-visible:outline-accent lg:hidden"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4" aria-hidden /> Filtreler
              </span>
              <span className="text-micro text-muted">Göster / Gizle</span>
            </label>
            {/* key: filtreler değişince form varsayılan değerlerle yeniden çizilsin */}
            <GetForm
              key={JSON.stringify(f)}
              action="/ilanlar"
              className="hidden flex-col gap-5 border-t border-line p-5 peer-checked:flex lg:flex lg:border-0"
              role="search"
            >
              <SegmentedRadio
                name="durum"
                defaultValue={f.durum ?? ""}
                options={[{ value: "", label: "Tümü" }, ...LISTING_STATUSES]}
              />
              <Field label="Kelime / İlan No" htmlFor="f-q">
                <input id="f-q" name="q" defaultValue={f.q} placeholder="Ör. Paşaalanı, ER-1001" className="field" />
              </Field>
              <Field label="İlçe" htmlFor="f-ilce">
                <Select id="f-ilce" name="ilce" defaultValue={f.ilce ?? ""}>
                  <DistrictOptions />
                </Select>
              </Field>
              <Field label="Kategori" htmlFor="f-kategori">
                <Select id="f-kategori" name="kategori" defaultValue={f.kategori ?? ""}>
                  <option value="">Tüm kategoriler</option>
                  {TYPE_GROUPS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Gayrimenkul Tipi" htmlFor="f-tip">
                <Select id="f-tip" name="tip" defaultValue={f.tip ?? ""}>
                  <TypeOptions />
                </Select>
              </Field>
              {rooms.length > 0 && (
                <Field label="Oda Sayısı" htmlFor="f-oda">
                  <Select id="f-oda" name="oda" defaultValue={f.oda ?? ""}>
                    <option value="">Farketmez</option>
                    {rooms.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              <fieldset>
                <legend className="label mb-1.5">Fiyat (₺)</legend>
                <div className="grid grid-cols-2 gap-2">
                  <input name="min" inputMode="numeric" defaultValue={f.min} placeholder="En az" aria-label="En az fiyat" className="field" />
                  <input name="max" inputMode="numeric" defaultValue={f.max} placeholder="En çok" aria-label="En çok fiyat" className="field" />
                </div>
              </fieldset>
              <Field label="Sıralama" htmlFor="f-sirala">
                <Select id="f-sirala" name="sirala" defaultValue={f.sirala ?? ""}>
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value === "yeni" ? "" : s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex flex-col gap-2">
                <button type="submit" className="btn-accent">
                  Filtrele
                </button>
                {Object.keys(raw).length > 0 && (
                  <Link href="/ilanlar" className="btn-outline">
                    Filtreleri Temizle
                  </Link>
                )}
              </div>
            </GetForm>
          </div>
        </aside>

        <section aria-label="İlan sonuçları" className="flex flex-col gap-10">
          {result.items.length ? (
            <div className="grid gap-8 md:grid-cols-2">
              {result.items.map((l, i) => (
                <ListingCard key={l.id} listing={l} priority={i < 2} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-lg bg-canvas p-12 text-center">
              <SearchX className="size-10 text-ink-muted" aria-hidden />
              <p className="font-display text-headline-sm font-semibold">Aradığınız kriterlerde ilan bulunamadı</p>
              <p className="max-w-md text-sm text-muted">
                Filtreleri genişletebilir ya da aradığınız mülkü bize bildirebilirsiniz; portföyümüze girdiğinde size haber verelim.
              </p>
              <div className="flex gap-3">
                <Link href="/ilanlar" className="btn-outline">
                  Tüm İlanlar
                </Link>
                <Link href="/iletisim" className="btn-primary">
                  Talep Bırak
                </Link>
              </div>
            </div>
          )}

          {result.pages > 1 && (
            <nav aria-label="Sayfalar" className="flex items-center justify-center gap-2">
              <PageLink href={pageHref(result.page - 1)} disabled={result.page <= 1} label="Önceki sayfa">
                <ChevronLeft className="size-4" />
              </PageLink>
              {Array.from({ length: result.pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === result.pages || Math.abs(p - result.page) <= 2)
                .map((p, i, arr) => (
                  <span key={p} className="flex items-center gap-2">
                    {i > 0 && p - arr[i - 1]! > 1 && <span className="text-muted">…</span>}
                    <PageLink href={pageHref(p)} current={p === result.page} label={`Sayfa ${p}`}>
                      {p}
                    </PageLink>
                  </span>
                ))}
              <PageLink href={pageHref(result.page + 1)} disabled={result.page >= result.pages} label="Sonraki sayfa">
                <ChevronRight className="size-4" />
              </PageLink>
            </nav>
          )}
        </section>
      </div>
    </>
  );
}

function PageLink({
  href,
  current,
  disabled,
  label,
  children,
}: {
  href: string;
  current?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const cls = "tabular flex size-10 items-center justify-center rounded-md border text-label font-semibold transition";
  if (disabled)
    return (
      <span aria-hidden className={cn(cls, "border-line text-line-strong")}>
        {children}
      </span>
    );
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={cn(cls, current ? "border-ink bg-ink text-white" : "border-line hover:border-ink-muted")}
    >
      {children}
    </Link>
  );
}
