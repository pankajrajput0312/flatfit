import PageShell from '@/components/layout/PageShell';
import BottomNav from '@/components/layout/BottomNav';
import { Shimmer, ShimmerLine, ShimmerCircle, ShimmerPill } from '@/components/ui/Shimmer';

export default function HomeSkeleton() {
  return (
    <PageShell>
      <div className="bg-hero px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <ShimmerLine dark className="w-32 h-5" />
          <div className="flex gap-1.5">
            <Shimmer dark className="w-8 h-8 rounded-lg" />
            <Shimmer dark className="w-8 h-8 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <ShimmerCircle dark className="w-[96px] h-[96px] flex-shrink-0" />
          <div className="flex-1 grid grid-cols-3 gap-1.5 min-w-0">
            <Shimmer dark className="h-16 rounded-xl" />
            <Shimmer dark className="h-16 rounded-xl" />
            <Shimmer dark className="h-16 rounded-xl" />
          </div>
        </div>
        <div className="flex gap-2 overflow-hidden">
          <ShimmerPill dark />
          <ShimmerPill dark />
        </div>
      </div>

      <div className="px-5 py-2.5 border-b border-border">
        <ShimmerLine className="w-20 h-3 mb-2" />
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Shimmer key={i} className="flex-1 h-12 rounded-xl" />
          ))}
        </div>
      </div>

      <LogPanelSkeleton />
      <BottomNav />
    </PageShell>
  );
}

export function LogPanelSkeleton() {
  return (
    <div className="px-5 py-4 overflow-hidden">
      <Shimmer className="h-[340px] rounded-2xl" />
    </div>
  );
}

/** @deprecated Use LogPanelSkeleton */
export function GoalCardsSkeleton() {
  return <LogPanelSkeleton />;
}
