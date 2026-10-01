import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
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
    <html lang="tr" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
