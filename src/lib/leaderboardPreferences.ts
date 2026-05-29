import { LeaderboardPeriod } from '@/types';

export type LeaderboardView = 'podium' | 'standings' | 'detail';

export interface LeaderboardPreferences {
  view: LeaderboardView;
  period: LeaderboardPeriod;
}

const COOKIE_NAME = 'flatfit_leaderboard_prefs';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const VALID_VIEWS: LeaderboardView[] = ['podium', 'standings', 'detail'];
const VALID_PERIODS: LeaderboardPeriod[] = [
  'today',
  'this_week',
  'last_week',
  'this_month',
  'last_month',
];

const DEFAULT_PREFERENCES: LeaderboardPreferences = {
  view: 'podium',
  period: 'today',
};

function parseCookieValue(): LeaderboardPreferences | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  if (!match) return null;

  try {
    const raw = decodeURIComponent(match.split('=').slice(1).join('='));
    const parsed = JSON.parse(raw) as Partial<LeaderboardPreferences>;

    return {
      view: VALID_VIEWS.includes(parsed.view as LeaderboardView)
        ? (parsed.view as LeaderboardView)
        : DEFAULT_PREFERENCES.view,
      period: VALID_PERIODS.includes(parsed.period as LeaderboardPeriod)
        ? (parsed.period as LeaderboardPeriod)
        : DEFAULT_PREFERENCES.period,
    };
  } catch {
    return null;
  }
}

export function getLeaderboardPreferences(): LeaderboardPreferences {
  return parseCookieValue() ?? DEFAULT_PREFERENCES;
}

export function setLeaderboardPreferences(prefs: Partial<LeaderboardPreferences>): void {
  if (typeof document === 'undefined') return;

  const current = getLeaderboardPreferences();
  const next: LeaderboardPreferences = {
    view: prefs.view ?? current.view,
    period: prefs.period ?? current.period,
  };

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}
