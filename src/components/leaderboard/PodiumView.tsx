'use client';

import { LeaderboardEntry, LeaderboardPeriod } from '@/types';
import { getGapLabel, getRankQuip } from '@/lib/leaderboardMotivation';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface PodiumViewProps {
  entries: LeaderboardEntry[];
  period: LeaderboardPeriod;
  currentUserId: string | null;
}

function PodiumSlot({
  entry,
  place,
  height,
  leader,
  totalMembers,
  currentUserId,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
  height: string;
  leader: LeaderboardEntry;
  totalMembers: number;
  currentUserId: string | null;
}) {
  const isMe = entry.member.id === currentUserId;
  const quip = getRankQuip(entry, leader, totalMembers);

  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <div
        className={cn(
          'w-full rounded-t-2xl flex flex-col items-center justify-end px-2 pb-3 pt-4 border border-b-0 transition-all',
          height,
          place === 1 && 'bg-accent/15 border-accent/50',
          place === 2 && 'bg-surface-elevated border-border',
          place === 3 && 'bg-surface-elevated border-border',
          isMe && 'ring-1 ring-accent/60'
        )}
      >
        <span
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm mb-2',
            place === 1 && 'bg-accent text-accent-foreground',
            place === 2 && 'bg-ink-muted text-surface',
            place === 3 && 'bg-ink-subtle text-ink'
          )}
        >
          {place}
        </span>
        <p className="font-display text-sm font-bold text-ink truncate max-w-full text-center">
          {entry.member.name}
        </p>
        <p className="font-display text-2xl font-bold text-ink tabular-nums mt-1">
          {entry.points.total.toFixed(1)}
        </p>
        {quip && (
          <p className="text-[9px] text-ink-muted text-center mt-1.5 line-clamp-2 leading-snug px-1">
            {quip}
          </p>
        )}
      </div>
      <div
        className={cn(
          'w-full h-2 rounded-b-lg',
          place === 1 && 'bg-accent/30',
          place === 2 && 'bg-border',
          place === 3 && 'bg-border/70'
        )}
      />
    </div>
  );
}

export default function PodiumView({
  entries,
  period,
  currentUserId,
}: PodiumViewProps) {
  const leader = entries[0];
  const isMultiDay = period !== 'today';
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  const ordered =
    topThree.length === 3
      ? [topThree[1], topThree[0], topThree[2]]
      : topThree.length === 2
        ? [topThree[1], topThree[0], null]
        : topThree.length === 1
          ? [null, topThree[0], null]
          : [];

  if (!leader) return null;

  return (
    <div className="px-5 py-5 space-y-4">
      <Card className="p-4 bg-surface-elevated/50">
        <p className="section-label mb-4 text-center">Top 3</p>
        <div className="flex items-end gap-2 min-h-[180px]">
          {ordered.map((entry, i) => {
            const place = (i === 1 ? 1 : i === 0 ? 2 : 3) as 1 | 2 | 3;
            const height = place === 1 ? 'min-h-[160px]' : place === 2 ? 'min-h-[130px]' : 'min-h-[110px]';

            if (!entry) {
              return <div key={place} className="flex-1" />;
            }

            return (
              <PodiumSlot
                key={entry.member.id}
                entry={entry}
                place={place}
                height={height}
                leader={leader}
                totalMembers={entries.length}
                currentUserId={currentUserId}
              />
            );
          })}
        </div>
      </Card>

      {rest.length > 0 && (
        <div className="space-y-2">
          <p className="section-label px-1">The rest of the flat</p>
          {rest.map((entry) => {
            const isMe = entry.member.id === currentUserId;
            const quip = getRankQuip(entry, leader, entries.length);

            return (
              <Card
                key={entry.member.id}
                className={cn(
                  'py-3 px-4 flex items-center gap-3',
                  isMe && 'ring-1 ring-accent/40 border-accent/30'
                )}
              >
                <span className="w-8 text-center font-display font-bold text-ink-muted tabular-nums">
                  {entry.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink truncate">
                    {entry.member.name}
                    {isMe && (
                      <span className="text-[10px] text-ink-muted ml-1.5 uppercase tracking-widest">
                        You
                      </span>
                    )}
                  </p>
                  {quip && (
                    <p className="text-[10px] text-ink-muted truncate mt-0.5">{quip}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-ink tabular-nums">
                    {entry.points.total.toFixed(1)}
                  </p>
                  <p className="text-[9px] text-ink-faint uppercase tracking-widest">
                    {getGapLabel(entry, leader)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {isMultiDay && leader && (
        <p className="text-[10px] text-ink-muted text-center uppercase tracking-widest">
          {leader.member.name} · {leader.avgPerDay?.toFixed(1) ?? '0.0'} avg/day
        </p>
      )}
    </div>
  );
}
