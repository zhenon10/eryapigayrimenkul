import { getCurrentUser } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, cleanupOrphanMedia, saveImage } from "@/lib/media";
import { getSettings } from "@/lib/settings";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: Request) {
  if (!(await getCurrentUser())) return Response.json({ error: "Yetkisiz" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Dosya bulunamadı" }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return Response.json({ error: "Dosya 15 MB'tan büyük olamaz" }, { status: 413 });
  if (file.type && !ALLOWED.includes(file.type))
    return Response.json({ error: "Sadece JPG, PNG, WebP veya AVIF yükleyebilirsiniz" }, { status: 415 });

  try {
    const media = await saveImage(Buffer.from(await file.arrayBuffer()), String(form?.get("alt") ?? ""));
    const hero = getSettings().heroImageId;
    void cleanupOrphanMedia(hero ? [hero] : []).catch(() => {});
    return Response.json({ id: media.id, key: media.key, width: media.width, height: media.height, alt: media.alt });
  } catch {
    return Response.json({ error: "Görsel işlenemedi. Dosyanın bozuk olmadığından emin olun." }, { status: 422 });
  }
}
