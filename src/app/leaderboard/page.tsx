'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardPeriod } from '@/types';
import { getCurrentUserId, isAuthenticated } from '@/lib/auth';
import {
  getLeaderboardPreferences,
  setLeaderboardPreferences,
  LeaderboardView,
} from '@/lib/leaderboardPreferences';
import { getLeaderboardHeadline } from '@/lib/leaderboardMotivation';
import PageShell from '@/components/layout/PageShell';
import DarkPageHero, { StatGrid } from '@/components/layout/DarkPageHero';
import BottomNav from '@/components/layout/BottomNav';
import PeriodSelector from '@/components/ui/PeriodSelector';
import LeaderboardViewSelector from '@/components/leaderboard/LeaderboardViewSelector';
import PodiumView from '@/components/leaderboard/PodiumView';
import StandingsView from '@/components/leaderboard/StandingsView';
import RankCard from '@/components/leaderboard/RankCard';
import LeaderboardSkeleton from '@/components/ui/skeletons/LeaderboardSkeleton';
import { Shimmer } from '@/components/ui/Shimmer';
import { formatPeriodRange } from '@/lib/dates';

export default function LeaderboardPage() {
  const router = useRouter();
  const [prefsReady, setPrefsReady] = useState(false);
  const [view, setView] = useState<LeaderboardView>('podium');
  const [period, setPeriod] = useState<LeaderboardPeriod>('today');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { entries, loading, dateRange } = useLeaderboard(period);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const saved = getLeaderboardPreferences();
    setView(saved.view);
    setPeriod(saved.period);
    setCurrentUserId(getCurrentUserId());
    setPrefsReady(true);
  }, [router]);

  const headline = useMemo(
    () => getLeaderboardHeadline(entries, currentUserId, period),
    [entries, currentUserId, period]
  );

  const subtitle = dateRange ? formatPeriodRange(dateRange) : '';
  const leader = entries[0];
  const isMultiDay = period !== 'today';

  const handleViewChange = (nextView: LeaderboardView) => {
    setView(nextView);
    if (prefsReady) setLeaderboardPreferences({ view: nextView });
  };

  const handlePeriodChange = (nextPeriod: LeaderboardPeriod) => {
    setPeriod(nextPeriod);
    if (prefsReady) setLeaderboardPreferences({ period: nextPeriod });
  };

  if (!prefsReady || (loading && entries.length === 0)) {
    return <LeaderboardSkeleton />;
  }

  return (
    <PageShell>
      <DarkPageHero
        title="Leaderboard"
        subtitle={subtitle}
        badge={dateRange?.label}
      >
        <StatGrid
          stats={[
            { label: 'Rivals', value: entries.length },
            {
              label: 'Leader',
              value: leader ? leader.points.total.toFixed(1) : '–',
            },
            {
              label: isMultiDay ? 'Top avg/day' : 'Top score',
              value: leader
                ? isMultiDay
                  ? (leader.avgPerDay?.toFixed(1) ?? '–')
                  : leader.points.total.toFixed(1)
                : '–',
            },
          ]}
        />
      </DarkPageHero>

      <div className="px-5 py-4 border-b border-border bg-surface space-y-3 overflow-hidden">
        <div className="rounded-xl border border-border bg-surface-elevated px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-1">
            Flat banter
          </p>
          <p className="text-sm text-ink leading-relaxed italic">{headline}</p>
        </div>
        <PeriodSelector value={period} onChange={handlePeriodChange} />
        <LeaderboardViewSelector value={view} onChange={handleViewChange} />
      </div>

      {loading ? (
        <div className="px-5 py-5 space-y-3">
          {Array.from({ length: view === 'podium' ? 2 : 4 }).map((_, i) => (
            <Shimmer key={i} className={view === 'podium' ? 'h-48 rounded-2xl' : 'h-[88px] rounded-2xl'} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 px-5">
          <p className="text-ink-muted text-sm italic">
            No scores yet. Someone log a protein shake and start the drama.
          </p>
        </div>
      ) : view === 'podium' ? (
        <PodiumView
          entries={entries}
          period={period}
          currentUserId={currentUserId}
        />
      ) : view === 'standings' ? (
        <StandingsView
          entries={entries}
          period={period}
          currentUserId={currentUserId}
        />
      ) : (
        <div className="px-5 py-5 space-y-3">
          {entries.map((entry, i) => (
            <div key={entry.member.id} style={{ animationDelay: `${i * 60}ms` }}>
              <RankCard
                entry={entry}
                period={period}
                totalMembers={entries.length}
                leader={leader}
                isCurrentUser={entry.member.id === currentUserId}
              />
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </PageShell>
  );
}
