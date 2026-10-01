import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { MEDIA_KEY_RE, UPLOAD_DIR } from "@/lib/media";

// Yüklenen dosyalar `public/` dışında tutulur; `next start` çalışırken eklenen
// dosyaları public'ten sunmaz, ayrıca yedekleme/taşıma için tek klasör yeterli olur.
export async function GET(_req: Request, { params }: RouteContext<"/media/[...path]">) {
  const rel = (await params).path.join("/");
  const match = rel.match(/^(.+)-(sm|md|lg)\.webp$/);
  if (!match || !MEDIA_KEY_RE.test(match[1]!)) return new Response("Not found", { status: 404 });

  const file = path.join(UPLOAD_DIR, rel);
  const stat = await fs.promises.stat(file).catch(() => null);
  if (!stat?.isFile()) return new Response("Not found", { status: 404 });

  return new Response(Readable.toWeb(fs.createReadStream(file)) as ReadableStream, {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(stat.size),
      // Anahtarlar rastgele ve değişmez; dosya güncellenmez, yenisi oluşturulur.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
