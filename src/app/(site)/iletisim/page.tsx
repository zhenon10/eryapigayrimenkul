import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PageHero } from "@/components/site/section";
import { telHref, whatsappHref } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "İletişim",
  description: "Er Yapı Emlak ile iletişime geçin: adres, telefon, WhatsApp ve iletişim formu.",
};

export default function ContactPage() {
  const s = getSettings();
  const items = [
    s.address && { icon: MapPin, label: "Adres", value: s.address, href: s.mapsLink || undefined },
    s.phone && { icon: Phone, label: "Telefon", value: s.phone, href: telHref(s.phone) },
    s.whatsapp && { icon: MessageCircle, label: "WhatsApp", value: "Mesaj gönderin", href: whatsappHref(s.whatsapp) },
    s.email && { icon: Mail, label: "E-posta", value: s.email, href: `mailto:${s.email}` },
    s.workingHours && { icon: Clock, label: "Çalışma Saatleri", value: s.workingHours },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHero title="İletişim" text="Alım, satım ve kiralama talepleriniz için arayın, yazın ya da ofisimize uğrayın." />
      <section className="container-site grid gap-10 py-16 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          {items.map(({ icon: Icon, label, value, href }) => {
            const body = (
              <>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent-tint text-accent-strong">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="flex flex-col">
                  <span className="text-micro font-bold tracking-[0.08em] text-muted uppercase">{label}</span>
                  <span className="font-semibold">{value}</span>
                </span>
              </>
            );
            return href ? (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="card flex items-center gap-4 p-4 transition hover:shadow-card-hover"
              >
                {body}
              </a>
            ) : (
              <div key={label} className="card flex items-center gap-4 p-4">
                {body}
              </div>
            );
          })}
          {s.mapEmbedUrl && (
            <div className="overflow-hidden rounded-xl border border-line">
              <iframe src={s.mapEmbedUrl} title="Ofis konumu" loading="lazy" className="h-72 w-full" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
        </div>
        <div className="card p-6 md:p-8 lg:col-span-7">
          <h2 className="mb-6 font-display text-headline-sm font-semibold">Bize yazın</h2>
          <InquiryForm kind="iletisim" kvkkLink={!!s.kvkkText} />
        </div>
      </section>
    </>
  );
}
