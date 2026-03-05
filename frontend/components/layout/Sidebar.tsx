import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

interface SidebarLink {
  href: string;
  label: string;
}

interface SidebarProps {
  links: SidebarLink[];
}

export default function Sidebar({ links }: SidebarProps) {
  const router = useRouter();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#1a1a1a] bg-black min-h-[calc(100vh-4rem)]">
      <nav className="p-6 space-y-1">
        {links.map((link) => {
          const isActive = router.pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block px-4 py-3 font-display text-body transition-colors',
                isActive
                  ? 'text-accent border-l-2 border-l-accent'
                  : 'text-gray-400 hover:text-white border-l-2 border-l-transparent'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
