'use client'
import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function ResponsiveContainer({
  children,
  className = '',
  maxWidth = 'xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6'
  }

  return (
    <div className={`
      w-full mx-auto
      ${maxWidthClasses[maxWidth]}
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </div>
  )
}

// Mobile-first responsive grid
interface ResponsiveGridProps {
  children: ReactNode
  cols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ResponsiveGrid({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className = ''
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const gridCols = `
    grid-cols-${cols.default}
    ${cols.sm ? `sm:grid-cols-${cols.sm}` : ''}
    ${cols.md ? `md:grid-cols-${cols.md}` : ''}
    ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''}
    ${cols.xl ? `xl:grid-cols-${cols.xl}` : ''}
  `.trim()

  return (
    <div className={`
      grid
      ${gridCols}
      ${gapClasses[gap]}
      ${className}
    `}>
      {children}
    </div>
  )
}

// Responsive text
interface ResponsiveTextProps {
  children: ReactNode
  size?: {
    default: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  }
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'primary' | 'secondary' | 'gray' | 'white'
  className?: string
}

export function ResponsiveText({
  children,
  size = { default: 'base' },
  weight = 'normal',
  color = 'primary',
  className = ''
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  const colorClasses = {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    gray: 'text-gray-500',
    white: 'text-white'
  }

  const responsiveSize = `
    ${sizeClasses[size.default]}
    ${size.sm ? `sm:${sizeClasses[size.sm]}` : ''}
    ${size.md ? `md:${sizeClasses[size.md]}` : ''}
    ${size.lg ? `lg:${sizeClasses[size.lg]}` : ''}
  `.trim()

  return (
    <span className={`
      ${responsiveSize}
      ${weightClasses[weight]}
      ${colorClasses[color]}
      ${className}
    `}>
      {children}
    </span>
  )
}

// Responsive button
interface ResponsiveButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: {
    default: 'sm' | 'md' | 'lg'
    sm?: 'sm' | 'md' | 'lg'
    md?: 'sm' | 'md' | 'lg'
  }
  fullWidth?: boolean | {
    default: boolean
    sm?: boolean
    md?: boolean
    lg?: boolean
  }
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function ResponsiveButton({
  children,
  variant = 'primary',
  size = { default: 'md' },
  fullWidth = false,
  className = '',
  onClick,
  disabled = false
}: ResponsiveButtonProps) {
  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/90',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const responsiveSize = `
    ${sizeClasses[size.default]}
    ${size.sm ? `sm:${sizeClasses[size.sm]}` : ''}
    ${size.md ? `md:${sizeClasses[size.md]}` : ''}
  `.trim()

  const responsiveWidth = typeof fullWidth === 'boolean' 
    ? (fullWidth ? 'w-full' : '')
    : `
      ${fullWidth.default ? 'w-full' : ''}
      ${fullWidth.sm ? 'sm:w-full' : ''}
      ${fullWidth.md ? 'md:w-full' : ''}
      ${fullWidth.lg ? 'lg:w-full' : ''}
    `.trim()

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium transition-colors
        ${variantClasses[variant]}
        ${responsiveSize}
        ${responsiveWidth}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
