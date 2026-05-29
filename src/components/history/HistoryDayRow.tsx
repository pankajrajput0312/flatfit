import { HistoryDay } from '@/hooks/useMemberHistory';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface HistoryDayRowProps {
  day: HistoryDay;
  onClick?: () => void;
}

function formatDayLabel(dateStr: string): string {
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

export default function HistoryDayRow({ day, onClick }: HistoryDayRowProps) {
  return (
    <Card
      className={cn(
        'py-3.5 cursor-pointer hover:border-ink/20 transition-colors overflow-hidden',
        !day.hasActivity && 'opacity-80'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold text-ink truncate">
            {formatDayLabel(day.date)}
          </p>
          {day.hasActivity ? (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {[
                { label: 'Gym', value: day.points.gym },
                { label: 'Protein', value: day.points.protein },
                { label: 'Water', value: day.points.water },
              ].map(({ label, value }) => (
                <span
                  key={label}
                  className="text-[10px] font-medium text-ink-muted bg-surface-elevated border border-border px-2 py-0.5 rounded-full tabular-nums whitespace-nowrap"
                >
                  {label} {value.toFixed(1)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-muted mt-0.5">No activity</p>
          )}
        </div>
        <div className="text-right flex-shrink-0 pl-2">
          <p
            className={cn(
              'font-display text-xl font-bold tabular-nums',
              day.hasActivity ? 'text-ink' : 'text-ink-faint'
            )}
          >
            {day.points.total.toFixed(1)}
          </p>
          <p className="text-[9px] uppercase tracking-widest text-ink-muted font-semibold">/ 10</p>
        </div>
      </div>
    </Card>
  );
}
