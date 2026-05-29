'use client';

import { HistoryDay } from '@/hooks/useMemberHistory';
import { getTodayString } from '@/lib/points';
import { Shimmer, ShimmerLine } from '@/components/ui/Shimmer';
import { cn } from '@/lib/utils';

interface WeekStripProps {
  days: HistoryDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  loading?: boolean;
  compact?: boolean;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function WeekStrip({
  days,
  selectedDate,
  onSelectDate,
  loading,
  compact = false,
}: WeekStripProps) {
  const today = getTodayString();

  if (loading) {
    return (
      <div className={cn('px-5 border-b border-border bg-surface', compact ? 'py-2.5' : 'py-4')}>
        <ShimmerLine className="w-20 h-3 mb-2" />
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Shimmer key={i} className={cn('flex-1 rounded-xl', compact ? 'h-12' : 'h-16')} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('px-5 border-b border-border bg-surface', compact ? 'py-2.5' : 'py-4')}>
      <div className={cn('flex items-center justify-between', compact ? 'mb-2' : 'mb-3')}>
        <p className="section-label">This week</p>
        <p className="text-[10px] text-ink-muted font-medium uppercase tracking-widest">
          Tap a day
        </p>
      </div>
      <div className="flex gap-1.5">
        {days.map((day, i) => {
          const isSelected = day.date === selectedDate;
          const isToday = day.date === today;
          const hasLoggedData = day.log || day.hasActivity;
          const displayScore = hasLoggedData ? day.points.total : 0;
          const fillHeight = Math.min((displayScore / 10) * 100, 100);

          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 rounded-xl transition-all duration-200 min-w-0',
                compact ? 'py-1.5' : 'py-2 gap-1.5',
                isSelected
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-surface-elevated'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-wide',
                  isSelected ? 'text-accent-foreground/75' : 'text-ink-muted'
                )}
              >
                {DAY_LABELS[i] ?? ''}
              </span>

              <div
                className={cn(
                  'rounded-md flex items-end overflow-hidden',
                  compact ? 'w-6 h-7' : 'w-7 h-10',
                  isSelected ? 'bg-accent-foreground/15' : 'bg-surface-elevated border border-border'
                )}
              >
                <div
                  className={cn(
                    'w-full rounded-md transition-all duration-500',
                    isSelected ? 'bg-accent-foreground' : 'bg-ink-muted',
                    fillHeight === 0 && 'opacity-0'
                  )}
                  style={{ height: `${Math.max(fillHeight, fillHeight > 0 ? 12 : 0)}%` }}
                />
              </div>

              <span
                className={cn(
                  'text-[10px] font-bold tabular-nums',
                  isSelected ? 'text-accent-foreground' : isToday ? 'text-ink' : 'text-ink-muted'
                )}
              >
                {day.log || day.hasActivity
                  ? day.points.total.toFixed(0)
                  : '–'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
