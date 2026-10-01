import type { Metadata } from "next";
import { ClipboardList, LineChart, PhoneCall } from "lucide-react";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PageHero } from "@/components/site/section";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Ücretsiz Gayrimenkul Değerleme",
  description: "Balıkesir'deki daire, villa, arsa veya iş yeriniz için ücretsiz ve bağlayıcı olmayan piyasa değerlendirmesi alın.",
};

const STEPS = [
  { icon: ClipboardList, title: "Bilgilerinizi bırakın", text: "Mülkünüzün tipini, konumunu ve temel özelliklerini paylaşın." },
  { icon: PhoneCall, title: "Danışmanımız sizi arasın", text: "Eksik bilgileri tamamlayıp gerekirse yerinde inceleme planlayalım." },
  { icon: LineChart, title: "Değerleme raporunuzu alın", text: "Emsal satışlar ve bölge verileriyle hazırlanan fiyat önerisini değerlendirin." },
];

export default function ValuationPage() {
  const s = getSettings();
  return (
    <>
      <PageHero
        eyebrow="Ücretsiz Değerleme"
        title="Mülkünüzün Gerçek Piyasa Değerini Öğrenin"
        text="Satmayı veya kiraya vermeyi düşündüğünüz mülkünüz için uzman ekibimizden ücretsiz, bağlayıcı olmayan bir değerlendirme alın."
      />
      <section className="container-site grid gap-12 py-16 lg:grid-cols-12">
        <ol className="flex flex-col gap-8 lg:col-span-5">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent-tint text-accent-strong">
                <Icon className="size-6" aria-hidden />
              </span>
              <div>
                <p className="text-micro font-bold tracking-[0.08em] text-muted uppercase">Adım {i + 1}</p>
                <h2 className="text-[17px] font-bold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="card p-6 md:p-8 lg:col-span-7">
          <InquiryForm
            kind="degerleme"
            submitLabel="Ücretsiz Değerleme İste"
            messagePlaceholder="Oda sayısı, yaklaşık m², kat, bina yaşı, ada/parsel vb."
            kvkkLink={!!s.kvkkText}
          />
        </div>
      </section>
    </>
  );
}
