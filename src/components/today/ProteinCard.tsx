'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { ProteinIcon } from '@/components/ui/Icons';
import { formatGrams } from '@/lib/points';
import { debounce } from '@/lib/utils';

interface ProteinCardProps {
  proteinG: number;
  proteinTarget: number;
  onUpdate: (grams: number) => void;
}

export default function ProteinCard({ proteinG, proteinTarget, onUpdate }: ProteinCardProps) {
  const [localValue, setLocalValue] = useState(proteinG.toString());

  useEffect(() => {
    setLocalValue(proteinG.toString());
  }, [proteinG]);

  const percentage = Math.min((proteinG / proteinTarget) * 100, 100);

  const debouncedUpdate = debounce((value: string) => {
    const numValue = parseInt(value) || 0;
    onUpdate(numValue);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    debouncedUpdate(value);
  };

  return (
    <Card className="animate-fade-up">
      <div className="flex items-center justify-between mb-5 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center flex-shrink-0">
            <ProteinIcon className="w-5 h-5 text-ink-muted" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-ink">Protein</h3>
            <p className="text-xs text-ink-muted truncate">
              Target {formatGrams(proteinTarget)}
            </p>
          </div>
        </div>
        <span className="badge flex-shrink-0">{percentage.toFixed(0)}%</span>
      </div>

      <div className="mb-5 min-w-0">
        <div className="flex items-baseline gap-2">
          <input
            type="number"
            value={localValue}
            onChange={handleChange}
            placeholder="0"
            className="font-display text-5xl font-bold text-ink w-full min-w-0 outline-none bg-transparent border-b-2 border-border focus:border-accent transition-colors pb-2 tracking-tightest"
            min="0"
          />
          <span className="text-sm text-ink-muted font-medium uppercase tracking-widest flex-shrink-0">
            g
          </span>
        </div>
      </div>

      <ProgressBar value={percentage} height="h-1" className="mb-2" />
      <p className="text-xs text-ink-muted text-center uppercase tracking-widest font-medium">
        {formatGrams(proteinG)} consumed
      </p>
    </Card>
  );
}
