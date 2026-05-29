'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  color?: string;
  trackColor?: string;
  height?: string;
  animated?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  color = 'bg-accent',
  trackColor = 'bg-ink-subtle',
  height = 'h-1.5',
  animated = true,
  className = '',
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min(value, 100)), 50);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={cn('w-full rounded-full overflow-hidden', trackColor, height, className)}>
      <div
        className={cn(
          color,
          'h-full rounded-full',
          animated && 'transition-all duration-500 ease-out'
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

interface SegmentedProgressBarProps {
  segments: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  height?: string;
  className?: string;
}

export function SegmentedProgressBar({
  segments,
  height = 'h-1.5',
  className = '',
}: SegmentedProgressBarProps) {
  return (
    <div className={cn('w-full bg-ink-subtle rounded-full overflow-hidden flex', height, className)}>
      {segments.map((segment, index) => (
        <div
          key={index}
          className={cn(segment.color, 'h-full transition-all duration-500 ease-out')}
          style={{ width: `${segment.value}%` }}
        />
      ))}
    </div>
  );
}
