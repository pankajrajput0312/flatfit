'use client';

import { LeaderboardEntry, LeaderboardPeriod } from '@/types';
import { getGapLabel, getRankQuip } from '@/lib/leaderboardMotivation';
import { cn } from '@/lib/utils';

interface StandingsViewProps {
  entries: LeaderboardEntry[];
  period: LeaderboardPeriod;
  currentUserId: string | null;
}

export default function StandingsView({
  entries,
  period,
  currentUserId,
}: StandingsViewProps) {
  const leader = entries[0];
  const leaderScore = leader?.points.total ?? 1;
  const isMultiDay = period !== 'today';

  return (
    <div className="px-5 py-5">
      <div className="rounded-2xl border border-border overflow-hidden bg-surface-raised">
        <div className="grid grid-cols-[2rem_1fr_3.5rem] gap-x-3 px-4 py-2.5 border-b border-border bg-surface-elevated/80">
          <span className="text-[9px] uppercase tracking-widest text-ink-muted font-semibold">
            #
          </span>
          <span className="text-[9px] uppercase tracking-widest text-ink-muted font-semibold">
            Member
          </span>
          <span className="text-[9px] uppercase tracking-widest text-ink-muted font-semibold text-right">
            Pts
          </span>
        </div>

        <div className="divide-y divide-border">
          {entries.map((entry) => {
            const isMe = entry.member.id === currentUserId;
            const isLeader = entry.rank === 1;
            const pct = Math.max((entry.points.total / leaderScore) * 100, 4);
            const quip = getRankQuip(entry, leader, entries.length);

            return (
              <div
                key={entry.member.id}
                className={cn(
                  'px-4 py-3.5 transition-colors',
                  isMe && 'bg-accent/5',
                  isLeader && !isMe && 'bg-surface-elevated/40'
                )}
              >
                <div className="grid grid-cols-[2rem_1fr_3.5rem] gap-x-3 items-center mb-2">
                  <span
                    className={cn(
                      'font-display font-bold tabular-nums text-sm',
                      isLeader ? 'text-accent' : 'text-ink-muted'
                    )}
                  >
                    {entry.rank}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-ink truncate">
                      {entry.member.name}
                      {isMe && (
                        <span className="ml-1.5 text-[10px] text-ink-muted uppercase tracking-widest">
                          You
                        </span>
                      )}
                    </p>
                    {quip && (
                      <p className="text-[10px] text-ink-muted truncate mt-0.5 italic">
                        {quip}
                      </p>
                    )}
                  </div>
                  <span className="font-display font-bold text-ink tabular-nums text-right">
                    {entry.points.total.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-2 pl-11">
                  <div className="flex-1 h-1.5 bg-ink-subtle rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isLeader ? 'bg-accent' : 'bg-ink-muted'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-ink-faint tabular-nums w-16 text-right flex-shrink-0 uppercase tracking-wide">
                    {getGapLabel(entry, leader)}
                  </span>
                </div>

                {isMultiDay && (
                  <p className="text-[10px] text-ink-faint mt-1.5 pl-11">
                    {entry.daysLogged ?? 0} days · {entry.avgPerDay?.toFixed(1) ?? '0.0'} avg/day
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
