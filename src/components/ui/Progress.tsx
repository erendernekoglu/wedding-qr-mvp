import React from 'react';
import { clsx } from 'clsx';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
}

export default function Progress({
  value,
  max = 100,
  className,
  showValue = false,
}: ProgressProps) {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div className={clsx('space-y-1', className)}>
      {showValue && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-brand-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}