import PageShell from '@/components/layout/PageShell';
import BottomNav from '@/components/layout/BottomNav';
import { Shimmer, ShimmerLine } from '@/components/ui/Shimmer';

export default function LeaderboardSkeleton() {
  return (
    <PageShell>
      <div className="bg-hero px-5 pt-8 pb-6">
        <ShimmerLine dark className="w-36 h-7 mb-2" />
        <ShimmerLine dark className="w-48 h-3 mb-5" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} dark className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="px-5 py-4 border-b border-border space-y-3 overflow-hidden">
        <Shimmer className="h-16 rounded-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
        <Shimmer className="h-10 rounded-xl" />
      </div>

      <div className="px-5 py-5 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="h-[88px] rounded-2xl" />
        ))}
      </div>

      <BottomNav />
    </PageShell>
  );
}
