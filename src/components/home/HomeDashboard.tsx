'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDailyLog } from '@/hooks/useDailyLog';
import { useMemberHistory } from '@/hooks/useMemberHistory';
import { useActiveMember } from '@/hooks/useActiveMember';
import { calculateTotalPoints, isGymDay, getTodayString } from '@/lib/points';
import { formatHeaderDate } from '@/lib/greeting';
import { buildWeekStripDays } from '@/lib/weekDays';
import PageShell from '@/components/layout/PageShell';
import BottomNav from '@/components/layout/BottomNav';
import { shiftDate } from '@/components/ui/DateNavigator';
import HomeHero from '@/components/home/HomeHero';
import WeekStrip from '@/components/home/WeekStrip';
import DailyLogPanel from '@/components/home/DailyLogPanel';
import HomeSkeleton, { LogPanelSkeleton } from '@/components/ui/skeletons/HomeSkeleton';

function HomeContent() {
  const searchParams = useSearchParams();
  const { members, activeMember, activeMemberId, setActiveMemberId, loading: membersLoading } =
    useActiveMember();
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  useEffect(() => {
    const dateParam = searchParams.get('date');
    const memberParam = searchParams.get('member');
    if (dateParam) setSelectedDate(dateParam);
    if (memberParam) setActiveMemberId(memberParam);
  }, [searchParams, setActiveMemberId]);

  const { log, updateLog, isToday, loading: logLoading } = useDailyLog(
    activeMemberId,
    selectedDate
  );

  const { days: weekDays, loading: weekLoading } = useMemberHistory(
    activeMember,
    'this_week'
  );

  const weekStripDays = useMemo(
    () => buildWeekStripDays(weekDays, activeMember),
    [weekDays, activeMember]
  );

  if (membersLoading) return <HomeSkeleton />;

  if (!activeMember) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <p className="text-ink-muted text-center text-sm">
          No profile found. Sign in or complete onboarding to start logging.
        </p>
      </div>
    );
  }

  const logDate = new Date(selectedDate + 'T12:00:00');
  const points = calculateTotalPoints(log, activeMember, logDate);
  const isGymDayToday = isGymDay(activeMember.gym_days, logDate);
  const displayDate = new Date(selectedDate + 'T12:00:00');

  return (
    <PageShell>
      <HomeHero
        dateLabel={formatHeaderDate(displayDate)}
        points={points}
        member={activeMember}
        droplets={log?.water_droplets || 0}
        proteinG={log?.protein_g || 0}
        isGymDay={isGymDayToday}
        gymDone={log?.gym_done || false}
        isToday={isToday}
        members={members}
        activeMemberId={activeMemberId}
        onMemberChange={setActiveMemberId}
        onPrevDate={() => setSelectedDate(shiftDate(selectedDate, -1))}
        onNextDate={() => setSelectedDate(shiftDate(selectedDate, 1))}
        onToday={() => setSelectedDate(getTodayString())}
        canGoNext={!isToday}
      />

      <WeekStrip
        days={weekStripDays}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        loading={weekLoading}
        compact
      />

      <div className="px-5 py-4">
        {logLoading ? (
          <LogPanelSkeleton />
        ) : (
          <DailyLogPanel
            isGymDay={isGymDayToday}
            gymDays={activeMember.gym_days}
            gymDone={log?.gym_done || false}
            onGymToggle={() => updateLog({ gym_done: !log?.gym_done })}
            droplets={log?.water_droplets || 0}
            waterTarget={activeMember.water_target_l}
            onWaterUpdate={(droplets) => updateLog({ water_droplets: droplets })}
            proteinG={log?.protein_g || 0}
            proteinTarget={activeMember.protein_target_g}
            onProteinUpdate={(grams) => updateLog({ protein_g: grams })}
            isToday={isToday}
          />
        )}
      </div>

      <BottomNav />
    </PageShell>
  );
}

export default function HomeDashboard() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
