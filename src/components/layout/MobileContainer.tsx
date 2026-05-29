'use client';

import { ReactNode } from 'react';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export default function MobileContainer({ children, className = '' }: MobileContainerProps) {
  return (
    <div className={`w-full max-w-mobile mx-auto bg-surface min-h-screen flex flex-col ${className}`}>
      {children}
    </div>
  );
}
