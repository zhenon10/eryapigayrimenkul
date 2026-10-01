"use client";

import { Save } from "lucide-react";
import { ConfirmButton } from "@/components/panel/confirm-button";
import { ImageUploader, type UploadedImage } from "@/components/panel/image-uploader";
import { Checkbox, FormStatus, Panel } from "@/components/panel/ui";
import { useFormAction } from "@/components/panel/use-form-action";
import { Field } from "@/components/site/form-controls";
import type { Agent } from "@/db/schema";
import { deleteAgent, saveAgent } from "./actions";

export function AgentForm({ agent: a, photo, listingCount = 0 }: { agent?: Agent; photo?: UploadedImage | null; listingCount?: number }) {
  const { state, onSubmit, pending, errors: e } = useFormAction(saveAgent.bind(null, a?.id ?? null));

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex min-w-0 flex-col gap-6">
        <Panel title="Kişisel Bilgiler">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ad Soyad" htmlFor="name" error={e.name}>
              <input id="name" name="name" defaultValue={a?.name} required className="field" />
            </Field>
            <Field label="Unvan" htmlFor="title" error={e.title}>
              <input id="title" name="title" defaultValue={a?.title} className="field" placeholder="Ör. Kıdemli Gayrimenkul Danışmanı" />
            </Field>
            <Field label="Uzmanlık / Bölge" htmlFor="specialty" error={e.specialty} className="sm:col-span-2">
              <input id="specialty" name="specialty" defaultValue={a?.specialty} className="field" placeholder="Ör. Karesi & Altıeylül konut uzmanı" />
            </Field>
            <Field label="Hakkında" htmlFor="bio" error={e.bio} className="sm:col-span-2">
              <textarea id="bio" name="bio" defaultValue={a?.bio} rows={6} className="field" />
            </Field>
          </div>
        </Panel>
        <Panel title="İletişim" description="Boş bırakılan bilgiler sitede gösterilmez.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Telefon" htmlFor="phone" error={e.phone}>
              <input id="phone" name="phone" type="tel" defaultValue={a?.phone} className="field" placeholder="0532 000 00 00" />
            </Field>
            <Field label="WhatsApp" htmlFor="whatsapp" error={e.whatsapp}>
              <input id="whatsapp" name="whatsapp" type="tel" defaultValue={a?.whatsapp} className="field" placeholder="0532 000 00 00" />
            </Field>
            <Field label="E-posta" htmlFor="email" error={e.email}>
              <input id="email" name="email" type="email" defaultValue={a?.email} className="field" />
            </Field>
          </div>
        </Panel>
      </div>
      <aside className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
        <Panel title="Fotoğraf">
          <ImageUploader name="photo" multiple={false} initial={photo ? [photo] : []} />
        </Panel>
        <Panel title="Yayın">
          <div className="flex flex-col gap-4">
            <Checkbox name="isActive" label="Sitede göster" defaultChecked={a?.isActive ?? true} />
            <Field label="Sıra" htmlFor="sortOrder" hint="Küçük sayı önce gösterilir." error={e.sortOrder}>
              <input id="sortOrder" name="sortOrder" type="number" min={0} max={999} defaultValue={a?.sortOrder ?? 0} className="field" />
            </Field>
            <FormStatus state={state} />
            <button type="submit" disabled={pending} className="btn-primary w-full">
              <Save className="size-4" aria-hidden /> {pending ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </Panel>
        {a && (
          <Panel title="Tehlikeli Bölge">
            <p className="mb-4 text-sm text-muted">
              Danışman silinir{listingCount > 0 && `; bağlı ${listingCount} ilan danışmansız kalır`}.
            </p>
            <ConfirmButton onConfirm={() => deleteAgent(a.id)} label="Danışmanı Sil" />
          </Panel>
        )}
      </aside>
    </form>
  );
}
