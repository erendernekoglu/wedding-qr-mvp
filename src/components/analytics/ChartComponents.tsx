'use client'
import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { DailyStat, WeeklyStat, MonthlyStat, TopItem } from '@/lib/analytics'

// Chart.js kayıt
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface LineChartProps {
  data: DailyStat[] | WeeklyStat[] | MonthlyStat[]
  title: string
  height?: number
}

export function LineChart({ data, title, height = 300 }: LineChartProps) {
  const chartData = {
    labels: data.map(item => 'date' in item ? item.date : 'week' in item ? item.week : item.month),
    datasets: [
      {
        label: 'Kullanıcılar',
        data: data.map(item => item.users),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Etkinlikler',
        data: data.map(item => item.events),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Dosyalar',
        data: data.map(item => item.files),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  )
}

interface BarChartProps {
  data: TopItem[]
  title: string
  height?: number
}

export function BarChart({ data, title, height = 300 }: BarChartProps) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Kullanım Sayısı',
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}

interface DoughnutChartProps {
  data: TopItem[]
  title: string
  height?: number
}

export function DoughnutChart({ data, title, height = 300 }: DoughnutChartProps) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Doughnut data={chartData} options={options} />
    </div>
  )
}

// Mini istatistik kartları
interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

export function StatCard({ title, value, change, icon, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
  }

  const changeClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600',
  }

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={`text-sm ${changeClasses[change.type]}`}>
              {change.type === 'increase' && '↗'} {change.type === 'decrease' && '↘'} {change.type === 'neutral' && '→'}
              {change.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-2xl opacity-75">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// Trend göstergesi
interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable'
  percentage: number
  label?: string
}

export function TrendIndicator({ trend, percentage, label }: TrendIndicatorProps) {
  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→',
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  }

  return (
    <div className="flex items-center space-x-2">
      <span className={`text-lg ${trendColors[trend]}`}>
        {trendIcons[trend]}
      </span>
      <span className={`text-sm font-medium ${trendColors[trend]}`}>
        {percentage > 0 && '+'}{percentage.toFixed(1)}%
      </span>
      {label && (
        <span className="text-sm text-gray-600">
          {label}
        </span>
      )}
    </div>
  )
}
