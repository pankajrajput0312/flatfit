'use client';

import { LeaderboardView } from '@/lib/leaderboardPreferences';
import { cn } from '@/lib/utils';

interface LeaderboardViewSelectorProps {
  value: LeaderboardView;
  onChange: (view: LeaderboardView) => void;
}

const VIEWS: { id: LeaderboardView; label: string }[] = [
  { id: 'podium', label: 'Podium' },
  { id: 'standings', label: 'Standings' },
  { id: 'detail', label: 'Detail' },
];

export default function LeaderboardViewSelector({
  value,
  onChange,
}: LeaderboardViewSelectorProps) {
  return (
    <div className="flex gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border">
      {VIEWS.map((view) => {
        const isActive = value === view.id;
        return (
          <button
            key={view.id}
            onClick={() => onChange(view.id)}
            className={cn(
              'flex-1 py-2 px-2 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all duration-200',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            {view.label}
          </button>
        );
      })}
    </div>
  );
}
