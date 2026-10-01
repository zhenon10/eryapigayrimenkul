import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, SearchX, SlidersHorizontal } from "lucide-react";
import { DistrictOptions, Field, SegmentedRadio, Select, TypeOptions } from "@/components/site/form-controls";
import { GetForm } from "@/components/site/get-form";
import { ListingCard } from "@/components/site/listing-card";
import { LISTING_STATUSES, TYPE_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { SORTS, getRoomOptions, type SearchFilters, type searchListings } from "@/lib/queries";

type Props = {
  filters: SearchFilters;
  result: ReturnType<typeof searchListings>;
  pageHref: (page: number) => string;
  hasFilters: boolean;
  /** Sonuçların üstünde gösterilecek içerik (ör. bölge tanıtım metni). */
  children?: ReactNode;
};

/** /ilanlar ve bölge sayfalarının ortak filtre + sonuç + sayfalama görünümü. */
export function ListingsView({ filters: f, result, pageHref, hasFilters, children }: Props) {
  const rooms = getRoomOptions();
  return (
    <div className="container-site grid gap-6 py-6 md:py-12 lg:grid-cols-[18rem_1fr] lg:gap-10">
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
                <input
                  name="min"
                  inputMode="numeric"
                  defaultValue={f.min}
                  placeholder="En az"
                  aria-label="En az fiyat"
                  className="field"
                />
                <input
                  name="max"
                  inputMode="numeric"
                  defaultValue={f.max}
                  placeholder="En çok"
                  aria-label="En çok fiyat"
                  className="field"
                />
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
              {hasFilters && (
                <Link href="/ilanlar" className="btn-outline">
                  Filtreleri Temizle
                </Link>
              )}
            </div>
          </GetForm>
        </div>
      </aside>

      <section aria-label="İlan sonuçları" className="flex flex-col gap-10">
        {children}
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
              Filtreleri genişletebilir ya da aradığınız mülkü bize bildirebilirsiniz; portföyümüze girdiğinde size
              haber verelim.
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
