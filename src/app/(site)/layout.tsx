import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getSettings } from "@/lib/settings";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = getSettings();
  return (
    <>
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        İçeriğe geç
      </a>
      <Header settings={settings} />
      <main id="icerik" className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}
