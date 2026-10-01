const priceFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

export function formatPrice(value: number, status?: string) {
  return `${priceFmt.format(value)} ₺${status === "kiralik" ? " / ay" : ""}`;
}

export function formatNumber(value: number) {
  return priceFmt.format(value);
}

export function formatDate(value: Date) {
  return value.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatDateTime(value: Date) {
  return value.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
}

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };

export function slugify(input: string) {
  return input
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => TR_MAP[c] ?? TR_MAP[c.toLocaleLowerCase("tr")] ?? c)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLocaleUpperCase("tr"))
    .join("");
}

/** Görüntülenen telefon numarasından `tel:` bağlantısı üretir. */
export function telHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

/** `wa.me` yalnızca ülke kodlu, sadece rakamdan oluşan numara kabul eder. */
export function whatsappHref(number: string, text?: string) {
  let digits = number.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) digits = `90${digits.slice(1)}`;
  else if (digits.length === 10) digits = `90${digits}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function instagramHref(handle: string) {
  const h = handle.replace(/^@/, "").trim();
  return h ? `https://www.instagram.com/${h}/` : "";
}
