'use client';

import { ReactNode } from 'react';
import { LogoMark } from '@/components/ui/Icons';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  step?: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, step, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-canvas-dark flex flex-col overflow-x-hidden overflow-y-auto">
      <div className="relative flex-1 flex flex-col px-5 py-10 overflow-hidden">
        <div className="dark-hero-grid absolute inset-0 opacity-[0.04] pointer-events-none" />

        <div className="relative text-center mb-8 animate-fade-up flex-shrink-0">
          <div className="flex justify-center mb-4">
            <LogoMark className="w-11 h-11 text-surface" />
          </div>
          <h1 className="font-display text-3xl font-bold text-surface tracking-tightest mb-1">
            {title}
          </h1>
          <p className="text-xs text-white/65 uppercase tracking-widest font-medium">
            {step ?? subtitle}
          </p>
        </div>

        <div className="relative w-full max-w-full animate-fade-up flex-shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}
