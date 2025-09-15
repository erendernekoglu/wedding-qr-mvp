'use client'
import { useState } from 'react'
import { 
  Plus, 
  Calendar, 
  QrCode, 
  Users, 
  Camera, 
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search
} from 'lucide-react'
import { FadeIn, SlideIn } from '@/components/Animations'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('events')

  const mockEvents = [
    {
      id: 1,
      name: 'Ahmet & Ayşe Düğünü',
      date: '2024-02-14',
      status: 'active',
      tables: 8,
      photos: 156,
      guests: 120
    },
    {
      id: 2,
      name: 'Mehmet Doğum Günü',
      date: '2024-01-20',
      status: 'completed',
      tables: 4,
      photos: 89,
      guests: 45
    },
    {
      id: 3,
      name: 'Şirket Etkinliği',
      date: '2024-01-15',
      status: 'completed',
      tables: 6,
      photos: 234,
      guests: 80
    }
  ]

  const stats = [
    {
      title: 'Toplam Etkinlik',
      value: '12',
      change: '+2 bu ay',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Toplam Fotoğraf',
      value: '1,234',
      change: '+156 bu hafta',
      icon: <Camera className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Aktif Misafir',
      value: '89',
      change: '+12 bugün',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'QR Kodlar',
      value: '48',
      change: '+8 bu ay',
      icon: <QrCode className="w-6 h-6" />,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Hoş geldiniz, Ahmet!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <SlideIn key={index} delay={index * 100}>
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </SlideIn>
            ))}
          </div>
        </FadeIn>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Events List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Etkinliklerim</h2>
                  <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Etkinlik
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {mockEvents.map((event, index) => (
                    <FadeIn key={event.id} delay={index * 100}>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{event.name}</h3>
                            <p className="text-sm text-gray-600">{event.date}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">{event.tables} masa</span>
                              <span className="text-xs text-gray-500">{event.photos} fotoğraf</span>
                              <span className="text-xs text-gray-500">{event.guests} misafir</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                          </span>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Plus className="w-5 h-5 text-pink-500" />
                  <span className="text-sm font-medium">Yeni Etkinlik</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <QrCode className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">QR Kod Oluştur</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Analytics</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Yeni fotoğraf yüklendi</p>
                    <p className="text-xs text-gray-500">Ahmet & Ayşe Düğünü - 2 dk önce</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">QR kod oluşturuldu</p>
                    <p className="text-xs text-gray-500">Mehmet Doğum Günü - 1 saat önce</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Etkinlik tamamlandı</p>
                    <p className="text-xs text-gray-500">Şirket Etkinliği - 3 saat önce</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
