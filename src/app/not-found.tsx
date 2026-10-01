import SiteLayout from "./(site)/layout";
import SiteNotFound from "./(site)/not-found";

// Hiçbir rotayla eşleşmeyen adresler de site üst/alt bilgisiyle gösterilsin.
export default function NotFound() {
  return (
    <SiteLayout params={Promise.resolve({})}>
      <SiteNotFound />
    </SiteLayout>
  );
}
