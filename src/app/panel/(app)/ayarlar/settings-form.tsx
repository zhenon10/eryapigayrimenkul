"use client";

import { Save } from "lucide-react";
import { ImageUploader, type UploadedImage } from "@/components/panel/image-uploader";
import { FormStatus, Panel } from "@/components/panel/ui";
import { useFormAction } from "@/components/panel/use-form-action";
import { Field } from "@/components/site/form-controls";
import type { SiteSettings } from "@/lib/settings-schema";
import { saveSiteSettings } from "./actions";

export function SettingsForm({ settings: s, heroImage }: { settings: SiteSettings; heroImage: UploadedImage | null }) {
  const { state, onSubmit, pending, errors: e } = useFormAction(saveSiteSettings);

  const input = (name: keyof SiteSettings, label: string, opts: { hint?: string; placeholder?: string; type?: string; wide?: boolean } = {}) => (
    <Field label={label} htmlFor={name} hint={opts.hint} error={e[name]} className={opts.wide ? "sm:col-span-2" : undefined}>
      <input id={name} name={name} type={opts.type ?? "text"} defaultValue={String(s[name] ?? "")} placeholder={opts.placeholder} className="field" />
    </Field>
  );
  const area = (name: keyof SiteSettings, label: string, rows: number, hint?: string) => (
    <Field label={label} htmlFor={name} hint={hint} error={e[name]}>
      <textarea id={name} name={name} defaultValue={String(s[name] ?? "")} rows={rows} className="field" />
    </Field>
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Panel title="Firma ve İletişim" description="Boş bırakılan bilgiler sitede gösterilmez.">
        <div className="grid gap-4 sm:grid-cols-2">
          {input("companyName", "Firma Adı")}
          {input("licenseNo", "Yetki Belge No", { hint: "Ticaret Bakanlığı taşınmaz ticareti yetki belgesi." })}
          {input("phone", "Telefon", { placeholder: "0266 000 00 00", type: "tel" })}
          {input("whatsapp", "WhatsApp Numarası", { placeholder: "0532 000 00 00", type: "tel" })}
          {input("email", "E-posta", { type: "email" })}
          {input("instagram", "Instagram Kullanıcı Adı", { placeholder: "eryapiemlak" })}
          {input("address", "Adres", { wide: true })}
          {input("workingHours", "Çalışma Saatleri", { placeholder: "Pzt – Cmt 09:00 – 19:00" })}
          {input("serviceArea", "Hizmet Bölgesi", { placeholder: "Balıkesir, Karesi & Altıeylül" })}
          {input("mapsLink", "Google Haritalar Bağlantısı", { hint: "Yol tarifi düğmesi için.", type: "url" })}
          {input("mapEmbedUrl", "Harita Yerleştirme Kodu", {
            hint: "Google Haritalar → Paylaş → Haritayı yerleştir → HTML kodunu olduğu gibi yapıştırın.",
          })}
        </div>
      </Panel>

      <Panel title="Ana Sayfa Giriş Bölümü">
        <div className="grid gap-4 sm:grid-cols-2">
          {input("heroTitle", "Başlık", { wide: true })}
          {input("tagline", "Slogan")}
          <div className="sm:col-span-2">{area("heroText", "Tanıtım Metni", 3, "Giriş bölümünde ve alt bilgide görünür.")}</div>
          <div className="sm:col-span-2">
            <span className="label mb-1.5 block">Arka Plan Fotoğrafı</span>
            <ImageUploader name="heroImage" multiple={false} initial={heroImage ? [heroImage] : []} />
          </div>
        </div>
      </Panel>

      <Panel title="Rakamlarla Biz" description="En fazla 4 kutu. Yalnızca doğrulanabilir, gerçek rakamlar girin; boş bırakılırsa bölüm gizlenir.">
        <div className="grid gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-[8rem_1fr] gap-3">
              <input name={`statValue${i}`} defaultValue={s.stats[i]?.value} placeholder="Ör. 12+" aria-label={`Rakam ${i + 1}`} maxLength={20} className="field" />
              <input name={`statLabel${i}`} defaultValue={s.stats[i]?.label} placeholder="Ör. Yıllık Tecrübe" aria-label={`Açıklama ${i + 1}`} maxLength={60} className="field" />
              {e[`stat${i}`] && <p className="col-span-2 text-micro font-semibold text-danger">{e[`stat${i}`]}</p>}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Sayfa Metinleri" description="Metin girilmeyen sayfalar sitede yayınlanmaz ve menüde görünmez.">
        <div className="grid gap-4">
          {area("aboutText", "Hakkımızda", 8)}
          {area("kvkkText", "KVKK Aydınlatma Metni", 10, "Formlardaki onay kutusu bu metne bağlantı verir. Hukuk danışmanınızca hazırlanmalıdır.")}
          {area("privacyText", "Gizlilik Politikası", 10)}
        </div>
      </Panel>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-line bg-canvas/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end md:-mx-8 md:px-8">
        <FormStatus state={state} />
        <button type="submit" disabled={pending} className="btn-primary sm:w-48">
          <Save className="size-4" aria-hidden /> {pending ? "Kaydediliyor…" : "Ayarları Kaydet"}
        </button>
      </div>
    </form>
  );
}
