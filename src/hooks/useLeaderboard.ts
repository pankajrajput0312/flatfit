'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Member,
  DailyLog,
  LeaderboardEntry,
  LeaderboardPeriod,
} from '@/types';
import { calculateTotalPoints, aggregatePeriodPoints, getTodayString } from '@/lib/points';
import { getDateRange, enumerateDates, DateRange } from '@/lib/dates';

export function useLeaderboard(period: LeaderboardPeriod = 'today') {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const range = getDateRange(period);
    const dates = enumerateDates(range.start, range.end);
    setDateRange(range);

    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .order('name');

        if (membersError) throw membersError;

        const { data: logsData, error: logsError } = await supabase
          .from('daily_logs')
          .select('*')
          .gte('log_date', range.start)
          .lte('log_date', range.end);

        if (logsError) throw logsError;

        const isSingleDay = period === 'today';

        const leaderboardEntries: LeaderboardEntry[] = (membersData || []).map(
          (member: Member) => {
            const memberLogs = (logsData || []).filter(
              (l: DailyLog) => l.member_id === member.id
            );

            if (isSingleDay) {
              const log = memberLogs[0] ?? null;
              const points = calculateTotalPoints(log, member);
              return {
                member,
                log,
                points,
                rank: 0,
                daysLogged: log ? 1 : 0,
                avgPerDay: points.total,
                maxPossible: 10,
              };
            }

            const aggregated = aggregatePeriodPoints(memberLogs, member, dates);
            const maxPossible = dates.length * 10;

            return {
              member,
              log: null,
              points: {
                gym: aggregated.gym,
                protein: aggregated.protein,
                water: aggregated.water,
                total: aggregated.total,
              },
              rank: 0,
              daysLogged: aggregated.daysLogged,
              avgPerDay: aggregated.avgPerDay,
              maxPossible,
            };
          }
        );

        leaderboardEntries.sort((a, b) => {
          if (b.points.total !== a.points.total) {
            return b.points.total - a.points.total;
          }
          return a.member.name.localeCompare(b.member.name);
        });

        leaderboardEntries.forEach((entry, index) => {
          entry.rank = index + 1;
        });

        setEntries(leaderboardEntries);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();

    if (period !== 'today') {
      return;
    }

    const today = getTodayString();
    const channel = supabase
      .channel(`daily_logs_leaderboard_${today}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_logs',
          filter: `log_date=eq.${today}`,
        },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [period]);

  return { entries, loading, error, dateRange };
}
