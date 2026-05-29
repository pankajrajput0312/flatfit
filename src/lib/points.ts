import { DailyLog, Member, PointsBreakdown } from '@/types';

export const WATER_GLASS_COUNT = 8;
export const MAX_GYM_POINTS = 5;
export const MAX_PROTEIN_POINTS = 3;
export const MAX_WATER_POINTS = 2;
export const MAX_DAILY_POINTS = 10;

/**
 * Check if a given date is a gym day for a member
 * @param gymDays Array of day indices (0 = Monday, 6 = Sunday)
 * @param date The date to check
 * @returns true if it's a gym day
 */
export function isGymDay(gymDays: number[], date: Date): boolean {
  // Get day of week: 0 = Sunday, 1 = Monday, etc.
  const dayOfWeek = date.getDay();
  // Convert to our format: 0 = Monday, 6 = Sunday
  const ourDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return gymDays.includes(ourDayIndex);
}

/**
 * Calculate gym points
 * @param gymDone Whether gym was marked as done
 * @param isGymDay Whether today is a gym day for this member
 * @returns Gym points (0-5)
 */
export function calculateGymPoints(gymDone: boolean, isGymDay: boolean): number {
  if (!isGymDay) {
    // Rest day - auto award 5 points
    return 5;
  }
  return gymDone ? 5 : 0;
}

/**
 * Calculate protein points
 * @param actual Actual protein consumed in grams
 * @param target Target protein in grams
 * @returns Protein points (0-3), capped at 3.0
 */
export function calculateProteinPoints(actual: number, target: number): number {
  if (target === 0) return 0;
  const points = (actual / target) * 3;
  return Math.min(points, 3.0);
}

/**
 * Calculate water points
 * @param droplets Number of droplets filled (0–8)
 * @returns Water points (0–2)
 */
export function calculateWaterPoints(droplets: number): number {
  return (droplets / WATER_GLASS_COUNT) * MAX_WATER_POINTS;
}

/**
 * Calculate total points and breakdown for a member's daily log
 * @param log Daily log (can be null for empty log)
 * @param member Member data
 * @param date Date to calculate for (defaults to today)
 * @returns Points breakdown with total
 */
export function calculateTotalPoints(
  log: DailyLog | null,
  member: Member,
  date: Date = new Date()
): PointsBreakdown {
  const gymDone = log?.gym_done ?? false;
  const waterDroplets = log?.water_droplets ?? 0;
  const proteinG = log?.protein_g ?? 0;

  const isGymDayToday = isGymDay(member.gym_days, date);

  const gym = calculateGymPoints(gymDone, isGymDayToday);
  const protein = calculateProteinPoints(proteinG, member.protein_target_g);
  const water = calculateWaterPoints(waterDroplets);
  const total = gym + protein + water;

  return {
    gym: parseFloat(gym.toFixed(1)),
    protein: parseFloat(protein.toFixed(1)),
    water: parseFloat(water.toFixed(1)),
    total: parseFloat(total.toFixed(1)),
  };
}

/**
 * Sum points across a date range using daily logs
 */
export function aggregatePeriodPoints(
  logs: DailyLog[],
  member: Member,
  dates: string[]
): PointsBreakdown & { daysLogged: number; avgPerDay: number } {
  let gym = 0;
  let protein = 0;
  let water = 0;
  let daysLogged = 0;

  for (const dateStr of dates) {
    const log = logs.find((l) => l.log_date === dateStr) ?? null;
    const date = new Date(dateStr + 'T12:00:00');
    const dayPoints = calculateTotalPoints(log, member, date);

    gym += dayPoints.gym;
    protein += dayPoints.protein;
    water += dayPoints.water;

    if (log && (log.gym_done || log.water_droplets > 0 || log.protein_g > 0)) {
      daysLogged += 1;
    }
  }

  const total = gym + protein + water;
  const avgPerDay = dates.length > 0 ? total / dates.length : 0;

  return {
    gym: parseFloat(gym.toFixed(1)),
    protein: parseFloat(protein.toFixed(1)),
    water: parseFloat(water.toFixed(1)),
    total: parseFloat(total.toFixed(1)),
    daysLogged,
    avgPerDay: parseFloat(avgPerDay.toFixed(1)),
  };
}

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format liters to display string
 * @param liters Number of liters
 * @returns Formatted string like "2.5L"
 */
export function formatLiters(liters: number): string {
  return `${liters.toFixed(1)}L`;
}

/**
 * Format grams to display string
 * @param grams Number of grams
 * @returns Formatted string like "120g"
 */
export function formatGrams(grams: number): string {
  return `${grams}g`;
}
