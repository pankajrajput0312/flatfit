'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRowProps {
  children: ReactNode;
  className?: string;
  inset?: boolean;
}

/** Horizontal scroll row that stays within the mobile viewport */
export default function ScrollRow({ children, className, inset = true }: ScrollRowProps) {
  return (
    <div
      className={cn(
        'scroll-row',
        inset && '-mx-5 px-5',
        className
      )}
    >
      <div className="flex gap-1.5 min-w-max pb-0.5">{children}</div>
    </div>
  );
}
