'use client';

import { PointsBreakdown } from '@/types';
import ProgressBar from '@/components/ui/ProgressBar';
import { DumbbellIcon, DropletIcon, ProteinIcon } from '@/components/ui/Icons';

interface ScoreBannerProps {
  points: PointsBreakdown;
}

export default function ScoreBanner({ points }: ScoreBannerProps) {
  const percentage = (points.total / 10) * 100;

  return (
    <div className="bg-ink rounded-2xl p-6 text-accent-foreground animate-fade-up">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-foreground/65 mb-2">
            Today&apos;s Score
          </p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-6xl font-bold tracking-tightest leading-none">
              {points.total.toFixed(1)}
            </span>
            <span className="text-lg text-accent-foreground/65 font-medium">/ 10</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-accent-foreground/65 uppercase tracking-widest font-semibold">
            {percentage >= 100 ? 'Perfect' : percentage >= 70 ? 'Strong' : percentage >= 40 ? 'Building' : 'Start'}
          </div>
        </div>
      </div>

      <ProgressBar
        value={percentage}
        color="bg-surface"
        trackColor="bg-white/15"
        height="h-1"
        className="mb-5"
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-black/8 border border-black/10">
          <DumbbellIcon className="w-4 h-4 text-accent-foreground/60" />
          <span className="font-display text-lg font-bold">{points.gym.toFixed(1)}</span>
          <span className="text-[10px] uppercase tracking-widest text-accent-foreground/60">Gym</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-black/8 border border-black/10">
          <ProteinIcon className="w-4 h-4 text-accent-foreground/60" />
          <span className="font-display text-lg font-bold">{points.protein.toFixed(1)}</span>
          <span className="text-[10px] uppercase tracking-widest text-accent-foreground/60">Protein</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-black/8 border border-black/10">
          <DropletIcon className="w-4 h-4 text-accent-foreground/60" filled />
          <span className="font-display text-lg font-bold">{points.water.toFixed(1)}</span>
          <span className="text-[10px] uppercase tracking-widest text-accent-foreground/60">Water</span>
        </div>
      </div>
    </div>
  );
}
