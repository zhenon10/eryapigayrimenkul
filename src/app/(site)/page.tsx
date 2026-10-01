import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Building,
  Camera,
  Clock,
  FileCheck2,
  MapPin,
  Phone,
  Scale,
  Map as MapIcon,
} from "lucide-react";
import { Instagram } from "@/components/icons";
import { MediaImage } from "@/components/media-image";
import { AgentCard } from "@/components/site/agent-card";
import { HeroSearch } from "@/components/site/hero-search";
import { InquiryForm } from "@/components/site/inquiry-form";
import { ListingCard } from "@/components/site/listing-card";
import { SectionHeading } from "@/components/site/section";
import { instagramHref, telHref } from "@/lib/format";
import { getMedia } from "@/lib/media";
import { getAgents, getFeaturedListings } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

const CATEGORY_LINKS = [
  { href: "/ilanlar?durum=satilik&kategori=konut", label: "Satılık Konut" },
  { href: "/ilanlar?durum=kiralik", label: "Kiralık" },
  { href: "/ilanlar?tip=villa", label: "Villalar" },
  { href: "/ilanlar?kategori=arsa", label: "Arsa & Tarla" },
];

const REASONS = [
  {
    icon: Scale,
    title: "Doğru Ekspertiz & Piyasa Değerlemesi",
    text: "Bölgedeki güncel satış verileri ve emsal karşılaştırmalarıyla mülkünüzün gerçek değerini belirliyoruz.",
  },
  {
    icon: FileCheck2,
    title: "Hukuki & Tapu Süreç Yönetimi",
    text: "İpotek, hisseli parsel ve imar kontrollerinden tapu devrine kadar süreci sizin adınıza takip ediyoruz.",
  },
  {
    icon: MapIcon,
    title: "Balıkesir & Körfez Portföy Ağı",
    text: "Karesi ve Altıeylül'den Edremit, Akçay ve Ayvalık'a uzanan geniş alıcı ve mülk sahibi ağı.",
  },
  {
    icon: Camera,
    title: "Profesyonel İlan Sunumu",
    text: "Mülkünüzü nitelikli fotoğraf, detaylı bilgi ve doğru fiyatlamayla hedef alıcıya ulaştırıyoruz.",
  },
];

