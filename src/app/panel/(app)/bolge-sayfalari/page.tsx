import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { db } from "@/db";
import { landingContent } from "@/db/schema";
import { Badge, PageHeader, Panel } from "@/components/panel/ui";
import { Select } from "@/components/site/form-controls";
import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES } from "@/lib/constants";
import { countFor, getLandingCounts } from "@/lib/queries";
import { landingHeading, landingPath, parseLanding, typeSeoLabel, type Landing } from "@/lib/seo";

export const metadata: Metadata = { title: "Bölge Sayfaları" };

export default function LandingPagesPage() {
  const rows = getLandingCounts();
  const contents = new Map(db.select().from(landingContent).all().map((c) => [c.path, c]));

  // İlanı olan tüm sayfalar + ilanı olmasa da içerik girilmiş sayfalar.
  const landings = new Map<string, Landing>();
  for (const { value: status } of LISTING_STATUSES) {
    const candidates: Landing[] = [{ status }];
    for (const { value: type } of LISTING_TYPES) {
      candidates.push({ status, type });
      for (const { value: district } of DISTRICTS) candidates.push({ status, type, district });
    }
    for (const { value: district } of DISTRICTS) candidates.push({ status, district });
    for (const l of candidates) if (countFor(rows, l) > 0) landings.set(landingPath(l), l);
  }
  for (const path of contents.keys()) {
    const [status, ...rest] = path.slice(1).split("/");
    const l = parseLanding(status ?? "", rest);
    if (l) landings.set(path, l);
  }

  const list = [...landings.entries()]
    .map(([path, l]) => ({ path, l, n: countFor(rows, l), content: contents.get(path) }))
    .sort((a, b) => b.n - a.n || a.path.localeCompare(b.path));
  const custom = list.filter((x) => x.content).length;

  return (
    <>
      <PageHeader
        title="Bölge Sayfaları"
        description={`${list.length} sayfa · ${custom} tanesinde özgün içerik var. Önce en çok ilanı olan sayfalara özgün metin yazmanızı öneririz.`}
      />

      <Panel title="Başka bir sayfa için içerik yaz" description="Henüz ilanı olmayan bir bölge için de önceden içerik hazırlayabilirsiniz." className="mb-6">
        <form action="/panel/bolge-sayfalari/yeni" className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <Select name="durum" aria-label="Durum" defaultValue="satilik">
            {LISTING_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Select name="tip" aria-label="Tip" defaultValue="">
            <option value="">Tüm tipler</option>
            {LISTING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {typeSeoLabel(t.value)}
              </option>
            ))}
          </Select>
          <Select name="ilce" aria-label="İlçe" defaultValue="">
            <option value="">Tüm Balıkesir</option>
            {DISTRICTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
          <button className="btn-primary">Düzenle</button>
        </form>
      </Panel>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="border-b border-line bg-canvas text-left text-micro tracking-[0.06em] text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-bold">Sayfa</th>
              <th className="px-4 py-3 text-right font-bold">İlan</th>
              <th className="px-4 py-3 font-bold">İçerik</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map(({ path, l, n, content }) => (
              <tr key={path} className="hover:bg-canvas/60">
                <td className="px-4 py-3">
                  <Link href={`/panel/bolge-sayfalari${path}`} className="font-semibold hover:text-accent-strong">
                    {landingHeading(l)}
                  </Link>
                  <span className="block text-micro text-muted">{path}</span>
                </td>
                <td className="tabular px-4 py-3 text-right">{n}</td>
                <td className="px-4 py-3">
                  {content ? (
                    <span className="flex flex-wrap gap-1">
                      {content.intro && <Badge tone="success">Giriş</Badge>}
                      {content.body && <Badge tone="success">Rehber</Badge>}
                      {content.metaDescription && <Badge tone="success">Açıklama</Badge>}
                    </span>
                  ) : (
                    <Badge>Şablon</Badge>
                  )}
                  {n === 0 && (
                    <span className="mt-1 block text-micro text-muted">İlan yok: sayfa dizine kapalı</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Link href={path} target="_blank" className="btn-outline btn-sm" aria-label={`${path} sitede aç`}>
                      <ExternalLink className="size-4" aria-hidden />
                    </Link>
                    <Link href={`/panel/bolge-sayfalari${path}`} className="btn-outline btn-sm" aria-label={`${path} düzenle`}>
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
