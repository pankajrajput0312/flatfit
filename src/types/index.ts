// Database types matching Supabase schema

export interface Member {
  id: string;
  email: string;
  password_hash?: string;
  name: string;
  gym_days: number[]; // 0 = Monday, 6 = Sunday
  water_target_l: number;
  protein_target_g: number;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  member_id: string;
  log_date: string; // YYYY-MM-DD
  gym_done: boolean;
  water_droplets: number; // 0-8
  protein_g: number;
  created_at: string;
  updated_at: string;
}

// Computed types for UI
export interface PointsBreakdown {
  gym: number;
  protein: number;
  water: number;
  total: number;
}

export type LeaderboardPeriod =
  | 'today'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month';

export interface LeaderboardEntry {
  member: Member;
  log: DailyLog | null;
  points: PointsBreakdown;
  rank: number;
  daysLogged?: number;
  avgPerDay?: number;
  maxPossible?: number;
}

export const LEADERBOARD_PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'This Week' },
  { id: 'last_week', label: 'Last Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
];

export interface OnboardingData {
  name: string;
  gym_days: number[];
  water_target_l: number;
  protein_target_g: number;
}

// Day of week constants
export const DAYS_OF_WEEK = [
  { index: 0, short: 'Mon', full: 'Monday' },
  { index: 1, short: 'Tue', full: 'Tuesday' },
  { index: 2, short: 'Wed', full: 'Wednesday' },
  { index: 3, short: 'Thu', full: 'Thursday' },
  { index: 4, short: 'Fri', full: 'Friday' },
  { index: 5, short: 'Sat', full: 'Saturday' },
  { index: 6, short: 'Sun', full: 'Sunday' },
] as const;
