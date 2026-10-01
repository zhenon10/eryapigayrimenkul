import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Badge, PageHeader } from "@/components/panel/ui";
import { countFor, getLandingContent, getLandingCounts } from "@/lib/queries";
import { landingDescription, landingHeading, landingIntro, landingPath, parseLanding } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { LandingForm } from "../landing-form";

export const metadata: Metadata = { title: "Bölge Sayfası Düzenle" };

export default async function EditLandingPage({ params }: PageProps<"/panel/bolge-sayfalari/[...yol]">) {
  const segments = (await params).yol;
  const [status, ...rest] = segments;
  const landing = parseLanding(status ?? "", rest);
  if (!landing) notFound();

  const path = landingPath(landing);
  const count = countFor(getLandingCounts(), landing);
  const company = getSettings().companyName;

  return (
    <>
      <PageHeader
        title={landingHeading(landing)}
        back={{ href: "/panel/bolge-sayfalari", label: "Bölge Sayfaları" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{path}</span>
            <Badge tone={count ? "success" : "neutral"}>{count} ilan</Badge>
            {count === 0 && <span className="text-micro">İlan eklenene kadar sayfa arama motorlarına kapalı kalır.</span>}
          </span>
        }
        action={
          <Link href={path} target="_blank" className="btn-outline">
            Sitede Gör <ExternalLink className="size-4" aria-hidden />
          </Link>
        }
      />
      <LandingForm
        segments={[landing.status, ...(landing.type ? [landing.type] : []), ...(landing.district ? [landing.district] : [])]}
        content={getLandingContent(path)}
        defaults={{ intro: landingIntro(landing, company), description: landingDescription(landing, count, company) }}
      />
    </>
  );
}
