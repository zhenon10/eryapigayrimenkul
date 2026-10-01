import { DISTRICTS, LISTING_STATUSES, LISTING_TYPES, labelOf, type District, type ListingStatus, type ListingType } from "./constants";

export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

/** Başlıklarda kullanılan, arama ifadelerine yakın tip adları. */
const TYPE_SEO_LABEL: Record<ListingType, string> = {
  daire: "Daire",
  villa: "Villa",
  mustakil: "Müstakil Ev",
  arsa: "Arsa",
  tarla: "Tarla",
  zeytinlik: "Zeytinlik",
  isyeri: "İş Yeri",
  "ticari-arsa": "Ticari Arsa",
};

/**
 * Bölge/kategori sayfaları: /satilik, /kiralik/daire, /satilik/edremit, /satilik/villa/edremit.
 * Tip ve ilçe adları çakışmadığı için tek segment ikisinden biri olabilir.
 */
export type Landing = { status: ListingStatus; type?: ListingType; district?: District };

const isType = (v: string): v is ListingType => LISTING_TYPES.some((t) => t.value === v);
const isDistrict = (v: string): v is District => DISTRICTS.some((d) => d.value === v);
export const isStatus = (v: string): v is ListingStatus => LISTING_STATUSES.some((s) => s.value === v);

export function parseLanding(status: string, segments: string[] = []): Landing | null {
  if (!isStatus(status) || segments.length > 2) return null;
  const [a, b] = segments;
  if (!a) return { status };
  if (isType(a)) {
    if (!b) return { status, type: a };
    return isDistrict(b) ? { status, type: a, district: b } : null;
  }
  return isDistrict(a) && !b ? { status, district: a } : null;
}

export const landingPath = (l: Landing) => `/${[l.status, l.type, l.district].filter(Boolean).join("/")}`;

export function landingName(l: Landing) {
  const status = labelOf(LISTING_STATUSES, l.status);
  const what = l.type ? TYPE_SEO_LABEL[l.type] : "Emlak";
  const where = l.district ? labelOf(DISTRICTS, l.district) : "Balıkesir";
  return { status, what, where, district: l.district ? labelOf(DISTRICTS, l.district) : null };
}

/** Ör. "Altıeylül Kiralık Daire İlanları" / "Balıkesir Satılık Emlak İlanları" */
export function landingHeading(l: Landing) {
  const n = landingName(l);
  return `${n.where} ${n.status} ${n.what} İlanları`;
}

export function landingTitle(l: Landing) {
  const n = landingName(l);
  return n.district ? `${n.district} ${n.status} ${n.what} İlanları – Balıkesir` : `Balıkesir ${n.status} ${n.what} İlanları`;
}

export function landingDescription(l: Landing, count: number, company: string) {
  const n = landingName(l);
  const place = n.district ? `Balıkesir ${n.district}` : "Balıkesir";
  const what = `${n.status.toLocaleLowerCase("tr")} ${n.what.toLocaleLowerCase("tr")}`;
  return count > 0
    ? `${place} bölgesinde ${count} ${what} ilanı. Fiyat, m² ve fotoğraflarıyla güncel portföy; ${company} danışmanlarıyla hemen iletişime geçin.`
    : `${place} bölgesindeki ${what} ilanları. Aradığınız mülkü bize bildirin, portföyümüze girdiğinde size haber verelim.`;
}

/** Sayfanın üst kısmındaki kısa tanıtım metni. */
export function landingIntro(l: Landing, company: string) {
  const n = landingName(l);
  const place = n.district ? `Balıkesir ${n.district} bölgesinde` : "Balıkesir genelinde";
  const what = `${n.status.toLocaleLowerCase("tr")} ${n.what.toLocaleLowerCase("tr")}`;
  return `${place} ${what} arıyorsanız ${company} portföyündeki güncel ilanları aşağıda inceleyebilirsiniz. Beğendiğiniz mülk için danışmanımızla doğrudan iletişime geçebilir, aradığınızı bulamazsanız kriterlerinizi bize bildirebilirsiniz.`;
}

export const typeSeoLabel = (t: string) => TYPE_SEO_LABEL[t as ListingType] ?? labelOf(LISTING_TYPES, t);
