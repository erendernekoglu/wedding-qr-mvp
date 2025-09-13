import React from 'react';
import { clsx } from 'clsx';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleProps) {
  return (
    <label className={clsx(
      'flex items-center space-x-3',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    )}>
      <div
        className={clsx(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-brand-primary' : 'bg-muted',
          disabled && 'cursor-not-allowed'
        )}
      >
        <div
          className={clsx(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200',
            checked && 'translate-x-5'
          )}
        />
      </div>
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
    </label>
  );
}