import { LeaderboardEntry, LeaderboardPeriod } from '@/types';
import { getRankQuip } from '@/lib/leaderboardMotivation';
import Card from '@/components/ui/Card';
import { SegmentedProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';

interface RankCardProps {
  entry: LeaderboardEntry;
  period?: LeaderboardPeriod;
  totalMembers?: number;
  leader?: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export default function RankCard({
  entry,
  period = 'today',
  totalMembers = 1,
  leader,
  isCurrentUser = false,
}: RankCardProps) {
  const { rank, member, points, daysLogged, avgPerDay, maxPossible } = entry;
  const isFirst = rank === 1;
  const isTopThree = rank <= 3;
  const isMultiDay = period !== 'today';

  const max = maxPossible ?? 10;
  const segmentTotal = isMultiDay ? max : 10;

  const segments = [
    { value: (points.gym / segmentTotal) * 100, color: 'bg-accent' },
    { value: (points.protein / segmentTotal) * 100, color: 'bg-ink-muted' },
    { value: (points.water / segmentTotal) * 100, color: 'bg-ink-subtle' },
  ];

  const quip = getRankQuip(entry, leader, totalMembers);

  return (
    <Card
      className={cn(
        'animate-fade-up transition-all duration-200 overflow-hidden',
        isFirst && 'border-accent bg-surface-elevated ring-1 ring-accent/40',
        isTopThree && !isFirst && 'border-ink-muted',
        isCurrentUser && !isFirst && 'ring-1 ring-accent/30'
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-lg',
            isFirst
              ? 'bg-accent text-accent-foreground'
              : isTopThree
                ? 'bg-accent text-accent-foreground'
                : 'bg-surface-raised border border-border text-ink-muted'
          )}
        >
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-bold truncate text-ink">
              {member.name}
              {isCurrentUser && (
                <span className="text-[10px] text-ink-muted ml-1.5 uppercase tracking-widest font-semibold">
                  You
                </span>
              )}
            </h3>
            <div className="text-right flex-shrink-0">
              <div className="font-display text-xl font-bold tracking-tight tabular-nums text-ink">
                {points.total.toFixed(1)}
              </div>
              <div className="text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap text-ink-muted">
                {isMultiDay ? `/ ${max}` : '/ 10'}
              </div>
            </div>
          </div>

          {quip && (
            <p className="text-[11px] text-ink-muted italic mt-1.5 leading-snug">{quip}</p>
          )}

          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {[
              { label: 'Gym', value: points.gym },
              { label: 'Protein', value: points.protein },
              { label: 'Water', value: points.water },
            ].map(({ label, value }) => (
              <span
                key={label}
                className="text-xs font-medium tabular-nums whitespace-nowrap text-ink-muted"
              >
                <span className="text-ink-faint">{label}</span>{' '}
                <span className="text-ink font-semibold">{value.toFixed(1)}</span>
              </span>
            ))}
          </div>

          {isMultiDay && (
            <p className="text-xs mt-1.5 font-medium truncate text-ink-muted">
              {daysLogged ?? 0} days · {avgPerDay?.toFixed(1) ?? '0.0'} avg/day
            </p>
          )}
        </div>
      </div>

      <div className="mt-3">
        <SegmentedProgressBar segments={segments} height="h-1.5" />
      </div>
    </Card>
  );
}
