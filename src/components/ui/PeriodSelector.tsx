'use client';

import { LeaderboardPeriod, LEADERBOARD_PERIODS } from '@/types';
import ScrollRow from '@/components/ui/ScrollRow';
import { cn } from '@/lib/utils';

interface PeriodSelectorProps {
  value: LeaderboardPeriod;
  onChange: (period: LeaderboardPeriod) => void;
  className?: string;
  dark?: boolean;
}

export default function PeriodSelector({
  value,
  onChange,
  className,
  dark = false,
}: PeriodSelectorProps) {
  return (
    <ScrollRow className={className} inset={!dark}>
      {LEADERBOARD_PERIODS.map((period) => {
        const isActive = value === period.id;
        return (
          <button
            key={period.id}
            onClick={() => onChange(period.id)}
            className={cn(
              'px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 uppercase tracking-wide flex-shrink-0',
              isActive
                ? 'bg-accent text-accent-foreground'
                : dark
                  ? 'bg-white/10 text-white/80 border border-white/20 hover:border-white/35'
                  : 'bg-surface-elevated text-ink-muted border border-border hover:border-ink-muted'
            )}
          >
            {period.label}
          </button>
        );
      })}
    </ScrollRow>
  );
}