export default function HomePage() {
  const s = getSettings();
  const heroImage = s.heroImageId ? getMedia(s.heroImageId) : null;
  const listings = getFeaturedListings(6);
  const agents = getAgents().slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-white">
        {heroImage && (
          <div className="absolute inset-0 opacity-50 mix-blend-luminosity" aria-hidden>
            <MediaImage image={heroImage} alt="" sizes="100vw" priority className="size-full object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/20" aria-hidden />
        <div className="pointer-events-none absolute -top-32 right-12 size-96 rounded-full bg-accent/15 blur-3xl" aria-hidden />

        <div className="container-site relative flex flex-col gap-10 pt-16 pb-20 md:pb-28">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-micro font-bold tracking-[0.08em] text-amber-100 uppercase backdrop-blur-md">
              <span className="size-2 animate-pulse rounded-full bg-accent-bright" />
              Balıkesir Gayrimenkul & Yatırım
            </span>
            {s.licenseNo && (
              <span className="hidden items-center gap-1.5 text-micro text-ink-muted sm:inline-flex">
                <BadgeCheck className="size-4 text-accent-bright" aria-hidden />
                Yetki Belge No: {s.licenseNo}
              </span>
            )}
          </div>

          <div className="grid items-end gap-8 lg:grid-cols-12">
            <h1 className="font-display text-[2.25rem] leading-[1.1] font-bold tracking-tight md:text-[3.375rem] lg:col-span-8 lg:text-[3.875rem]">
              {s.heroTitle}{" "}
              {s.heroAccent && <span className="font-normal text-accent-bright italic">{s.heroAccent}</span>}
            </h1>
            <div className="flex flex-col gap-4 pb-2 lg:col-span-4 lg:pl-6">
              {s.heroText && <p className="leading-relaxed text-ink-muted">{s.heroText}</p>}
              <a
                href="#ilanlar"
                className="inline-flex items-center gap-2 self-start text-label font-semibold text-accent-bright underline decoration-accent decoration-2 underline-offset-4 transition hover:text-white"
              >
                Öne Çıkan Portföyü Keşfedin <ArrowDown className="size-4" aria-hidden />
              </a>
            </div>
          </div>

          {s.stats.length > 0 && (
            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
              {s.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse gap-0.5 rounded-xl bg-white/10 p-4 backdrop-blur-md">
                  <dt className="truncate text-micro text-ink-muted">{stat.label}</dt>
                  <dd className="font-display text-headline-sm font-bold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <HeroSearch />
        </div>
      </section>

      {/* ÖNE ÇIKAN İLANLAR */}
      <section id="ilanlar" className="container-site flex flex-col gap-12 py-20">
        <SectionHeading
          eyebrow="Özel Seçki Portföy"
          title="Öne Çıkan Balıkesir Gayrimenkulleri"
          text="Ekspertizi yapılmış, hukuki durumu kontrol edilmiş, yatırım ve yaşam değeri yüksek mülkler."
        >
          <nav aria-label="Kategoriler" className="flex flex-wrap gap-1.5 self-start rounded-xl bg-canvas p-1.5 md:self-end">
            {CATEGORY_LINKS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-lg px-4 py-2 text-label font-semibold text-muted transition hover:bg-white hover:text-ink hover:shadow-sm"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </SectionHeading>

        {listings.length ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i === 0} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-canvas p-10 text-center text-muted">Yakında yeni ilanlar eklenecek.</p>
        )}

        <Link href="/ilanlar" className="btn-outline self-center">
          Tüm Portföyü Görüntüle <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>

      {/* NEDEN BİZ */}
      <section className="bg-canvas py-24">
        <div className="container-site flex flex-col gap-14">
          <SectionHeading
            align="center"
            eyebrow="Kurumsal Güvence"
            title={`Neden ${s.companyName} ile Çalışmalısınız?`}
            text="Gayrimenkul alım, satım ve kiralama süreçlerinde şeffaf, hukuki açıdan güvenli ve sonuç odaklı hizmet."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card flex flex-col gap-4 p-6">
                <span className="flex size-12 items-center justify-center rounded-lg bg-accent-tint text-accent-strong">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="text-[17px] leading-snug font-bold">{title}</h3>
                <p className="text-sm leading-6 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEĞERLEME */}
      <section className="relative overflow-hidden bg-ink py-20 text-white">
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-[28rem] rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <div className="container-site relative grid items-center gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-6">
            <span className="eyebrow text-accent-bright">Ücretsiz Değerleme</span>
            <h2 className="font-display text-headline-md font-semibold md:text-headline">
              Mülkünüzü En Doğru Değerden Satmak veya Kiralamak İster misiniz?
            </h2>
            <p className="leading-7 text-ink-muted">
              Dairesi, villası veya arsası için uzman ekibimizden ücretsiz ve bağlayıcı olmayan piyasa değerlendirmesi alın.
            </p>
            <ul className="flex flex-col gap-3 text-sm">
              {["Güncel emsal satış verileriyle fiyat analizi", "Hızlı satış ve kiralama stratejisi", "Gizlilik içinde, yükümlülük olmadan"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <BadgeCheck className="size-5 text-accent-bright" aria-hidden /> {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="rounded-xl bg-white p-6 text-ink shadow-float md:p-8 lg:col-span-6">
            <h3 className="font-display text-headline-sm font-semibold">Ücretsiz Değerleme Formu</h3>
            <p className="mt-1 mb-6 text-sm text-muted">Bilgilerinizi bırakın, danışmanımız sizi arasın.</p>
            <InquiryForm
              kind="degerleme"
              submitLabel="Ücretsiz Değerleme İste"
              messagePlaceholder="Oda sayısı, yaklaşık m², kat bilgisi vb."
              kvkkLink={!!s.kvkkText}
            />
          </div>
        </div>
      </section>

      {/* DANIŞMANLAR */}
      {agents.length > 0 && (
        <section className="container-site flex flex-col gap-14 py-24">
          <SectionHeading
            eyebrow="Alanında Uzman Kadro"
            title="Balıkesir Gayrimenkul Danışmanlarımız"
            text="Bölge dinamiklerine hâkim, mevzuata vakıf, yetki belgeli danışman kadromuzla tanışın."
          >
            <Link href="/danismanlar" className="btn-outline self-start md:self-end">
              Tüm Danışmanlar <ArrowRight className="size-4" aria-hidden />
            </Link>
          </SectionHeading>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        </section>
      )}

      {/* OFİS */}
      {(s.address || s.mapEmbedUrl) && (
        <section className="bg-canvas py-20">
          <div className="container-site grid gap-8 lg:grid-cols-12">
            <div className="card flex flex-col gap-6 p-8 lg:col-span-5">
              <span className="eyebrow">Ofisimiz</span>
              <h2 className="font-display text-headline-md font-semibold">Ofisimizde Bir Kahve İçelim</h2>
              <p className="text-sm leading-6 text-muted">
                Alım satım kararlarınızı, tapu kayıtları ve mimari planlar eşliğinde birlikte planlayalım.
              </p>
              <ul className="flex flex-col gap-4 text-sm">
                {s.address && (
                  <li className="flex gap-3">
                    <MapPin className="size-5 shrink-0 text-accent" aria-hidden /> {s.address}
                  </li>
                )}
                {s.workingHours && (
                  <li className="flex gap-3">
                    <Clock className="size-5 shrink-0 text-accent" aria-hidden /> {s.workingHours}
                  </li>
                )}
                {s.phone && (
                  <li>
                    <a href={telHref(s.phone)} className="flex gap-3 font-semibold hover:text-accent-strong">
                      <Phone className="size-5 shrink-0 text-accent" aria-hidden /> <span className="tabular">{s.phone}</span>
                    </a>
                  </li>
                )}
                {s.instagram && (
                  <li>
                    <a
                      href={instagramHref(s.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 font-semibold hover:text-accent-strong"
                    >
                      <Instagram className="size-5 shrink-0 text-accent" aria-hidden /> @{s.instagram.replace(/^@/, "")}
                    </a>
                  </li>
                )}
              </ul>
              <div className="mt-auto flex flex-wrap gap-3">
                <Link href="/iletisim" className="btn-primary">
                  İletişim Formu
                </Link>
                {s.mapsLink && (
                  <a href={s.mapsLink} target="_blank" rel="noopener noreferrer" className="btn-outline">
                    <Building className="size-4" aria-hidden /> Yol Tarifi
                  </a>
                )}
              </div>
            </div>
            {s.mapEmbedUrl && (
              <div className="min-h-80 overflow-hidden rounded-xl border border-line lg:col-span-7">
                <iframe
                  src={s.mapEmbedUrl}
                  title="Ofis konumu"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="size-full min-h-80"
                />
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
