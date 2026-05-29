'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, TrophyIcon, HistoryIcon, UserIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

const tabs = [
  { name: 'Home', path: '/', Icon: HomeIcon },
  { name: 'Rank', path: '/leaderboard', Icon: TrophyIcon },
  { name: 'History', path: '/history', Icon: HistoryIcon },
  { name: 'Profile', path: '/profile', Icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-surface/95 backdrop-blur-md border-t border-border z-50">
      <div className="flex items-stretch h-[72px] px-1">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.path ||
            (tab.path === '/' && pathname === '/today');
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 gap-1 transition-colors duration-200 relative',
                isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full" />
              )}
              <tab.Icon className={cn('w-5 h-5', isActive && 'stroke-[2.25]')} />
              <span className={cn('text-[9px] font-semibold tracking-wide', isActive && 'text-ink')}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
