'use client';

import { HistoryView } from '@/lib/historyPreferences';
import { cn } from '@/lib/utils';

interface HistoryViewSelectorProps {
  value: HistoryView;
  onChange: (view: HistoryView) => void;
}

const VIEWS: { id: HistoryView; label: string }[] = [
  { id: 'list', label: 'List' },
  { id: 'calendar', label: 'Calendar' },
];

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export default function HistoryViewSelector({ value, onChange }: HistoryViewSelectorProps) {
  return (
    <div className="flex gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border">
      {VIEWS.map((view) => {
        const isActive = value === view.id;
        const Icon = view.id === 'list' ? ListIcon : CalendarIcon;

        return (
          <button
            key={view.id}
            onClick={() => onChange(view.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-200',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {view.label}
          </button>
        );
      })}
    </div>
  );
}
