'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { DailyLog, Member, PointsBreakdown, LeaderboardPeriod } from '@/types';
import { calculateTotalPoints } from '@/lib/points';
import { getDateRange, enumerateDates, DateRange } from '@/lib/dates';

export interface HistoryDay {
  date: string;
  log: DailyLog | null;
  points: PointsBreakdown;
  hasActivity: boolean;
}

export function useMemberHistory(
  member: Member | null,
  period: LeaderboardPeriod = 'this_month'
) {
  const [days, setDays] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [summary, setSummary] = useState({
    totalPoints: 0,
    daysLogged: 0,
    avgPerDay: 0,
  });

  useEffect(() => {
    if (!member) {
      setLoading(false);
      return;
    }

    const activeMember = member;
    const supabase = createClient();
    const range = getDateRange(period);
    const dates = enumerateDates(range.start, range.end);
    setDateRange(range);

    async function fetchHistory() {
      setLoading(true);
      setError(null);

      try {
        const { data: logsData, error: logsError } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('member_id', activeMember.id)
          .gte('log_date', range.start)
          .lte('log_date', range.end)
          .order('log_date', { ascending: false });

        if (logsError) throw logsError;

        const historyDays: HistoryDay[] = dates
          .slice()
          .reverse()
          .map((dateStr) => {
            const log =
              (logsData || []).find((l: DailyLog) => l.log_date === dateStr) ?? null;
            const date = new Date(dateStr + 'T12:00:00');
            const points = calculateTotalPoints(log, activeMember, date);
            const hasActivity =
              !!log &&
              (log.gym_done || log.water_droplets > 0 || log.protein_g > 0);

            return { date: dateStr, log, points, hasActivity };
          });

        const daysWithActivity = historyDays.filter((d) => d.hasActivity);
        const totalPoints = historyDays.reduce((sum, d) => sum + d.points.total, 0);

        setDays(historyDays);
        setSummary({
          totalPoints: parseFloat(totalPoints.toFixed(1)),
          daysLogged: daysWithActivity.length,
          avgPerDay:
            dates.length > 0
              ? parseFloat((totalPoints / dates.length).toFixed(1))
              : 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [member, period]);

  return { days, loading, error, dateRange, summary };
}
