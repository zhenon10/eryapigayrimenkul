import { Building2, MapPin, Search, Wallet } from "lucide-react";
import { DistrictOptions, Field, SegmentedRadio, Select, TypeOptions } from "./form-controls";
import { GetForm } from "./get-form";

const STATUS_TABS = [
  { value: "", label: "Tümü" },
  { value: "satilik", label: "Satılık" },
  { value: "kiralik", label: "Kiralık" },
] as const;

export function HeroSearch() {
  return (
    <GetForm action="/ilanlar" className="rounded-xl bg-white p-4 text-ink shadow-float md:p-6" role="search">
      <div className="mb-4">
        <SegmentedRadio name="durum" options={STATUS_TABS} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <Field
          label="İlçe / Bölge"
          htmlFor="hs-ilce"
          icon={<MapPin className="size-4 text-accent" aria-hidden />}
          className="lg:col-span-3"
        >
          <Select id="hs-ilce" name="ilce">
            <DistrictOptions placeholder="Tüm Balıkesir" />
          </Select>
        </Field>
        <Field
          label="Gayrimenkul Tipi"
          htmlFor="hs-tip"
          icon={<Building2 className="size-4 text-accent" aria-hidden />}
          className="lg:col-span-3"
        >
          <Select id="hs-tip" name="tip">
            <TypeOptions />
          </Select>
        </Field>
        <fieldset className="hidden flex-col gap-1.5 sm:col-span-2 sm:flex lg:col-span-4">
          <legend className="label mb-1.5 flex items-center gap-1.5">
            <Wallet className="size-4 text-accent" aria-hidden />
            Fiyat Aralığı (₺)
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <input name="min" inputMode="numeric" placeholder="En az" aria-label="En az fiyat" className="field" />
            <input name="max" inputMode="numeric" placeholder="En çok" aria-label="En çok fiyat" className="field" />
          </div>
        </fieldset>
        <div className="flex items-end sm:col-span-2 lg:col-span-2">
          <button type="submit" className="btn-accent w-full font-bold">
            <Search className="size-4" aria-hidden />
            İlanları Listele
          </button>
        </div>
      </div>
    </GetForm>
  );
}
