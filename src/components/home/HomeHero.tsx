'use client';

import { Member, PointsBreakdown, DAYS_OF_WEEK } from '@/types';
import MemberSwitcher from '@/components/layout/MemberSwitcher';
import { DumbbellIcon, DropletIcon, ProteinIcon } from '@/components/ui/Icons';
import { getScoreLabel } from '@/lib/greeting';
import {
  MAX_DAILY_POINTS,
  MAX_GYM_POINTS,
  getMemberGoalSnapshot,
  formatProteinProgress,
  formatWaterProgress,
} from '@/lib/memberGoals';
import { cn } from '@/lib/utils';

interface HomeHeroProps {
  dateLabel: string;
  points: PointsBreakdown;
  member: Member;
  droplets: number;
  proteinG: number;
  isGymDay: boolean;
  gymDone: boolean;
  isToday: boolean;
  members: Member[];
  activeMemberId: string | null;
  onMemberChange: (id: string) => void;
  onPrevDate: () => void;
  onNextDate: () => void;
  onToday: () => void;
  canGoNext: boolean;
}

function formatGymDays(gymDays: number[]): string {
  if (gymDays.length === 0) return 'Rest daily';
  return gymDays.map((day) => DAYS_OF_WEEK[day].short).join(', ');
}

export default function HomeHero({
  dateLabel,
  points,
  member,
  droplets,
  proteinG,
  isGymDay,
  gymDone,
  isToday,
  members,
  activeMemberId,
  onMemberChange,
  onPrevDate,
  onNextDate,
  onToday,
  canGoNext,
}: HomeHeroProps) {
  const percentage = (points.total / MAX_DAILY_POINTS) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDash = (percentage / 100) * circumference;
  const goals = getMemberGoalSnapshot(member, droplets, proteinG);

  const statItems = [
    {
      icon: DumbbellIcon,
      label: 'Gym',
      value: points.gym.toFixed(1),
      detail: !isGymDay ? 'Rest day' : gymDone ? 'Done' : formatGymDays(member.gym_days),
      progress: (points.gym / MAX_GYM_POINTS) * 100,
      filled: gymDone || !isGymDay,
    },
    {
      icon: ProteinIcon,
      label: 'Protein',
      value: formatProteinProgress(proteinG, goals.proteinTargetG),
      detail: `${goals.proteinProgress.toFixed(0)}% of target`,
      progress: goals.proteinProgress,
      filled: false,
    },
    {
      icon: DropletIcon,
      label: 'Water',
      value: formatWaterProgress(droplets, goals.waterTargetL),
      detail: `${goals.waterProgress.toFixed(0)}% of ${goals.waterTargetL.toFixed(1)}L`,
      progress: goals.waterProgress,
      filled: true,
    },
  ];

  return (
    <div className="dark-hero">
      <div className="dark-hero-grid" />

      <div className="relative px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <p className="font-display text-base font-bold tracking-tight text-white">
              {dateLabel}
            </p>
            <p className="text-[10px] text-white/55 uppercase tracking-widest font-medium mt-1 truncate">
              {member.name} · {goals.waterTargetL.toFixed(1)}L · {goals.proteinTargetG}g protein
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
            <button
              onClick={onPrevDate}
              className="w-8 h-8 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:border-white/35 transition-colors"
              aria-label="Previous day"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            {!isToday && (
              <button
                onClick={onToday}
                className="px-2.5 h-8 rounded-lg border border-white/20 bg-white/5 text-[10px] uppercase tracking-widest font-semibold text-white/70 hover:text-white hover:border-white/35 transition-colors"
              >
                Today
              </button>
            )}
            <button
              onClick={onNextDate}
              disabled={!canGoNext}
              className={cn(
                'w-8 h-8 rounded-lg border flex items-center justify-center transition-colors',
                canGoNext
                  ? 'border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/35'
                  : 'border-white/10 text-white/30 cursor-not-allowed'
              )}
              aria-label="Next day"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0 w-[96px] h-[96px]">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="font-display text-2xl font-bold tracking-tightest leading-none">
                {points.total.toFixed(1)}
              </span>
              <span className="text-[10px] text-white/65 font-medium">/ {MAX_DAILY_POINTS}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white mb-2">{getScoreLabel(percentage)}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {statItems.map(({ icon: Icon, label, value, detail, progress, filled }) => (
                <div key={label} className="stat-chip py-2 px-1.5">
                  <Icon className="w-3 h-3 text-white/60 mb-1" filled={filled} />
                  <span className="text-[9px] uppercase tracking-widest text-white/60 leading-none">
                    {label}
                  </span>
                  <span className="text-[10px] font-bold text-white tabular-nums mt-0.5 leading-tight text-center">
                    {value}
                  </span>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1 max-w-[52px]">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(progress, progress > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-white/50 leading-tight text-center mt-0.5 line-clamp-2">
                    {detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isToday && (
          <p className="text-[10px] text-white/55 uppercase tracking-widest font-medium mb-3">
            Viewing past entry
          </p>
        )}

        <MemberSwitcher
          members={members}
          activeMemberId={activeMemberId}
          onMemberChange={onMemberChange}
          dark
        />
      </div>
    </div>
  );
}
