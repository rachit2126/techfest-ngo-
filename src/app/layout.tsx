import type { Metadata } from 'next';
import { Inter, Manrope, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingAIAssistant from '@/components/FloatingAIAssistant';
import DevSandboxDrawer from '@/components/DevSandboxDrawer';
import { SAHAY_BRAND } from '@/config/brand';
import { Suspense } from 'react';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: '--font-noto-devanagari',
  subsets: ['devanagari'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: `${SAHAY_BRAND.name} — ${SAHAY_BRAND.tagline} | Transparent Humanitarian Aid & NGO Coordination`,
  description:
    'Sahay connects unused resources and surplus with verified humanitarian organizations with documented needs. Making every contribution count through transparent, accountable coordination.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/brand/favicon-64.png',
  },
  openGraph: {
    title: `${SAHAY_BRAND.name} — ${SAHAY_BRAND.tagline}`,
    description: SAHAY_BRAND.subheadline,
    siteName: SAHAY_BRAND.name,
    images: [{ url: '/brand/sahay-logo-cream.png', width: 800, height: 400 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FCFBF7] text-[#182820] font-sans selection:bg-[#EAF3EC] selection:text-[#075B3C]">
        <Suspense fallback={<div className="h-16 bg-[#FFF9E9] border-b border-[#E3EAE3]" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
        <Suspense fallback={null}>
          <FloatingAIAssistant />
        </Suspense>
        <Suspense fallback={null}>
          <DevSandboxDrawer />
        </Suspense>
      </body>
    </html>
  );
}

