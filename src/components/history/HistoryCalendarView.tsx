'use client';

import { HistoryDay } from '@/hooks/useMemberHistory';
import { DateRange, formatMonthYear, formatPeriodRange, getMonthCalendarWeeks, isDateInRange, enumerateDates } from '@/lib/dates';
import { getTodayString } from '@/lib/points';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface HistoryCalendarViewProps {
  days: HistoryDay[];
  dateRange: DateRange;
  onDayClick: (date: string) => void;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HistoryCalendarView({
  days,
  dateRange,
  onDayClick,
}: HistoryCalendarViewProps) {
  const today = getTodayString();
  const dayMap = new Map(days.map((day) => [day.date, day]));
  const weeks = getMonthCalendarWeeks(dateRange.start);
  const isSingleDay = dateRange.start === dateRange.end;
  const isWeekRange = dateRange.dayCount === 7;

  if (isWeekRange) {
    const weekDates = enumerateDates(dateRange.start, dateRange.end);

    return (
      <div className="px-5 py-5">
        <Card className="p-4">
          <p className="font-display text-base font-bold text-ink mb-4">
            {formatPeriodRange(dateRange)}
          </p>

          <div className="grid grid-cols-7 gap-1.5">
            {weekDates.map((dateStr) => {
              const day = dayMap.get(dateStr);
              const dayNumber = parseInt(dateStr.split('-')[2], 10);
              const weekday = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
              });
              const isToday = dateStr === today;
              const hasActivity = day?.hasActivity ?? false;
              const score = day?.points.total ?? 0;
              const fillPct = Math.min((score / 10) * 100, 100);

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => onDayClick(dateStr)}
                  className={cn(
                    'rounded-xl flex flex-col items-center justify-center gap-1 py-3 px-1 transition-all duration-200',
                    'hover:scale-105 active:scale-95',
                    isToday && 'ring-1 ring-accent',
                    hasActivity
                      ? 'bg-surface-elevated border border-border'
                      : 'bg-surface-raised border border-border/60'
                  )}
                >
                  <span className="text-[9px] uppercase tracking-widest text-ink-muted font-semibold">
                    {weekday}
                  </span>
                  <span className={cn('text-sm font-bold tabular-nums', isToday ? 'text-accent' : 'text-ink')}>
                    {dayNumber}
                  </span>
                  {hasActivity ? (
                    <>
                      <div className="w-full h-1 bg-ink-subtle rounded-full overflow-hidden max-w-[32px]">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${Math.max(fillPct, 12)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-ink tabular-nums">{score.toFixed(0)}</span>
                    </>
                  ) : (
                    <span className="text-[9px] text-ink-faint">–</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  if (isSingleDay) {
    const day = dayMap.get(dateRange.start);

    return (
      <div className="px-5 py-5">
        <Card
          className="cursor-pointer hover:border-ink-muted transition-colors"
          onClick={() => onDayClick(dateRange.start)}
        >
          <p className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-2">Today</p>
          <p className="font-display text-3xl font-bold text-ink tabular-nums">
            {day?.points.total.toFixed(1) ?? '0.0'}
            <span className="text-base text-ink-muted font-medium ml-1">/ 10</span>
          </p>
          <p className="text-sm text-ink-muted mt-2">
            {day?.hasActivity ? 'Tap to view log details' : 'No activity logged yet'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <Card className="p-4">
        <p className="font-display text-base font-bold text-ink mb-4">
          {formatMonthYear(dateRange.start)}
        </p>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted text-center py-1"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((dateStr, dayIndex) => {
                if (!dateStr) {
                  return <div key={`empty-${weekIndex}-${dayIndex}`} className="aspect-square" />;
                }

                const inRange = isDateInRange(dateStr, dateRange);
                const day = dayMap.get(dateStr);
                const dayNumber = parseInt(dateStr.split('-')[2], 10);
                const isToday = dateStr === today;
                const hasActivity = day?.hasActivity ?? false;
                const score = day?.points.total ?? 0;
                const fillPct = Math.min((score / 10) * 100, 100);

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={!inRange}
                    onClick={() => inRange && onDayClick(dateStr)}
                    className={cn(
                      'aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all duration-200 min-w-0 p-0.5',
                      inRange
                        ? 'hover:scale-105 active:scale-95 cursor-pointer'
                        : 'opacity-30 cursor-default',
                      isToday && inRange && 'ring-1 ring-accent',
                      inRange && hasActivity
                        ? 'bg-surface-elevated border border-border'
                        : inRange
                          ? 'bg-surface-raised border border-border/60'
                          : 'bg-transparent'
                    )}
                  >
                    <span
                      className={cn(
                        'text-[11px] font-semibold tabular-nums leading-none',
                        isToday && inRange ? 'text-accent' : inRange ? 'text-ink' : 'text-ink-faint'
                      )}
                    >
                      {dayNumber}
                    </span>

                    {inRange && hasActivity ? (
                      <>
                        <div className="w-full h-1 bg-ink-subtle rounded-full overflow-hidden max-w-[28px]">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${Math.max(fillPct, 12)}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-ink tabular-nums leading-none">
                          {score.toFixed(0)}
                        </span>
                      </>
                    ) : inRange ? (
                      <span className="text-[8px] text-ink-faint leading-none">–</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <p className="text-[10px] text-ink-muted text-center uppercase tracking-widest font-medium mt-4">
          Tap a day to open its log
        </p>
      </Card>
    </div>
  );
}
