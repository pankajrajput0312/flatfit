'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

/** Light sticky header — children render full-width below title */
export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="px-5 pt-5 pb-4">
        <h1 className="font-display text-2xl font-bold text-ink tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-ink-muted uppercase tracking-widest font-medium mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="px-5 pb-4 overflow-hidden">{children}</div>
      )}
    </div>
  );
}
