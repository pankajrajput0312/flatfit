import { LeaderboardPeriod } from '@/types';

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;
  label: string;
  dayCount: number;
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Monday of the week containing the given date */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function countDays(start: string, end: string): number {
  const s = parseDate(start);
  const e = parseDate(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function getDateRange(period: LeaderboardPeriod, ref: Date = new Date()): DateRange {
  const today = new Date(ref);
  today.setHours(0, 0, 0, 0);

  switch (period) {
    case 'today': {
      const start = toDateString(today);
      return { start, end: start, label: 'Today', dayCount: 1 };
    }
    case 'this_week': {
      const start = getWeekStart(today);
      const end = getWeekEnd(start);
      const startStr = toDateString(start);
      const endStr = toDateString(end);
      return { start: startStr, end: endStr, label: 'This Week', dayCount: countDays(startStr, endStr) };
    }
    case 'last_week': {
      const thisWeekStart = getWeekStart(today);
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = getWeekEnd(lastWeekStart);
      const startStr = toDateString(lastWeekStart);
      const endStr = toDateString(lastWeekEnd);
      return { start: startStr, end: endStr, label: 'Last Week', dayCount: 7 };
    }
    case 'this_month': {
      const start = getMonthStart(today);
      const end = getMonthEnd(today);
      const startStr = toDateString(start);
      const endStr = toDateString(end);
      return { start: startStr, end: endStr, label: 'This Month', dayCount: countDays(startStr, endStr) };
    }
    case 'last_month': {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const start = getMonthStart(lastMonth);
      const end = getMonthEnd(lastMonth);
      const startStr = toDateString(start);
      const endStr = toDateString(end);
      const monthName = start.toLocaleDateString('en-US', { month: 'short' });
      return {
        start: startStr,
        end: endStr,
        label: `Last Month (${monthName})`,
        dayCount: countDays(startStr, endStr),
      };
    }
  }
}

/** All YYYY-MM-DD strings from start to end inclusive */
export function enumerateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = parseDate(start);
  const endDate = parseDate(end);

  while (current <= endDate) {
    dates.push(toDateString(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function formatPeriodRange(range: DateRange): string {
  if (range.start === range.end) return range.start;
  const fmt = (d: string) => {
    const date = parseDate(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  return `${fmt(range.start)} – ${fmt(range.end)}`;
}

export function isDateInRange(date: string, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

/** Monday-based month calendar grid; empty strings are padding cells. */
export function getMonthCalendarWeeks(referenceDateStr: string): string[][] {
  const reference = parseDate(referenceDateStr);
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const weeks: string[][] = [];
  let week: string[] = Array(startPad).fill('');

  for (let day = 1; day <= lastDay.getDate(); day++) {
    week.push(toDateString(new Date(year, month, day)));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push('');
    weeks.push(week);
  }

  return weeks;
}

export function formatMonthYear(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
