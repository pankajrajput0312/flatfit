'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DarkPageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: ReactNode;
  className?: string;
}

export default function DarkPageHero({
  title,
  subtitle,
  badge,
  children,
  className,
}: DarkPageHeroProps) {
  return (
    <div className={cn('dark-hero px-5 pt-8 pb-6', className)}>
      <div className="dark-hero-grid" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-white/70 uppercase tracking-widest font-medium mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {badge && (
            <span className="badge badge-dark flex-shrink-0 text-[9px]">{badge}</span>
          )}
        </div>
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}

interface StatGridProps {
  stats: Array<{ label: string; value: string | number }>;
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-chip">
          <span className="font-display text-xl font-bold text-white tabular-nums truncate max-w-full">
            {stat.value}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-white/65 font-semibold mt-1 text-center leading-tight">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
