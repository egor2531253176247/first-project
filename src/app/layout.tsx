import type { Metadata } from "next";
import { Navbar, Footer, CookieConsent, AmbientUI } from "@/components/shell";
import { getCatalog } from "@/lib/db";
import "./globals.css";
import { Analytics } from "@/components/analytics";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: {
    default: "PRECISION — Automotive Performance Studio",
    template: "%s / PRECISION",
  },
  description:
    "Премиальный автомобильный детейлинг: PPF, винил, покраска, полировка и керамика. Рассчитайте проект и запишитесь в студию.",
  ...(process.env.STUDIO_URL
    ? { metadataBase: new URL(process.env.STUDIO_URL) }
    : {}),
  openGraph: {
    title: "PRECISION / Performance in every detail",
    description: "PPF · WRAP · PAINT · DETAILING",
    type: "website",
    locale: "ru_RU",
    ...(process.env.STUDIO_URL
      ? {
          images: [
            {
              url: "/images/hero.webp",
              width: 1672,
              height: 941,
              alt: "PRECISION / Automotive Performance Studio",
            },
          ],
        }
      : {}),
  },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = getCatalog();
  return (
    <html lang="ru">
      <head>
        <link
          rel="preload"
          href="/fonts/barlow-condensed.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Перейти к содержимому
        </a>
        <Navbar settings={settings} />
        <main id="main">{children}</main>
        <Footer settings={settings} />
        <AmbientUI />
        <CookieConsent />
        <Analytics id={process.env.STUDIO_GA_ID} />
      </body>
    </html>
  );
}
