'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { AuthModal } from './AuthModal';
import { CartDrawer } from './CartDrawer';
import { WhatsAppButton } from './WhatsAppButton';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    // Admin pages: no header/footer/user UI components
    return <>{children}</>;
  }

  // User website: full header/footer
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <AuthModal />
      <CartDrawer />
      <WhatsAppButton />
    </>
  );
}
