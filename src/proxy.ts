import { NextResponse, type NextRequest } from "next/server";

// Sadece hızlı yönlendirme: çerez yoksa giriş sayfasına gönder.
// Oturumun geçerliliği panel düzeninde ve her server action'da veritabanından doğrulanır.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/panel/giris") return NextResponse.next();
  if (request.cookies.has("eryapi_session")) return NextResponse.next();
  return NextResponse.redirect(new URL("/panel/giris", request.url));
}

// /api/panel bilerek kapsam dışında: proxy istek gövdesini 10 MB'ta keser (görsel yükleme),
// bu rotalar oturumu zaten kendisi doğrular.
export const config = {
  matcher: ["/panel/:path*"],
};
