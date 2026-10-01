"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { FormStatus, Panel } from "@/components/panel/ui";
import { useFormAction } from "@/components/panel/use-form-action";
import { Field } from "@/components/site/form-controls";
import type { LandingContent } from "@/db/schema";
import { saveLandingContent } from "./actions";

type Props = {
  segments: string[];
  content: LandingContent | null;
  defaults: { intro: string; description: string };
};

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={`tabular text-micro ${value.length > max ? "font-semibold text-danger" : "text-muted"}`}>
      {value.length}/{max}
    </span>
  );
}

export function LandingForm({ segments, content, defaults }: Props) {
  const { state, onSubmit, pending, errors: e } = useFormAction(saveLandingContent.bind(null, segments));
  const [meta, setMeta] = useState(content?.metaDescription ?? "");
  const [intro, setIntro] = useState(content?.intro ?? "");

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Panel
        title="Arama Sonucu Açıklaması"
        description="Google sonuçlarında başlığın altında görünen metin. Boş bırakılırsa otomatik üretilir."
      >
        <Field label="Meta açıklama" htmlFor="metaDescription" error={e.metaDescription}>
          <textarea
            id="metaDescription"
            name="metaDescription"
            rows={2}
            value={meta}
            onChange={(ev) => setMeta(ev.target.value)}
            placeholder={defaults.description}
            className="field"
          />
        </Field>
        <div className="mt-1 flex justify-between gap-4">
          <span className="text-micro text-muted">İdeal uzunluk 120–160 karakter.</span>
          <Counter value={meta} max={160} />
        </div>
      </Panel>

      <Panel title="Giriş Metni" description="Sayfa başlığının altında görünen 2–3 cümlelik tanıtım. Boş bırakılırsa şablon metin kullanılır.">
        <Field label="Giriş" htmlFor="intro" error={e.intro}>
          <textarea
            id="intro"
            name="intro"
            rows={4}
            value={intro}
            onChange={(ev) => setIntro(ev.target.value)}
            placeholder={defaults.intro}
            className="field"
          />
        </Field>
        <div className="mt-1 flex justify-end">
          <Counter value={intro} max={600} />
        </div>
      </Panel>

      <Panel
        title="Bölge Rehberi"
        description="İlanların altında gösterilen uzun içerik. Bölgeyi gerçekten tanıyan biri tarafından yazılmış özgün metin, sıralamaya en çok katkı sağlayan kısımdır."
      >
        <Field
          label="İçerik"
          htmlFor="body"
          error={e.body}
          hint='Paragrafları boş satırla ayırın. "## " ile başlayan satır ara başlık olur.'
        >
          <textarea
            id="body"
            name="body"
            rows={14}
            defaultValue={content?.body}
            placeholder={"## Ulaşım ve konum\nBölgenin şehir merkezine, okullara ve hastanelere uzaklığı…\n\n## Fiyat aralıkları\nBölgedeki 2+1 ve 3+1 dairelerin güncel kira/satış aralığı…\n\n## Kimler için uygun?\nAileler, öğrenciler, yatırımcılar…"}
            className="field font-mono text-[13px]"
          />
        </Field>
      </Panel>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-line bg-canvas/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end md:-mx-8 md:px-8">
        <FormStatus state={state} />
        <button type="submit" disabled={pending} className="btn-primary sm:w-48">
          <Save className="size-4" aria-hidden /> {pending ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
