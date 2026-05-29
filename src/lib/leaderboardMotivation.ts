import { LeaderboardEntry, LeaderboardPeriod } from '@/types';

const FIRST_PLACE = [
  'King of the flat. Try not to let it go to your head.',
  'You’re #1. The rest are just your warm-up crew.',
  'Top of the board. Someone tell the protein shakes who’s boss.',
  'Leading the pack. Very on-brand for someone who actually logged today.',
];

const LAST_PLACE = [
  'Dead last. At least you’re consistent at something.',
  'Rock bottom has great leg room. Climb when ready.',
  'Someone has to hold the ladder. Thanks for volunteering.',
  'Last place is still a place. Barely.',
];

const MIDDLE_PACK = [
  'Comfortably mid. The beige sofa of rankings.',
  'Not winning, not losing. Peak neutrality.',
  'Middle of the pack — where ambition goes to nap.',
  'Solidly average. Your flatmates are unimpressed but not surprised.',
];

const CLOSE_SECOND = [
  'So close you can smell their protein powder.',
  'One good gym day away from stealing the crown.',
  'Almost there. Don’t trip on the finish line.',
  'Breathing down their neck. Slightly creepy, very competitive.',
];

const FAR_BEHIND = [
  'The leader called. They said good luck with that.',
  'Gap’s wide. Maybe start with one glass of water.',
  'Not unreachable — just… enthusiastically distant.',
  'Plenty of room to improve. And by plenty, we mean all of it.',
];

const ZERO_SCORE = [
  'Zero points. Bold strategy. Let’s see if it pays off.',
  'Nothing logged. The leaderboard appreciates your humility.',
  'A perfect 0.0. Iconic, honestly.',
  'Ghost mode activated. The flat barely knows you’re competing.',
];

const SOLO = [
  'Only one on the board. Congrats on winning your imaginary rivalry.',
  'Solo leaderboard. The competition is… you, from yesterday.',
];

const EMPTY = [
  'No scores yet. First one to log wins by default. Low bar.',
];


function pickStable<T>(items: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return items[hash % items.length];
}

export function getLeaderboardHeadline(
  entries: LeaderboardEntry[],
  currentUserId: string | null,
  period: LeaderboardPeriod
): string {
  if (entries.length === 0) return pickStable(EMPTY, `empty-${period}`);
  if (entries.length === 1) return pickStable(SOLO, `solo-${period}`);

  const leader = entries[0];
  const periodLabel =
    period === 'today' ? 'today' : period.replace('_', ' ');

  if (currentUserId) {
    const me = entries.find((e) => e.member.id === currentUserId);
    if (me) {
      const seed = `${period}-${me.member.id}-${me.rank}-${entries.length}`;
      if (me.rank === 1) {
        return pickStable(FIRST_PLACE, seed);
      }
      if (me.rank === entries.length) {
        return pickStable(LAST_PLACE, seed);
      }
      const gap = leader.points.total - me.points.total;
      if (gap <= 1.5) {
        return pickStable(CLOSE_SECOND, seed);
      }
      if (me.points.total === 0) {
        return pickStable(ZERO_SCORE, seed);
      }
      return pickStable(MIDDLE_PACK, seed);
    }
  }

  if (leader.points.total >= 9) {
    return `${leader.member.name} is cooking this ${periodLabel}. Everyone else is meal prep.`;
  }

  return `${leader.member.name} leads — for now. The flat is watching.`;
}

export function getRankQuip(
  entry: LeaderboardEntry,
  leader: LeaderboardEntry | undefined,
  totalMembers: number
): string | null {
  if (totalMembers <= 1) return null;

  const seed = `${entry.member.id}-${entry.rank}-${totalMembers}-${leader?.points.total ?? 0}`;

  if (entry.rank === 1) {
    return pickStable(['Crown secured.', 'Top dog.', 'Untouchable. For now.'], seed);
  }

  if (entry.points.total === 0) {
    return pickStable(ZERO_SCORE, seed);
  }

  if (!leader) return null;

  const gap = leader.points.total - entry.points.total;

  if (entry.rank === totalMembers) {
    return pickStable(LAST_PLACE, seed);
  }

  if (gap <= 1) {
    return pickStable(['Within striking distance.', 'One log away.'], seed);
  }

  if (gap <= 3) {
    return pickStable(CLOSE_SECOND, seed);
  }

  if (entry.rank <= Math.ceil(totalMembers / 2)) {
    return pickStable(['Upper half energy.', 'Respectable. Could be worse.'], seed);
  }

  return pickStable(FAR_BEHIND, seed);
}

export function getGapLabel(
  entry: LeaderboardEntry,
  leader: LeaderboardEntry | undefined
): string {
  if (!leader || entry.rank === 1) return 'Leader';
  const gap = leader.points.total - entry.points.total;
  if (gap <= 0) return 'Tied';
  return `−${gap.toFixed(1)} pts`;
}
