# Er Yapı Emlak

Balıkesir merkezli emlak ofisi için kurumsal site ve yönetim paneli.
Görsel dil Stitch'te hazırlanan **Aegean Architectural Prestige** tasarımına dayanır
(lacivert `#0F172A`, amber `#D97706`, Playfair Display + Plus Jakarta Sans).

## Teknoloji

| Katman | Seçim |
| --- | --- |
| Uygulama | Next.js 16 (App Router, Server Actions), React 19, TypeScript |
| Stil | Tailwind CSS v4, tasarım token'ları `src/app/globals.css` içinde |
| Veri | SQLite (better-sqlite3) + Drizzle ORM; migration'lar `drizzle/` altında, ilk bağlantıda otomatik uygulanır |
| Görseller | sharp ile WebP'ye çevrilir (480 / 1024 / 1920 px), `storage/uploads` altında saklanır, `/media/...` üzerinden sunulur |
| Oturum | argon2 şifre özeti + veritabanında saklanan oturum (httpOnly çerez) |

## Kurulum

```bash
npm install
cp .env.example .env.local              # gerekirse düzenleyin
npm run user:create -- --email siz@firma.com --name "Ad Soyad"   # şifre ekrana yazılır
npm run dev                              # http://localhost:3000, panel: /panel
```

Geliştirme için örnek veri isterseniz `npm run seed:demo` (Stitch tasarımındaki 6 ilan ve 3 danışman).
**Bu veriler temsilidir, canlıya taşımayın.**

## Yapı

```
src/
  app/(site)/        Herkese açık sayfalar: ana sayfa, /ilanlar, /ilanlar/[slug], /danismanlar, /degerleme, /iletisim, metin sayfaları
  app/panel/         Yönetim paneli: ilanlar, danışmanlar, talepler, site ayarları, kullanıcılar
  app/media/         Yüklenen görsellerin sunulduğu rota
  app/api/panel/     Görsel yükleme uç noktası
  components/site/   Site bileşenleri (kart, arama, formlar, galeri…)
  components/panel/  Panel bileşenleri
  db/                Drizzle şeması ve bağlantı
  lib/               Sorgular, oturum, görsel işleme, sabitler (ilçeler, ilan tipleri)
scripts/             CLI: kullanıcı oluşturma, demo verisi
```

## İçerik kuralları

- Site ayarlarında (telefon, adres, yetki belge no, rakamlar, KVKK metni vb.) **boş bırakılan her alan sitede gizlenir.**
  Böylece doğrulanmamış rakam ya da örnek iletişim bilgisi yayına çıkmaz.
- KVKK, gizlilik ve hakkımızda sayfaları metin girilene kadar 404 döner ve menüde görünmez.
- Fotoğrafı olmayan ilan yayına alınamaz. İlk fotoğraf kapak olur.
- İlan adresi `başlık-er-1001` biçimindedir; başlık değişirse eski adres yenisine kalıcı olarak yönlendirilir.
- Panelden yapılan her değişiklik sitenin önbelleğini tazeler; sayfalar ayrıca saatte bir yenilenir.

## SEO

- **Bölge/kategori sayfaları:** `/satilik`, `/kiralik/daire`, `/satilik/edremit`, `/satilik/villa/edremit`.
  Başlık, açıklama ve tanıtım metni otomatik üretilir (ör. "Altıeylül Kiralık Daire İlanları – Balıkesir").
  Yayında ilanı olmayan kombinasyonlar ziyaretçiye açıktır ama `noindex` alır ve sitemap'e girmez.
- **Bölge sayfası içeriği** panelde **Bölge Sayfaları** bölümünden girilir. Her sayfa için üç alan var: meta açıklama, giriş metni ve ilanların altında gösterilen "Rehber" içeriği. Boş bırakılan alanlar şablon metne düşer.
- **Kaldırılan ilanlar:** Bir kez yayınlanmış ilan taslağa alınır ya da silinirse eski adresi "Bu ilan yayından kaldırıldı" sayfasını gösterir. Bu sayfa benzer ilanlara ve bölge sayfasına bağlantı verir, `noindex`'tir. Hiç yayınlanmamış taslaklar 404 döner.
- `/ilanlar?durum=…&tip=…&ilce=…` adresleri karşılık gelen bölge sayfasına 308 ile yönlendirilir.
  Fiyat, kelime veya sıralama içeren filtreli adresler `noindex`'tir.
- **Yapılandırılmış veri:**
  - Tüm sayfalarda ofis bilgisi (`RealEstateAgent`; adres ve telefon site ayarlarından gelir).
  - İlanlarda `RealEstateListing` ve `BreadcrumbList`.
  - Bölge sayfalarında `ItemList`.
- **Canlıda mutlaka `SITE_URL` tanımlayın.** Canonical, sitemap ve yapılandırılmış veri adresleri buradan üretilir.
- Yayından sonra:
  - Siteyi Google Search Console'a ekleyip `/sitemap.xml`'i gönderin.
  - Google İşletme Profili'ni açın. İşletme adı, adres ve telefon sitedekiyle birebir aynı olmalı.

## Yayına alma

Uygulama yerel diske yazdığı için (SQLite ve görseller) **kalıcı diski olan tek bir Node sunucusunda** çalıştırılmalıdır
(VPS, Coolify, Docker vb.). Vercel gibi sunucusuz platformlara uygun değildir.

```bash
npm ci && npm run build
SITE_URL=https://www.alanadiniz.com npm start
```

- `data/` (veritabanı) ve `storage/` (görseller) klasörlerini **yedekleyin**; sitenin tüm içeriği bunlardadır.
  Çalışırken güvenli yedek için: `sqlite3 data/eryapi.db ".backup yedek.db"`.
- Önünde nginx varsa görsel yüklemeleri için `client_max_body_size 16m;` ayarlayın.
- Giriş denemesi ve form gönderimi sınırlamaları bellekte tutulur; tek süreçte çalıştırın (cluster/PM2 çoklu süreç kullanmayın).

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` / `npm start` | Production derleme / çalıştırma |
| `npm run typecheck` / `npm run lint` | Tip ve lint kontrolü |
| `npm run db:generate` | Şema değişikliğinden sonra yeni migration üretir |
| `npm run user:create -- --email … --name …` | Panel kullanıcısı ekler ya da şifresini sıfırlar (`PASSWORD=` ile şifre verilebilir) |
| `npm run seed:demo` | Örnek veri (yalnızca geliştirme) |
