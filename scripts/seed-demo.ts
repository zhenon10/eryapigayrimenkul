/**
 * Geliştirme için örnek ilan ve danışman verisi yükler (Stitch tasarımındaki içerik).
 * Gerçek sitede kullanmayın: isimler, fiyatlar ve görseller temsilidir.
 *
 *   npm run seed:demo
 */
import fs from "node:fs";
import path from "node:path";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { agents, listingImages, listings } from "@/db/schema";
import { slugify } from "@/lib/format";
import { saveImage } from "@/lib/media";
import { getSettings, saveSettings } from "@/lib/settings";

const ASSETS = path.join(import.meta.dirname, "demo-assets");
const image = async (name: string, alt: string) => saveImage(fs.readFileSync(path.join(ASSETS, `${name}.webp`)), alt);

async function main() {
  if (db.select({ n: count() }).from(listings).get()!.n > 0 && !process.argv.includes("--force")) {
    console.log("Veritabanında zaten ilan var; atlanıyor (--force ile yine de ekleyebilirsiniz).");
    return;
  }

  const agentData = [
    {
      name: "Emre Kaya",
      title: "Karesi & Arsa Yatırım Uzmanı",
      specialty: "Karesi Uzmanı",
      bio: "Karesi bölgesi yeni konut projeleri, Toygar, Paşaalanı ve Kuvayi Milliye lokasyonlarında imarlı arsa yatırımları sorumlusu.",
      photo: "agent-1",
    },
    {
      name: "Serkan Yıldız",
      title: "Altıeylül & Ticari Mülk Uzmanı",
      specialty: "Altıeylül Uzmanı",
      bio: "Altıeylül Bahçelievler, Plevne, Gaziosmanpaşa ile Balıkesir OSB ve ana arterlerde dükkan/sanayi parsel danışmanı.",
      photo: "agent-2",
    },
    {
      name: "Burak Demir",
      title: "Körfez & Lüks Villa Direktörü",
      specialty: "Körfez Bölge Direktörü",
      bio: "Ayvalık Cunda taş evleri, Edremit Akçay villaları ve Kazdağları eteklerinde doğayla iç içe prestijli mülk danışmanlığı.",
      photo: "agent-3",
    },
  ];

  const agentIds: number[] = [];
  for (const [i, a] of agentData.entries()) {
    const photo = await image(a.photo, a.name);
    const { photo: _p, ...rest } = a;
    agentIds.push(
      db.insert(agents).values({ ...rest, slug: slugify(a.name), photoId: photo.id, sortOrder: i }).returning().get().id,
    );
  }

  const listingData = [
    {
      title: "Paşaalanı 3+1 Lüks Akıllı Daire",
      summary: "Akıllı ev altyapısı, kapalı otopark, ebeveyn banyosu ve geniş peyzaj manzaralı balkon ile birinci sınıf yaşam.",
      status: "satilik", type: "daire", district: "karesi", neighborhood: "Paşaalanı", price: 5_450_000,
      areaGross: 165, areaNet: 140, rooms: "3+1", bathrooms: 2, floor: "4 / 8", buildingAge: 0, heating: "Kombi (Doğalgaz)",
      deedStatus: "Kat Mülkiyetli", badge: "Sıfır Bina", features: ["Akıllı Ev Sistemi", "Kapalı Otopark", "Ebeveyn Banyosu", "Asansör", "Site İçerisinde"],
      agent: 0, images: ["pasaalani", "tapu"], featured: true,
    },
    {
      title: "Bahçelievler Geniş Balkonlu 4+1 Çatı Dubleksi",
      summary: "Panoramik şehir manzaralı 32 m² açık teras, kiler odası ve asansörlü kapalı garaj imkanı.",
      status: "satilik", type: "daire", district: "altieylul", neighborhood: "Bahçelievler", price: 6_800_000,
      areaGross: 210, areaNet: 185, rooms: "4+1", bathrooms: 2, floor: "Çatı Dubleksi", buildingAge: 3, heating: "Kombi (Doğalgaz)",
      deedStatus: "Kat Mülkiyetli", badge: "", features: ["Teras", "Kiler", "Kapalı Garaj", "Asansör"],
      agent: 1, images: ["bahcelievler"], featured: true,
    },
    {
      title: "Kazdağları Eteklerinde Havuzlu Taş Villa",
      summary: "600 m² müstakil bahçe içerisinde, zeytin ağaçlarıyla çevrili, yerden ısıtmalı ve şömineli mimari şaheser.",
      status: "satilik", type: "villa", district: "edremit", neighborhood: "Akçay", price: 14_250_000,
      areaGross: 280, areaNet: 240, rooms: "5+1", bathrooms: 3, floor: "Müstakil", buildingAge: 2, heating: "Yerden Isıtma",
      deedStatus: "Müstakil Tapulu", badge: "Müstakil Havuzlu", features: ["Özel Havuz", "Şömine", "Zeytin Bahçesi", "Yerden Isıtma", "Doğa Manzarası"],
      agent: 2, images: ["kazdaglari", "drone"], featured: true,
    },
    {
      title: "Cunda Manzaralı Restore Edilmiş Tarihi Taş Konak",
      summary: "Aslına sadık kalınarak sarımsak taşıyla restore edilmiş, butik otel veya lüks konut konseptine uygun.",
      status: "satilik", type: "mustakil", district: "ayvalik", neighborhood: "Cunda", price: 22_500_000,
      areaGross: 340, areaNet: 300, rooms: "6+2", bathrooms: 4, floor: "Müstakil", buildingAge: 100, heating: "Klima",
      deedStatus: "Müstakil Tapulu", badge: "Tescilli Yapı", features: ["Deniz Manzarası", "Restore Edilmiş", "Butik Otele Uygun", "Avlu"],
      agent: 2, images: ["cunda", "ayvalik-ev"], featured: true,
    },
    {
      title: "Toygar Yatırımlık İmarlı Konut Arsası",
      summary: "Yol, elektrik ve su altyapısı hazır, 3 kata imarlı, ayrık nizam villa veya butik apartman yapımına uygun.",
      status: "satilik", type: "arsa", district: "karesi", neighborhood: "Toygar", price: 3_200_000,
      areaGross: 650, zoning: "Konut İmarlı, Emsal 0.80", parcel: "", deedStatus: "Müstakil Tapulu",
      badge: "", features: ["Yola Cepheli", "Elektrik", "Su", "3 Kat İmar"],
      agent: 0, images: ["toygar", "arsa-plan"], featured: true,
    },
    {
      title: "Bandırma Yolu Ticari & Depolama Parseli",
      summary: "65 metre ana yol cepheli, lojistik antrepo, fabrika veya toptan satış merkezi için yüksek değer potansiyeli.",
      status: "satilik", type: "ticari-arsa", district: "karesi", neighborhood: "Bandırma Yolu", price: 8_900_000,
      areaGross: 2400, zoning: "Ticari İmarlı", deedStatus: "Müstakil Tapulu",
      badge: "", features: ["65 m Yol Cephesi", "Ana Arter Üzerinde", "Tır Girişine Uygun"],
      agent: 1, images: ["bandirma-yolu"], featured: false,
    },
  ] as const;

  for (const l of listingData) {
    const { agent, images, featured, ...rest } = l;
    const tmp = `tmp-${crypto.randomUUID()}`;
    const id = db
      .insert(listings)
      .values({ ...rest, features: [...rest.features], refNo: tmp, slug: tmp, agentId: agentIds[agent], isFeatured: featured, isPublished: true })
      .returning({ id: listings.id })
      .get().id;
    const refNo = `ER-${1000 + id}`;
    db.update(listings).set({ refNo, slug: `${slugify(l.title)}-${refNo.toLowerCase()}` }).where(eq(listings.id, id)).run();
    for (const [sortOrder, name] of images.entries()) {
      const m = await image(name, l.title);
      db.insert(listingImages).values({ listingId: id, mediaId: m.id, sortOrder }).run();
    }
  }

  const hero = await image("hero", "Balıkesir panoraması");
  saveSettings({
    ...getSettings(),
    heroImageId: hero.id,
    heroText:
      "Karesi, Altıeylül ve Körfez bölgesinde seçkin konutlar, villalar, arsa ve ticari gayrimenkul portföyü ile hayallerinizi güvenle gerçeğe dönüştürüyoruz.",
  });

  console.log(`✓ ${agentData.length} danışman ve ${listingData.length} demo ilan eklendi.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
