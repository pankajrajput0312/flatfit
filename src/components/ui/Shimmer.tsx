import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
  dark?: boolean;
}

export function Shimmer({ className, dark = false }: ShimmerProps) {
  return (
    <div
      className={cn(dark ? 'shimmer-dark' : 'shimmer', className)}
      aria-hidden="true"
    />
  );
}

export function ShimmerCard({ className, dark }: ShimmerProps) {
  return <Shimmer dark={dark} className={cn('rounded-2xl h-28', className)} />;
}

export function ShimmerLine({ className, dark }: ShimmerProps) {
  return <Shimmer dark={dark} className={cn('rounded-lg h-3', className)} />;
}

export function ShimmerCircle({ className, dark }: ShimmerProps) {
  return <Shimmer dark={dark} className={cn('rounded-full', className)} />;
}

export function ShimmerPill({ className, dark }: ShimmerProps) {
  return <Shimmer dark={dark} className={cn('rounded-full h-9 w-20', className)} />;
}
