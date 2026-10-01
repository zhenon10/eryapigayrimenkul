import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s | Er Yapı Panel" },
  robots: { index: false, follow: false },
};

export default function PanelRootLayout({ children }: LayoutProps<"/panel">) {
  return <div className="flex min-h-dvh flex-col bg-canvas">{children}</div>;
}
