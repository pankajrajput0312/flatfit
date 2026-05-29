'use client';

import { useState, useEffect } from 'react';
import { DAYS_OF_WEEK } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { CheckIcon, DumbbellIcon, DropletIcon, ProteinIcon } from '@/components/ui/Icons';
import { formatGrams, formatLiters } from '@/lib/points';
import {
  WATER_GLASS_COUNT,
  MAX_GYM_POINTS,
  MAX_PROTEIN_POINTS,
  MAX_WATER_POINTS,
  getWaterPerGlass,
  formatWaterGlassHint,
  formatWaterProgress,
  formatProteinProgress,
  getWaterProgress,
  getProteinProgress,
} from '@/lib/memberGoals';
import { cn } from '@/lib/utils';

interface DailyLogPanelProps {
  isGymDay: boolean;
  gymDays: number[];
  gymDone: boolean;
  onGymToggle: () => void;
  droplets: number;
  waterTarget: number;
  onWaterUpdate: (droplets: number) => void;
  proteinG: number;
  proteinTarget: number;
  onProteinUpdate: (grams: number) => void;
  isToday: boolean;
}

function formatGymSchedule(gymDays: number[]): string {
  if (gymDays.length === 0) return 'No gym days set';
  return gymDays.map((day) => DAYS_OF_WEEK[day].short).join(', ');
}

export default function DailyLogPanel({
  isGymDay,
  gymDays,
  gymDone,
  onGymToggle,
  droplets,
  waterTarget,
  onWaterUpdate,
  proteinG,
  proteinTarget,
  onProteinUpdate,
  isToday,
}: DailyLogPanelProps) {
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [localProtein, setLocalProtein] = useState(proteinG.toString());

  useEffect(() => {
    setLocalProtein(proteinG.toString());
  }, [proteinG]);

  const waterPerGlass = getWaterPerGlass(waterTarget);
  const waterPct = getWaterProgress(droplets, waterTarget);
  const proteinPct = getProteinProgress(proteinG, proteinTarget);

  const handleProteinChange = (value: string) => {
    setLocalProtein(value);
    const grams = parseInt(value, 10);
    onProteinUpdate(Number.isNaN(grams) ? 0 : grams);
  };

  const handleDropletClick = (index: number) => {
    const clicked = index + 1;
    if (clicked === droplets) {
      onWaterUpdate(droplets - 1);
    } else {
      onWaterUpdate(clicked);
      setAnimatingIndex(index);
      setTimeout(() => setAnimatingIndex(null), 250);
    }
  };

  return (
    <Card className="p-0 overflow-hidden animate-fade-up">
      <div className="px-4 py-3 border-b border-border bg-surface-elevated/50">
        <p className="section-label">{isToday ? "Today's log" : 'Daily log'}</p>
      </div>

      {/* Gym */}
      <section className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0',
              isGymDay && gymDone
                ? 'bg-accent border-accent'
                : 'bg-surface-elevated border-border'
            )}
          >
            <DumbbellIcon
              className={cn(
                'w-4 h-4',
                isGymDay && gymDone ? 'text-accent-foreground' : 'text-ink-muted'
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-bold text-ink">Gym</h3>
              <span className="badge text-[9px] py-0.5">{MAX_GYM_POINTS} pts</span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5 truncate">
              {!isGymDay
                ? `Rest day · schedule: ${formatGymSchedule(gymDays)}`
                : gymDone
                  ? `Workout complete · ${formatGymSchedule(gymDays)}`
                  : `Training day · ${formatGymSchedule(gymDays)}`}
            </p>
          </div>

          {!isGymDay ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-ink-muted flex-shrink-0">
              <CheckIcon className="w-3.5 h-3.5" />
              Done
            </span>
          ) : (
            <Button
              variant={gymDone ? 'secondary' : 'primary'}
              size="sm"
              onClick={onGymToggle}
              className="w-auto flex-shrink-0"
            >
              {gymDone ? 'Done' : 'Mark done'}
            </Button>
          )}
        </div>
      </section>

      {/* Water */}
      <section className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-surface-elevated border border-border flex items-center justify-center flex-shrink-0">
              <DropletIcon className="w-4 h-4 text-ink-muted" filled />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-ink">Water</h3>
                <span className="badge text-[9px] py-0.5">{MAX_WATER_POINTS} pts</span>
              </div>
              <p className="text-xs text-ink-muted truncate">
                {formatWaterProgress(droplets, waterTarget)} · target {formatLiters(waterTarget)}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-ink tabular-nums flex-shrink-0">
            {droplets}/{WATER_GLASS_COUNT}
          </span>
        </div>

        <ProgressBar value={waterPct} height="h-1.5" className="mb-3" />

        <div className="flex gap-1.5">
          {Array.from({ length: WATER_GLASS_COUNT }).map((_, index) => {
            const isFilled = index < droplets;
            const isAnimating = animatingIndex === index;
            const glassLiters = waterPerGlass * (index + 1);

            return (
              <button
                key={index}
                onClick={() => handleDropletClick(index)}
                title={`${formatLiters(waterPerGlass)} · ${formatLiters(glassLiters)} total`}
                className={cn(
                  'flex-1 aspect-square max-w-[42px] rounded-lg flex flex-col items-center justify-center transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  isFilled
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-surface-elevated border border-border text-ink-muted hover:border-ink-muted',
                  isAnimating && 'animate-droplet-fill'
                )}
                aria-label={`Glass ${index + 1} of ${WATER_GLASS_COUNT}, ${formatLiters(waterPerGlass)}`}
              >
                <DropletIcon className="w-4 h-4" filled={isFilled} />
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-ink-muted text-center uppercase tracking-widest font-medium mt-3">
          {formatWaterGlassHint(waterTarget)} · tap to fill
        </p>
      </section>

      {/* Protein */}
      <section className="px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-surface-elevated border border-border flex items-center justify-center flex-shrink-0">
            <ProteinIcon className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-bold text-ink">Protein</h3>
              <span className="badge text-[9px] py-0.5">{MAX_PROTEIN_POINTS} pts</span>
            </div>
            <p className="text-xs text-ink-muted">
              {formatProteinProgress(proteinG, proteinTarget)}
            </p>
          </div>
          <span className="text-xs font-bold text-ink tabular-nums flex-shrink-0">
            {proteinPct.toFixed(0)}%
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <input
            type="number"
            value={localProtein}
            onChange={(e) => handleProteinChange(e.target.value)}
            placeholder="0"
            min="0"
            step="5"
            className="font-display text-3xl font-bold text-ink w-full min-w-0 outline-none bg-transparent border-b border-border focus:border-accent transition-colors pb-1 tracking-tightest"
          />
          <span className="text-xs text-ink-muted font-semibold uppercase tracking-widest flex-shrink-0">
            / {formatGrams(proteinTarget)}
          </span>
        </div>

        <ProgressBar value={proteinPct} height="h-1.5" />
        <p className="text-[10px] text-ink-muted text-center uppercase tracking-widest font-medium mt-2">
          {formatGrams(proteinG)} of {formatGrams(proteinTarget)} target
        </p>
      </section>
    </Card>
  );
}
