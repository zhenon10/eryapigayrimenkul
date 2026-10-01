"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { ConfirmButton } from "@/components/panel/confirm-button";
import { ImageUploader, type UploadedImage } from "@/components/panel/image-uploader";
import { Checkbox, FormStatus, Panel } from "@/components/panel/ui";
import { useFormAction } from "@/components/panel/use-form-action";
import { DistrictOptions, Field, Select } from "@/components/site/form-controls";
import { LISTING_STATUSES, LISTING_TYPES, TYPE_GROUPS, isLandType } from "@/lib/constants";
import type { Listing } from "@/db/schema";
import { deleteListing, saveListing } from "./actions";

type Props = {
  listing?: Listing;
  images?: UploadedImage[];
  agents: { id: number; name: string }[];
};

const n = (v: number | null | undefined) => (v == null ? "" : String(v));

export function ListingForm({ listing: l, images = [], agents }: Props) {
  const { state, onSubmit, pending, errors: e } = useFormAction(saveListing.bind(null, l?.id ?? null));
  const [type, setType] = useState(l?.type ?? "daire");
  const land = isLandType(type);

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex min-w-0 flex-col gap-6">
        <Panel title="Temel Bilgiler">
          <div className="grid gap-4">
            <Field label="İlan Başlığı" htmlFor="title" error={e.title}>
              <input id="title" name="title" defaultValue={l?.title} required maxLength={140} className="field" placeholder="Ör. Paşaalanı'nda 3+1 Site İçi Daire" />
            </Field>
            <Field label="Kısa Özet" htmlFor="summary" hint="Kartlarda ve arama sonuçlarında görünür (en fazla 300 karakter)." error={e.summary}>
              <textarea id="summary" name="summary" defaultValue={l?.summary} rows={2} maxLength={300} className="field" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Durum" htmlFor="status" error={e.status}>
                <Select id="status" name="status" defaultValue={l?.status ?? "satilik"}>
                  {LISTING_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Tip" htmlFor="type" error={e.type}>
                <Select id="type" name="type" value={type} onChange={(ev) => setType(ev.target.value)}>
                  {TYPE_GROUPS.map((g) => (
                    <optgroup key={g.value} label={g.label}>
                      {LISTING_TYPES.filter((t) => t.group === g.value).map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </Field>
              <Field label="Fiyat (₺)" htmlFor="price" error={e.price} hint="Kiralıkta aylık kira bedeli.">
                <input id="price" name="price" inputMode="numeric" defaultValue={n(l?.price)} required className="field tabular" placeholder="5.450.000" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="İlçe" htmlFor="district" error={e.district}>
                <Select id="district" name="district" defaultValue={l?.district ?? ""} required>
                  <DistrictOptions placeholder="Seçiniz" />
                </Select>
              </Field>
              <Field label="Mahalle / Semt" htmlFor="neighborhood" error={e.neighborhood}>
                <input id="neighborhood" name="neighborhood" defaultValue={l?.neighborhood} className="field" placeholder="Ör. Paşaalanı" />
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="Fotoğraflar" description="İlk fotoğraf kapak olarak kullanılır. Okları kullanarak sıralayabilirsiniz.">
          <ImageUploader name="images" initial={images} />
          {e.images && <p className="mt-2 text-micro font-semibold text-danger">{e.images}</p>}
        </Panel>

        <Panel title="Özellikler">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Brüt m²" htmlFor="areaGross" error={e.areaGross}>
              <input id="areaGross" name="areaGross" inputMode="numeric" defaultValue={n(l?.areaGross)} className="field tabular" />
            </Field>
            <Field label="Net m²" htmlFor="areaNet" error={e.areaNet}>
              <input id="areaNet" name="areaNet" inputMode="numeric" defaultValue={n(l?.areaNet)} className="field tabular" />
            </Field>
            <Field label="Tapu Durumu" htmlFor="deedStatus" error={e.deedStatus}>
              <input id="deedStatus" name="deedStatus" defaultValue={l?.deedStatus} list="deed-options" className="field" />
            </Field>
            {land ? (
              <>
                <Field label="İmar Durumu" htmlFor="zoning" error={e.zoning} className="sm:col-span-2">
                  <input id="zoning" name="zoning" defaultValue={l?.zoning} className="field" placeholder="Ör. Konut İmarlı, Emsal 1.20" />
                </Field>
                <Field label="Ada / Parsel" htmlFor="parcel" error={e.parcel}>
                  <input id="parcel" name="parcel" defaultValue={l?.parcel} className="field" placeholder="Ör. 123 / 4" />
                </Field>
              </>
            ) : (
              <>
                <Field label="Oda Sayısı" htmlFor="rooms" error={e.rooms}>
                  <input id="rooms" name="rooms" defaultValue={l?.rooms} list="room-options" className="field" placeholder="3+1" />
                </Field>
                <Field label="Banyo Sayısı" htmlFor="bathrooms" error={e.bathrooms}>
                  <input id="bathrooms" name="bathrooms" inputMode="numeric" defaultValue={n(l?.bathrooms)} className="field" />
                </Field>
                <Field label="Bulunduğu Kat" htmlFor="floor" error={e.floor}>
                  <input id="floor" name="floor" defaultValue={l?.floor} className="field" placeholder="Ör. 3 / 8" />
                </Field>
                <Field label="Bina Yaşı" htmlFor="buildingAge" error={e.buildingAge} hint="Sıfır bina için 0">
                  <input id="buildingAge" name="buildingAge" inputMode="numeric" defaultValue={n(l?.buildingAge)} className="field" />
                </Field>
                <Field label="Isıtma" htmlFor="heating" error={e.heating}>
                  <input id="heating" name="heating" defaultValue={l?.heating} list="heating-options" className="field" />
                </Field>
              </>
            )}
            {/* Tip değişince gizlenen alanların değerleri kaybolmasın */}
            {land ? (
              <>
                <input type="hidden" name="rooms" value={l?.rooms ?? ""} />
                <input type="hidden" name="bathrooms" value={n(l?.bathrooms)} />
                <input type="hidden" name="floor" value={l?.floor ?? ""} />
                <input type="hidden" name="buildingAge" value={n(l?.buildingAge)} />
                <input type="hidden" name="heating" value={l?.heating ?? ""} />
              </>
            ) : (
              <>
                <input type="hidden" name="zoning" value={l?.zoning ?? ""} />
                <input type="hidden" name="parcel" value={l?.parcel ?? ""} />
              </>
            )}
          </div>
          <datalist id="room-options">
            {["1+0", "1+1", "2+1", "3+1", "3+2", "4+1", "4+2", "5+1", "6+1"].map((r) => <option key={r} value={r} />)}
          </datalist>
          <datalist id="heating-options">
            {["Kombi (Doğalgaz)", "Merkezi", "Yerden Isıtma", "Klima", "Soba", "Yok"].map((r) => <option key={r} value={r} />)}
          </datalist>
          <datalist id="deed-options">
            {["Kat Mülkiyetli", "Kat İrtifaklı", "Müstakil Tapulu", "Hisseli Tapu", "Arsa Tapulu"].map((r) => <option key={r} value={r} />)}
          </datalist>
        </Panel>

        <Panel title="Açıklama ve Donanım">
          <div className="grid gap-4">
            <Field label="Detaylı Açıklama" htmlFor="description" error={e.description}>
              <textarea id="description" name="description" defaultValue={l?.description} rows={8} className="field" />
            </Field>
            <Field label="Öne Çıkan Özellikler" htmlFor="features" hint="Her satıra bir özellik yazın (ör. Asansör, Kapalı Otopark)." error={e.features}>
              <textarea id="features" name="features" defaultValue={l?.features.join("\n")} rows={5} className="field" />
            </Field>
          </div>
        </Panel>

        <Panel title="Medya ve Konum">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sanal Tur Bağlantısı" htmlFor="virtualTourUrl" error={e.virtualTourUrl}>
              <input id="virtualTourUrl" name="virtualTourUrl" type="url" defaultValue={l?.virtualTourUrl} className="field" placeholder="https://" />
            </Field>
            <Field label="Video Bağlantısı" htmlFor="videoUrl" error={e.videoUrl}>
              <input id="videoUrl" name="videoUrl" type="url" defaultValue={l?.videoUrl} className="field" placeholder="https://youtube.com/…" />
            </Field>
            <Field label="Enlem" htmlFor="lat" error={e.lat} hint="Google Haritalar'da konuma sağ tıklayıp kopyalayabilirsiniz.">
              <input id="lat" name="lat" inputMode="decimal" defaultValue={n(l?.lat)} className="field tabular" placeholder="39.6484" />
            </Field>
            <Field label="Boylam" htmlFor="lng" error={e.lng}>
              <input id="lng" name="lng" inputMode="decimal" defaultValue={n(l?.lng)} className="field tabular" placeholder="27.8826" />
            </Field>
          </div>
        </Panel>
      </div>

      <aside className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
        <Panel title="Yayın">
          <div className="flex flex-col gap-4">
            <Checkbox name="isPublished" label="Sitede yayınla" defaultChecked={l?.isPublished} hint="Kapalıyken ilan taslak olarak kalır." />
            <Checkbox name="isFeatured" label="Öne çıkan ilan" defaultChecked={l?.isFeatured} hint="Ana sayfada üst sıralarda gösterilir." />
            <Field label="Etiket" htmlFor="badge" hint="Kart üzerinde kısa vurgu (ör. Sıfır Bina, Fırsat)." error={e.badge}>
              <input id="badge" name="badge" defaultValue={l?.badge} maxLength={30} className="field" />
            </Field>
            <Field label="Sorumlu Danışman" htmlFor="agentId" error={e.agentId}>
              <Select id="agentId" name="agentId" defaultValue={n(l?.agentId)}>
                <option value="">— Seçilmedi —</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </Field>
            <FormStatus state={state} />
            <button type="submit" disabled={pending} className="btn-primary w-full">
              <Save className="size-4" aria-hidden /> {pending ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </Panel>
        {l && (
          <Panel title="Tehlikeli Bölge">
            <p className="mb-4 text-sm text-muted">İlan ve tüm fotoğrafları kalıcı olarak silinir.</p>
            <ConfirmButton onConfirm={() => deleteListing(l.id)} label="İlanı Sil" />
          </Panel>
        )}
      </aside>
    </form>
  );
}
