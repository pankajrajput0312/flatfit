import { HistoryDay } from '@/hooks/useMemberHistory';
import { Member } from '@/types';
import { calculateTotalPoints } from '@/lib/points';
import { getDateRange, enumerateDates } from '@/lib/dates';

/** Build week view from fetched history, filling gaps with calculated scores (no hardcoded zeros). */
export function buildWeekStripDays(
  weekDays: HistoryDay[],
  member: Member | null
): HistoryDay[] {
  if (!member) return [];

  const range = getDateRange('this_week');
  const dates = enumerateDates(range.start, range.end);
  const dayMap = new Map(weekDays.map((day) => [day.date, day]));

  return dates.map((dateStr) => {
    const existing = dayMap.get(dateStr);
    if (existing) return existing;

    const date = new Date(dateStr + 'T12:00:00');
    const points = calculateTotalPoints(null, member, date);

    return {
      date: dateStr,
      log: null,
      points,
      hasActivity: false,
    };
  });
}
