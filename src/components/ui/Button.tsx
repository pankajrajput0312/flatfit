import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:text-ink-muted disabled:cursor-not-allowed disabled:active:scale-100';

  const sizeStyles = {
    sm: 'py-2 px-4 text-sm rounded-lg',
    md: 'w-full py-3.5 px-4 text-sm rounded-xl',
    lg: 'w-full py-4 px-6 text-base rounded-xl',
  };

  const variantStyles = {
    primary: 'bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98]',
    secondary:
      'bg-surface-raised text-ink border border-border hover:border-ink-muted active:scale-[0.98]',
    ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-white/5 active:scale-[0.98]',
    outline:
      'bg-transparent text-ink border border-border hover:bg-accent hover:text-accent-foreground hover:border-accent active:scale-[0.98]',
    danger:
      'bg-red-600 text-white border border-red-600 hover:bg-red-500 hover:border-red-500 active:scale-[0.98]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
    >
      {children}
    </button>
  );
}
