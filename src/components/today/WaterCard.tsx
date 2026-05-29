'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import { DropletIcon } from '@/components/ui/Icons';
import { formatLiters } from '@/lib/points';
import { cn } from '@/lib/utils';

interface WaterCardProps {
  droplets: number;
  waterTarget: number;
  onUpdate: (droplets: number) => void;
}

export default function WaterCard({ droplets, waterTarget, onUpdate }: WaterCardProps) {
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

  const handleDropletClick = (index: number) => {
    const clickedDroplet = index + 1;

    if (clickedDroplet === droplets) {
      onUpdate(droplets - 1);
    } else {
      onUpdate(clickedDroplet);
      setAnimatingIndex(index);
      setTimeout(() => setAnimatingIndex(null), 250);
    }
  };

  const currentLiters = (droplets / 8) * waterTarget;

  return (
    <Card className="animate-fade-up">
      <div className="flex items-center justify-between mb-5 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center flex-shrink-0">
            <DropletIcon className="w-5 h-5 text-ink-muted" filled />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-ink">Water</h3>
            <p className="text-xs text-ink-muted truncate">
              {formatLiters(currentLiters)} / {formatLiters(waterTarget)}
            </p>
          </div>
        </div>
        <span className="badge flex-shrink-0">{droplets}/8</span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {Array.from({ length: 8 }).map((_, index) => {
          const isFilled = index < droplets;
          const isAnimating = animatingIndex === index;

          return (
            <button
              key={index}
              onClick={() => handleDropletClick(index)}
              className={cn(
                'aspect-square rounded-xl flex items-center justify-center transition-all duration-200',
                'hover:scale-105 active:scale-95',
                isFilled
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-surface-elevated border border-border text-ink-muted hover:border-ink-muted',
                isAnimating && 'animate-droplet-fill'
              )}
            >
              <DropletIcon className="w-5 h-5" filled={isFilled} />
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-ink-muted uppercase tracking-widest font-medium">
        Tap to fill · {droplets} of 8 glasses
      </p>
    </Card>
  );
}
