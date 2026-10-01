import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";

/** Görünür sayfa yolu + aynı yolun BreadcrumbList işaretlemesi. Son öğe mevcut sayfadır. */
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <div className="border-b border-line bg-canvas">
      <JsonLd data={breadcrumbLd(items)} />
      <nav aria-label="Sayfa yolu" className="container-site flex items-center gap-1.5 overflow-x-auto py-3 text-micro whitespace-nowrap text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <span key={item.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
              {last ? (
                <span className="truncate text-ink" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-ink">
                  {item.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
