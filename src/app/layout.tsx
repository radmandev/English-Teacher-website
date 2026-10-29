import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_NAME, SITE_URL, WHATSAPP_NUMBER } from "@/lib/constants";
import "./globals.css";

const plex = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "فَهْم | افهمها ببساطة", template: "%s | فَهْم" },
  description: "منصة فَهْم لتعلّم الرياضيات واللغة الإنجليزية بشرح واضح وتمارين تفاعلية ومتابعة للتقدّم.",
  openGraph: { siteName: SITE_NAME, locale: "ar_SA", type: "website" },
};

export const viewport: Viewport = { themeColor: "#173B67" };

// ponytail: Arabic-only today. For /en, move routes under app/[lang] and read dir from the param;
// components already use logical (start/end) spacing so they flip without changes.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={plex.variable}>
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) add attributes to <body> */}
      <body className="flex min-h-dvh flex-col font-sans" suppressHydrationWarning>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 btn-primary">تخطَّ إلى المحتوى</a>
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener" aria-label="تواصل معنا عبر واتساب"
          className="fixed bottom-6 left-6 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform">
          <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3s-.9.9-.9 2.2.9 2.5 1 2.7 1.8 2.8 4.4 3.9c1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.5-.3Z" /></svg>
        </a>
      </body>
    </html>
  );
}
