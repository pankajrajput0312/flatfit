import { LeaderboardPeriod } from '@/types';

export type HistoryView = 'list' | 'calendar';

export interface HistoryPreferences {
  view: HistoryView;
  period: LeaderboardPeriod;
  memberId: string | null;
}

const COOKIE_NAME = 'flatfit_history_prefs';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const VALID_VIEWS: HistoryView[] = ['list', 'calendar'];
const VALID_PERIODS: LeaderboardPeriod[] = [
  'today',
  'this_week',
  'last_week',
  'this_month',
  'last_month',
];

const DEFAULT_PREFERENCES: HistoryPreferences = {
  view: 'list',
  period: 'this_month',
  memberId: null,
};

function parseCookieValue(): HistoryPreferences | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  if (!match) return null;

  try {
    const raw = decodeURIComponent(match.split('=').slice(1).join('='));
    const parsed = JSON.parse(raw) as Partial<HistoryPreferences>;

    return {
      view: VALID_VIEWS.includes(parsed.view as HistoryView)
        ? (parsed.view as HistoryView)
        : DEFAULT_PREFERENCES.view,
      period: VALID_PERIODS.includes(parsed.period as LeaderboardPeriod)
        ? (parsed.period as LeaderboardPeriod)
        : DEFAULT_PREFERENCES.period,
      memberId: typeof parsed.memberId === 'string' ? parsed.memberId : null,
    };
  } catch {
    return null;
  }
}

export function getHistoryPreferences(): HistoryPreferences {
  return parseCookieValue() ?? DEFAULT_PREFERENCES;
}

export function setHistoryPreferences(prefs: Partial<HistoryPreferences>): void {
  if (typeof document === 'undefined') return;

  const current = getHistoryPreferences();
  const next: HistoryPreferences = {
    view: prefs.view ?? current.view,
    period: prefs.period ?? current.period,
    memberId: prefs.memberId !== undefined ? prefs.memberId : current.memberId,
  };

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}
