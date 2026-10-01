// Alan sözlükleri: hem panel formlarında hem sitede filtre/etiket olarak kullanılır.
// Değerler (anahtarlar) veritabanına yazılır, etiketler sadece görüntüleme içindir.

export const DISTRICTS = [
  { value: "karesi", label: "Karesi" },
  { value: "altieylul", label: "Altıeylül" },
  { value: "ayvalik", label: "Ayvalık" },
  { value: "balya", label: "Balya" },
  { value: "bandirma", label: "Bandırma" },
  { value: "bigadic", label: "Bigadiç" },
  { value: "burhaniye", label: "Burhaniye" },
  { value: "dursunbey", label: "Dursunbey" },
  { value: "edremit", label: "Edremit" },
  { value: "erdek", label: "Erdek" },
  { value: "gomec", label: "Gömeç" },
  { value: "gonen", label: "Gönen" },
  { value: "havran", label: "Havran" },
  { value: "ivrindi", label: "İvrindi" },
  { value: "kepsut", label: "Kepsut" },
  { value: "manyas", label: "Manyas" },
  { value: "marmara", label: "Marmara" },
  { value: "savastepe", label: "Savaştepe" },
  { value: "sindirgi", label: "Sındırgı" },
  { value: "susurluk", label: "Susurluk" },
] as const;

export const LISTING_STATUSES = [
  { value: "satilik", label: "Satılık" },
  { value: "kiralik", label: "Kiralık" },
] as const;

/** `group` arama filtresindeki üst kategorileri belirler (konut / arsa / ticari). */
export const LISTING_TYPES = [
  { value: "daire", label: "Daire", group: "konut" },
  { value: "villa", label: "Villa", group: "konut" },
  { value: "mustakil", label: "Müstakil Ev", group: "konut" },
  { value: "arsa", label: "Arsa", group: "arsa" },
  { value: "tarla", label: "Tarla", group: "arsa" },
  { value: "zeytinlik", label: "Zeytinlik", group: "arsa" },
  { value: "isyeri", label: "İş Yeri / Dükkan", group: "ticari" },
  { value: "ticari-arsa", label: "Ticari / Sanayi Parseli", group: "ticari" },
] as const;

export const TYPE_GROUPS = [
  { value: "konut", label: "Konut" },
  { value: "arsa", label: "Arsa & Tarla" },
  { value: "ticari", label: "Ticari" },
] as const;

export const INQUIRY_KINDS = [
  { value: "degerleme", label: "Değerleme" },
  { value: "iletisim", label: "İletişim" },
  { value: "ilan", label: "İlan Sorusu" },
] as const;

export const INQUIRY_STATES = [
  { value: "yeni", label: "Yeni" },
  { value: "gorusuldu", label: "Görüşüldü" },
  { value: "kapandi", label: "Kapandı" },
] as const;

export type District = (typeof DISTRICTS)[number]["value"];
export type ListingStatus = (typeof LISTING_STATUSES)[number]["value"];
export type ListingType = (typeof LISTING_TYPES)[number]["value"];
export type TypeGroup = (typeof TYPE_GROUPS)[number]["value"];
export type InquiryKind = (typeof INQUIRY_KINDS)[number]["value"];
export type InquiryState = (typeof INQUIRY_STATES)[number]["value"];

export const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((i) => i.value) as unknown as [T[number]["value"], ...T[number]["value"][]];

export function labelOf(list: readonly { value: string; label: string }[], value: string | null | undefined) {
  return list.find((i) => i.value === value)?.label ?? value ?? "";
}

export const typesInGroup = (group: string) =>
  LISTING_TYPES.filter((t) => t.group === group).map((t) => t.value as ListingType);

/** Arsa tipleri oda/banyo yerine imar/ada-parsel bilgisi gösterir. */
export const isLandType = (type: string) => LISTING_TYPES.find((t) => t.value === type)?.group === "arsa";
