import { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'inverted' | 'ghost';
  style?: CSSProperties;
}

export default function Card({
  children,
  className = '',
  onClick,
  variant = 'default',
  style,
}: CardProps) {
  const variants = {
    default: 'bg-surface-raised border border-border',
    inverted: 'bg-accent text-accent-foreground border border-accent',
    ghost: 'bg-surface-elevated border border-transparent',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-5',
        variants[variant],
        onClick && 'cursor-pointer hover:border-ink-muted transition-colors duration-200',
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
