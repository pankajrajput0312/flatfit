'use client';

import { cn } from '@/lib/utils';

interface DateNavigatorProps {
  date: string;
  isToday: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  className?: string;
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function shiftDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export { shiftDate };

export default function DateNavigator({
  date,
  isToday,
  onPrev,
  onNext,
  onToday,
  className,
}: DateNavigatorProps) {
  const canGoNext = !isToday;

  return (
    <div className={cn('flex items-center justify-between px-5', className)}>
      <button
        onClick={onPrev}
        className="w-9 h-9 rounded-xl border border-border bg-surface-elevated flex items-center justify-center text-ink-muted hover:text-ink hover:border-ink-muted transition-colors"
        aria-label="Previous day"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div className="text-center">
        <p className="font-display text-base font-bold text-ink">{formatDisplayDate(date)}</p>
        {!isToday && (
          <button
            onClick={onToday}
            className="text-[10px] uppercase tracking-widest text-ink-muted hover:text-ink font-semibold mt-0.5 transition-colors"
          >
            Jump to today
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={cn(
          'w-9 h-9 rounded-xl border flex items-center justify-center transition-colors',
          canGoNext
            ? 'border-border bg-surface-elevated text-ink-muted hover:text-ink hover:border-ink-muted'
            : 'border-border text-ink-muted/60 cursor-not-allowed'
        )}
        aria-label="Next day"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
