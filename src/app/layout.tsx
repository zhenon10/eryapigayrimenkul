import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

// Başlıklar için sakin, editoryal bir serif; Playfair'in yüksek kontrastlı "lüks" görünümünden kaçınır.
const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Er Yapı Emlak | Balıkesir Satılık ve Kiralık Emlak İlanları", template: "%s | Er Yapı Emlak" },
  description:
    "Balıkesir Karesi, Altıeylül ve Körfez bölgesinde satılık ve kiralık konut, villa, arsa ve ticari gayrimenkul portföyü.",
  openGraph: { locale: "tr_TR", type: "website", siteName: "Er Yapı Emlak" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${serif.variable} ${jakarta.variable}`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
