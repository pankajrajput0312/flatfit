'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckIcon, DumbbellIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

interface GymCardProps {
  isGymDay: boolean;
  gymDone: boolean;
  onToggle: () => void;
}

export default function GymCard({ isGymDay, gymDone, onToggle }: GymCardProps) {
  if (!isGymDay) {
    return (
      <Card className="animate-fade-up">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border flex items-center justify-center flex-shrink-0">
              <DumbbellIcon className="w-5 h-5 text-ink-muted" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base font-bold text-ink">Gym</h3>
              <p className="text-xs text-ink-muted">Rest day</p>
            </div>
          </div>
          <span className="badge badge-active flex-shrink-0">+5 pts</span>
        </div>
        <div className="bg-surface-elevated border border-border rounded-xl p-4 flex items-center gap-3">
          <CheckIcon className="w-5 h-5 text-ink flex-shrink-0" />
          <p className="text-sm text-ink-muted font-medium">
            Rest day — 5 points awarded automatically
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-up">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'w-10 h-10 rounded-xl border flex items-center justify-center transition-colors flex-shrink-0',
              gymDone ? 'bg-accent border-accent' : 'bg-surface-elevated border-border'
            )}
          >
            <DumbbellIcon
              className={cn('w-5 h-5', gymDone ? 'text-accent-foreground' : 'text-ink-muted')}
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-ink">Gym</h3>
            <p className="text-xs text-ink-muted">Training day</p>
          </div>
        </div>
        <span className="badge flex-shrink-0">5 pts max</span>
      </div>
      <Button variant={gymDone ? 'secondary' : 'primary'} onClick={onToggle}>
        {gymDone ? (
          <span className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4" />
            Completed
          </span>
        ) : (
          'Mark as Done'
        )}
      </Button>
    </Card>
  );
}
