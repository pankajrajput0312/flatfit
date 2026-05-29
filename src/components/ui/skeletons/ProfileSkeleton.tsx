import PageShell from '@/components/layout/PageShell';
import BottomNav from '@/components/layout/BottomNav';
import { Shimmer, ShimmerLine, ShimmerCircle } from '@/components/ui/Shimmer';

export default function ProfileSkeleton() {
  return (
    <PageShell>
      <div className="bg-hero px-5 pt-8 pb-6">
        <ShimmerLine dark className="w-32 h-7 mb-2" />
        <ShimmerLine dark className="w-48 h-3 mb-5" />
        <div className="flex items-center gap-4 mb-5">
          <ShimmerCircle dark className="w-14 h-14" />
          <div className="flex-1 space-y-2 min-w-0">
            <ShimmerLine dark className="w-20 h-2.5" />
            <ShimmerLine dark className="w-16 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} dark className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="px-5 py-5 space-y-4 overflow-hidden">
        <Shimmer className="h-36 rounded-2xl" />
        <Shimmer className="h-48 rounded-2xl" />
        <Shimmer className="h-12 rounded-xl" />
      </div>

      <BottomNav />
    </PageShell>
  );
}
