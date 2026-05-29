'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMemberHistory } from '@/hooks/useMemberHistory';
import { useActiveMember } from '@/hooks/useActiveMember';
import { LeaderboardPeriod } from '@/types';
import {
  getHistoryPreferences,
  setHistoryPreferences,
  HistoryView,
} from '@/lib/historyPreferences';
import PageShell from '@/components/layout/PageShell';
import DarkPageHero, { StatGrid } from '@/components/layout/DarkPageHero';
import BottomNav from '@/components/layout/BottomNav';
import MemberSwitcher from '@/components/layout/MemberSwitcher';
import PeriodSelector from '@/components/ui/PeriodSelector';
import HistoryViewSelector from '@/components/history/HistoryViewSelector';
import HistoryDayRow from '@/components/history/HistoryDayRow';
import HistoryCalendarView from '@/components/history/HistoryCalendarView';
import HistorySkeleton, { HistoryContentSkeleton } from '@/components/ui/skeletons/HistorySkeleton';
import { formatPeriodRange } from '@/lib/dates';

export default function HistoryPage() {
  const router = useRouter();
  const { members, activeMember, activeMemberId, setActiveMemberId, loading: membersLoading } =
    useActiveMember();
  const [prefsReady, setPrefsReady] = useState(false);
  const [view, setView] = useState<HistoryView>('list');
  const [period, setPeriod] = useState<LeaderboardPeriod>('this_month');

  useEffect(() => {
    const saved = getHistoryPreferences();
    setView(saved.view);
    setPeriod(saved.period);
    if (saved.memberId) {
      setActiveMemberId(saved.memberId);
    }

    const params = new URLSearchParams(window.location.search);
    const memberParam = params.get('member');
    if (memberParam) setActiveMemberId(memberParam);

    setPrefsReady(true);
  }, [setActiveMemberId]);

  const persistPreferences = useCallback(
    (updates: Partial<{ view: HistoryView; period: LeaderboardPeriod; memberId: string | null }>) => {
      if (!prefsReady) return;
      setHistoryPreferences(updates);
    },
    [prefsReady]
  );

  const handleViewChange = (nextView: HistoryView) => {
    setView(nextView);
    persistPreferences({ view: nextView });
  };

  const handlePeriodChange = (nextPeriod: LeaderboardPeriod) => {
    setPeriod(nextPeriod);
    persistPreferences({ period: nextPeriod });
  };

  const handleMemberChange = (memberId: string) => {
    setActiveMemberId(memberId);
    persistPreferences({ memberId });
  };

  const { days, loading, dateRange, summary } = useMemberHistory(activeMember, period);

  const handleDayClick = (date: string) => {
    router.push(`/?date=${date}&member=${activeMemberId}`);
  };

  if (membersLoading || !prefsReady) {
    return <HistorySkeleton />;
  }

  if (!activeMember) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <p className="text-ink-muted text-center text-sm">
          No profile found. Sign in or complete onboarding to view history.
        </p>
      </div>
    );
  }

  return (
    <PageShell>
      <DarkPageHero
        title={activeMember.name}
        subtitle={dateRange ? formatPeriodRange(dateRange) : 'Past activity'}
        badge={dateRange?.label}
      >
        {!loading && (
          <StatGrid
            stats={[
              { label: 'Total pts', value: summary.totalPoints },
              { label: 'Days logged', value: summary.daysLogged },
              { label: 'Avg/day', value: summary.avgPerDay },
            ]}
          />
        )}
      </DarkPageHero>

      <div className="px-5 py-4 border-b border-border bg-surface space-y-3 overflow-hidden">
        <MemberSwitcher
          members={members}
          activeMemberId={activeMemberId}
          onMemberChange={handleMemberChange}
        />
        <PeriodSelector value={period} onChange={handlePeriodChange} />
        <HistoryViewSelector value={view} onChange={handleViewChange} />
      </div>

      {loading ? (
        <HistoryContentSkeleton view={view} />
      ) : days.length === 0 ? (
        <div className="text-center py-16 px-5">
          <p className="text-ink-muted text-sm">No data for this period</p>
        </div>
      ) : view === 'calendar' && dateRange ? (
        <HistoryCalendarView
          days={days}
          dateRange={dateRange}
          onDayClick={handleDayClick}
        />
      ) : (
        <div className="px-5 py-5 space-y-2">
          {days.map((day) => (
            <HistoryDayRow
              key={day.date}
              day={day}
              onClick={() => handleDayClick(day.date)}
            />
          ))}
        </div>
      )}

      <BottomNav />
    </PageShell>
  );
}
