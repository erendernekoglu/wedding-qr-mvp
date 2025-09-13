import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export default function Card({
  children,
  className,
  padding = 'md',
  shadow = true,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'bg-card rounded-lg border border-border',
        shadow && 'shadow-sm',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}