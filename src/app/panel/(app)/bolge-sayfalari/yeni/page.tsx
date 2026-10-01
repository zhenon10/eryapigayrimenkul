import { redirect } from "next/navigation";
import { landingPath, parseLanding } from "@/lib/seo";

/** Seçim formunu ilgili düzenleme sayfasına yönlendirir. */
export default async function NewLandingContentPage({ searchParams }: PageProps<"/panel/bolge-sayfalari/yeni">) {
  const sp = await searchParams;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const landing = parseLanding(str(sp.durum), [str(sp.tip), str(sp.ilce)].filter(Boolean));
  redirect(landing ? `/panel/bolge-sayfalari${landingPath(landing)}` : "/panel/bolge-sayfalari");
}
