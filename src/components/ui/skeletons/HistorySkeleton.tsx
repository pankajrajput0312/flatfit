import PageShell from '@/components/layout/PageShell';
import BottomNav from '@/components/layout/BottomNav';
import { Shimmer, ShimmerLine, ShimmerPill } from '@/components/ui/Shimmer';

export default function HistorySkeleton() {
  return (
    <PageShell>
      <div className="bg-hero px-5 pt-8 pb-6">
        <ShimmerLine dark className="w-28 h-7 mb-2" />
        <ShimmerLine dark className="w-40 h-3 mb-5" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} dark className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="px-5 py-4 border-b border-border space-y-3 overflow-hidden">
        <div className="flex gap-2">
          <ShimmerPill />
          <ShimmerPill />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
        <Shimmer className="h-10 rounded-xl" />
      </div>

      <HistoryContentSkeleton />
      <BottomNav />
    </PageShell>
  );
}

export function HistoryContentSkeleton({ view = 'list' }: { view?: 'list' | 'calendar' }) {
  if (view === 'calendar') {
    return (
      <div className="px-5 py-5 overflow-hidden">
        <Shimmer className="h-[360px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-5 py-5 space-y-2 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <Shimmer key={i} className="h-[72px] rounded-2xl" />
      ))}
    </div>
  );
}
