import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/upload', label: 'Upload' },
  { href: '/map', label: 'Map' },
];

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLanding = router.pathname === '/';

  // Landing page: minimal top bar
  if (isLanding) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="font-display text-heading-sm tracking-wide">
              Imperium
            </Link>
            <Link
              href="/dashboard"
              className="text-body-sm text-gray-400 hover:text-white transition-colors"
            >
              Launch app
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Inner pages: left sidebar (desktop) + top bar (mobile)
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-48 bg-black border-r border-[#1a1a1a] z-50 flex-col">
        <div className="px-6 h-14 flex items-center">
          <Link href="/" className="font-display text-heading-sm tracking-wide">
            Imperium
          </Link>
        </div>

        <nav className="flex-1 pt-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block px-6 py-2.5 font-display text-body-sm transition-colors',
                router.pathname === link.href
                  ? 'text-accent border-l-2 border-accent'
                  : 'text-gray-500 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

      </aside>

      {/* Mobile Top Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#1a1a1a]">
        <div className="px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="font-display text-heading-sm tracking-wide">
              Imperium
            </Link>
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black border-t border-[#1a1a1a]"
            >
              <div className="px-6 py-4 space-y-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'block py-2 text-body-sm',
                      router.pathname === link.href
                        ? 'text-accent'
                        : 'text-gray-400 hover:text-white'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-[#1a1a1a]">
                  <ConnectButton
                    chainStatus="none"
                    showBalance={false}
                    accountStatus="avatar"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
