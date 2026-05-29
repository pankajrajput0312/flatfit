'use client';

import { Member } from '@/types';
import { useMemberHistory } from '@/hooks/useMemberHistory';
import Card from '@/components/ui/Card';
import { Shimmer, ShimmerLine } from '@/components/ui/Shimmer';
import { getDateRange } from '@/lib/dates';
import Link from 'next/link';

interface MonthlySummaryProps {
  member: Member;
}

function MonthStat({
  label,
  summary,
  loading,
}: {
  label: string;
  summary: { totalPoints: number; daysLogged: number; avgPerDay: number };
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex-1 p-3 rounded-xl border border-border space-y-2">
        <ShimmerLine className="w-16 h-2.5" />
        <ShimmerLine className="w-12 h-7" />
        <ShimmerLine className="w-24 h-3" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 p-3 rounded-xl bg-surface-elevated border border-border">
      <p className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold mb-2">{label}</p>
      <p className="font-display text-2xl font-bold text-ink">{summary.totalPoints}</p>
      <p className="text-xs text-ink-muted mt-1">
        {summary.daysLogged} days · {summary.avgPerDay} avg/day
      </p>
    </div>
  );
}

export default function MonthlySummary({ member }: MonthlySummaryProps) {
  const thisMonth = useMemberHistory(member, 'this_month');
  const lastMonth = useMemberHistory(member, 'last_month');
  const thisMonthLabel = getDateRange('this_month').label;
  const lastMonthLabel = getDateRange('last_month').label;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="section-label">Monthly Track</p>
        <Link
          href="/history"
          className="text-xs font-semibold text-ink uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          View all
        </Link>
      </div>
      <div className="flex gap-2 min-w-0">
        <MonthStat
          label={thisMonthLabel}
          summary={thisMonth.summary}
          loading={thisMonth.loading}
        />
        <MonthStat
          label={lastMonthLabel}
          summary={lastMonth.summary}
          loading={lastMonth.loading}
        />
      </div>
    </Card>
  );
}
