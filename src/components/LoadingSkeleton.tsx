'use client'

interface LoadingSkeletonProps {
  className?: string
  lines?: number
  height?: string
}

export default function LoadingSkeleton({ 
  className = '', 
  lines = 1, 
  height = 'h-4' 
}: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded ${height} ${
            index < lines - 1 ? 'mb-2' : ''
          }`}
        />
      ))}
    </div>
  )
}

// Predefined skeleton components
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
          <div className="flex items-center">
            <div className="p-2 bg-gray-200 rounded-lg w-10 h-10" />
            <div className="ml-4 flex-1">
              <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border animate-pulse">
      <div className="p-6 border-b">
        <div className="h-6 bg-gray-200 rounded w-32" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-6 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function UploadSkeleton() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center animate-pulse">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full" />
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-4" />
          <div className="flex justify-center space-x-4 text-sm">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-3 bg-gray-200 rounded w-16" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32 mx-auto" />
      </div>
    </div>
  )
}
