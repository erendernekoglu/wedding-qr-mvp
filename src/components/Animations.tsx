'use client'
import { ReactNode, useState, useEffect } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 500, 
  className = '' 
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`
        transition-all duration-${duration} ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
        }
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface SlideInProps {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
}

export function SlideIn({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 500, 
  className = '' 
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const directionClasses = {
    left: isVisible ? 'translate-x-0' : '-translate-x-full',
    right: isVisible ? 'translate-x-0' : 'translate-x-full',
    up: isVisible ? 'translate-y-0' : '-translate-y-full',
    down: isVisible ? 'translate-y-0' : 'translate-y-full'
  }

  return (
    <div
      className={`
        transition-all duration-${duration} ease-out
        ${directionClasses[direction]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface ScaleInProps {
  children: ReactNode
  delay?: number
  duration?: number
  scale?: number
  className?: string
}

export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 500, 
  scale = 0.95, 
  className = '' 
}: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`
        transition-all duration-${duration} ease-out
        ${isVisible 
          ? 'scale-100 opacity-100' 
          : `scale-${Math.round(scale * 100)} opacity-0`
        }
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface StaggerProps {
  children: ReactNode[]
  staggerDelay?: number
  className?: string
}

export function Stagger({ 
  children, 
  staggerDelay = 100, 
  className = '' 
}: StaggerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  )
}

// Hover animations
interface HoverScaleProps {
  children: ReactNode
  scale?: number
  duration?: number
  className?: string
}

export function HoverScale({ 
  children, 
  scale = 1.05, 
  duration = 200, 
  className = '' 
}: HoverScaleProps) {
  return (
    <div
      className={`
        transition-transform duration-${duration} ease-out
        hover:scale-${Math.round(scale * 100)}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface HoverLiftProps {
  children: ReactNode
  lift?: number
  duration?: number
  className?: string
}

export function HoverLift({ 
  children, 
  lift = 2, 
  duration = 200, 
  className = '' 
}: HoverLiftProps) {
  return (
    <div
      className={`
        transition-all duration-${duration} ease-out
        hover:-translate-y-${lift}
        hover:shadow-lg
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// Loading animations
export function Pulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  )
}

export function Bounce({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-bounce ${className}`}>
      <div className="w-4 h-4 bg-brand-primary rounded-full"></div>
    </div>
  )
}

export function Spin({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-spin ${className}`}>
      <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full"></div>
    </div>
  )
}

// Page transition
interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <FadeIn duration={300} className={className}>
      {children}
    </FadeIn>
  )
}
