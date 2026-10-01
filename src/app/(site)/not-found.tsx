import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-site flex flex-1 flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="eyebrow">404</span>
      <h1 className="font-display text-headline-md font-semibold md:text-headline">Aradığınız sayfa bulunamadı</h1>
      <p className="max-w-md text-muted">İlan yayından kaldırılmış ya da adres değişmiş olabilir.</p>
      <div className="flex gap-3">
        <Link href="/" className="btn-outline">
          Ana Sayfa
        </Link>
        <Link href="/ilanlar" className="btn-primary">
          Tüm İlanlar
        </Link>
      </div>
    </section>
  );
}
