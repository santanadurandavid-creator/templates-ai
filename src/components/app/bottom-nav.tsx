'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  BookText,
  StickyNote,
  Bot,
  Ticket,
  FileText,
  Table,
  AreaChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/', label: 'Plantillas', icon: LayoutGrid },
  { href: '/process', label: 'Proceso', icon: BookText },
  { href: '/notes', label: 'Notas', icon: StickyNote },
  { href: '/simulation', label: 'Simulación', icon: Bot },
  { href: '/jiras', label: 'Jiras', icon: Ticket },
  { href: '/forms', label: 'Forms', icon: FileText },
  { href: '/sheets', label: 'Sheets', icon: Table },
  { href: '/dashboard', label: 'Dashboard', icon: AreaChart },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-t-lg z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => { // Show only 5 items on mobile
            const isActive = pathname === href;
            return (
              <Link href={href} key={label} className="flex flex-col items-center justify-center text-center flex-1 p-1">
                <Icon
                  className={cn(
                    'w-6 h-6 mb-1 transition-colors',
                    isActive ? 'text-accent' : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-medium transition-colors',
                     isActive ? 'text-accent' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Side Nav */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-card border-r border-border flex-col items-center py-4 z-50">
        <div className="mb-8">
            <Bot className="h-8 w-8 text-accent" />
        </div>
        <TooltipProvider>
          <ul className="flex flex-col items-center space-y-4">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center justify-center h-12 w-12 rounded-lg transition-colors',
                          isActive
                            ? 'bg-accent/20 text-accent'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </TooltipProvider>
      </aside>
    </>
  );
}
