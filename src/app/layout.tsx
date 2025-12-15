import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { AuthProvider } from '@/context/AuthContext';
import { ConditionalLayout } from '@/components/layout/ConditionalLayout';

export const metadata: Metadata = {
  title: 'Rainbow Aqua - Premium Aquarium & Exotic Birds Store',
  description: 'India\'s largest ADA aquascaping store and premium hand-raised fancy birds. Shop fish tanks, live plants, air pumps, lovebirds, cockatiels, and more.',
  keywords: 'aquarium, fish tank, ADA, aquascaping, planted tank, fancy birds, lovebirds, cockatiels, budgies, conures, India',
  authors: [{ name: 'Rainbow Aqua' }],
  creator: 'Rainbow Aqua',
  publisher: 'Rainbow Aqua',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://rainbowaqua.in',
    siteName: 'Rainbow Aqua',
    title: 'Rainbow Aqua - Premium Aquarium & Exotic Birds Store',
    description: 'India\'s largest ADA aquascaping store and premium hand-raised fancy birds.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rainbow Aqua Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rainbow Aqua - Premium Aquarium & Exotic Birds Store',
    description: 'India\'s largest ADA aquascaping store and premium hand-raised fancy birds.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <StoreProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

