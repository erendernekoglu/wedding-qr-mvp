'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Database,
  Mail,
  Shield,
  Globe,
  Palette,
  Bell,
  Key,
  Server,
  Cloud,
  Users,
  Calendar,
  FileImage,
  Trash2,
  Download,
  Upload
} from 'lucide-react'

interface SystemSettings {
  // Genel Ayarlar
  siteName: string
  siteDescription: string
  siteUrl: string
  maintenanceMode: boolean
  
  // Dosya Ayarları
  maxFileSize: number
  allowedFileTypes: string[]
  maxFilesPerEvent: number
  storageProvider: 'drive' | 'local'
  
  // Etkinlik Ayarları
  defaultEventDuration: number
  autoApproveEvents: boolean
  requireEventApproval: boolean
  maxTablesPerEvent: number
  
  // Kullanıcı Ayarları
  allowUserRegistration: boolean
  requireEmailVerification: boolean
  defaultUserRole: 'user' | 'admin'
  
  // Bildirim Ayarları
  emailNotifications: boolean
  adminEmailNotifications: boolean
  notificationEmail: string
  
  // Güvenlik Ayarları
  sessionTimeout: number
  maxLoginAttempts: number
  enableTwoFactor: boolean
  
  // Analytics Ayarları
  enableAnalytics: boolean
  analyticsProvider: 'internal' | 'google' | 'mixpanel'
  trackingId: string
}

interface SystemStats {
  totalUsers: number
  totalEvents: number
  totalFiles: number
  storageUsed: number
  lastBackup: string
  systemUptime: string
  redisStatus: 'connected' | 'disconnected'
  driveStatus: 'connected' | 'disconnected'
}

function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Momento',
    siteDescription: 'Etkinlik fotoğraf paylaşım platformu',
    siteUrl: 'https://momentobeta.vercel.app',
    maintenanceMode: false,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFilesPerEvent: 1000,
    storageProvider: 'drive',
    defaultEventDuration: 24,
    autoApproveEvents: false,
    requireEventApproval: true,
    maxTablesPerEvent: 50,
    allowUserRegistration: true,
    requireEmailVerification: false,
    defaultUserRole: 'user',
    emailNotifications: true,
    adminEmailNotifications: true,
    notificationEmail: 'admin@momento.com',
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    enableTwoFactor: false,
    enableAnalytics: true,
    analyticsProvider: 'internal',
    trackingId: '',
  })

  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalFiles: 0,
    storageUsed: 0,
    lastBackup: '',
    systemUptime: '',
    redisStatus: 'disconnected',
    driveStatus: 'disconnected'
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
    fetchStats()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      
      if (data.success) {
        setSettings({ ...settings, ...data.data })
      }
    } catch (error) {
      console.error('Settings fetch error:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/settings/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Stats fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Ayarlar kaydedilemedi' })
      }
    } catch (error) {
      console.error('Save settings error:', error)
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken bir hata oluştu' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      fetchSettings()
      setMessage({ type: 'info', text: 'Ayarlar varsayılan değerlere sıfırlandı' })
    }
  }

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/admin/settings/backup', {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Yedekleme başlatıldı!' })
      } else {
        setMessage({ type: 'error', text: 'Yedekleme başlatılamadı' })
      }
    } catch (error) {
      console.error('Backup error:', error)
      setMessage({ type: 'error', text: 'Yedekleme sırasında bir hata oluştu' })
    }
  }

  const handleClearCache = async () => {
    try {
      const response = await fetch('/api/admin/settings/clear-cache', {
        method: 'POST'
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Önbellek temizlendi!' })
      } else {
        setMessage({ type: 'error', text: 'Önbellek temizlenemedi' })
      }
    } catch (error) {
      console.error('Clear cache error:', error)
      setMessage({ type: 'error', text: 'Önbellek temizlenirken bir hata oluştu' })
    }
  }

  const tabs = [
    { id: 'general', name: 'Genel', icon: SettingsIcon },
    { id: 'files', name: 'Dosya', icon: FileImage },
    { id: 'events', name: 'Etkinlik', icon: Calendar },
    { id: 'users', name: 'Kullanıcı', icon: Users },
    { id: 'notifications', name: 'Bildirim', icon: Bell },
    { id: 'security', name: 'Güvenlik', icon: Shield },
    { id: 'analytics', name: 'Analytics', icon: Database },
    { id: 'system', name: 'Sistem', icon: Server }
  ]

  if (loading) {
    return (
      <AdminLayout title="Sistem Ayarları" description="Sistem konfigürasyonunu yönetin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Sistem Ayarları" description="Sistem konfigürasyonunu yönetin">
      <div className="space-y-6">
        {/* Mesaj */}
        {message && (
          <div className={`rounded-md p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' :
            message.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : message.type === 'error' ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <SettingsIcon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sistem İstatistikleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam Kullanıcı</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam Etkinlik</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalEvents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileImage className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Toplam Dosya</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalFiles}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Cloud className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Depolama</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.storageUsed > 1024 
                        ? `${(stats.storageUsed / 1024).toFixed(1)} GB`
                        : `${stats.storageUsed} MB`
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sistem Durumu */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Sistem Durumu</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-3 h-3 rounded-full mr-3 ${
                  stats.redisStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="text-sm text-gray-700">Redis: {stats.redisStatus === 'connected' ? 'Bağlı' : 'Bağlantı Yok'}</span>
              </div>
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-3 h-3 rounded-full mr-3 ${
                  stats.driveStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="text-sm text-gray-700">Google Drive: {stats.driveStatus === 'connected' ? 'Bağlı' : 'Bağlantı Yok'}</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-3 h-3 rounded-full mr-3 bg-green-400"></div>
                <span className="text-sm text-gray-700">Sistem: Çalışıyor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ana Ayarlar */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                        activeTab === tab.id
                          ? 'border-pink-500 text-pink-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Genel Ayarlar</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Adı</label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
                      <input
                        type="url"
                        value={settings.siteUrl}
                        onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Açıklaması</label>
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      rows={3}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                      Bakım modu (site erişimi kısıtlanır)
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Dosya Ayarları</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maksimum Dosya Boyutu (MB)</label>
                      <input
                        type="number"
                        value={settings.maxFileSize}
                        onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Etkinlik Başına Maksimum Dosya</label>
                      <input
                        type="number"
                        value={settings.maxFilesPerEvent}
                        onChange={(e) => setSettings({ ...settings, maxFilesPerEvent: parseInt(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">İzin Verilen Dosya Türleri</label>
                    <input
                      type="text"
                      value={settings.allowedFileTypes.join(', ')}
                      onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value.split(',').map(t => t.trim()) })}
                      placeholder="jpg, jpeg, png, gif, webp"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">Dosya türlerini virgülle ayırın</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Depolama Sağlayıcısı</label>
                    <select
                      value={settings.storageProvider}
                      onChange={(e) => setSettings({ ...settings, storageProvider: e.target.value as 'drive' | 'local' })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="drive">Google Drive</option>
                      <option value="local">Yerel Depolama</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Etkinlik Ayarları</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Etkinlik Süresi (Saat)</label>
                      <input
                        type="number"
                        value={settings.defaultEventDuration}
                        onChange={(e) => setSettings({ ...settings, defaultEventDuration: parseInt(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maksimum Masa Sayısı</label>
                      <input
                        type="number"
                        value={settings.maxTablesPerEvent}
                        onChange={(e) => setSettings({ ...settings, maxTablesPerEvent: parseInt(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoApproveEvents"
                        checked={settings.autoApproveEvents}
                        onChange={(e) => setSettings({ ...settings, autoApproveEvents: e.target.checked })}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <label htmlFor="autoApproveEvents" className="ml-2 block text-sm text-gray-900">
                        Etkinlikleri otomatik onayla
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireEventApproval"
                        checked={settings.requireEventApproval}
                        onChange={(e) => setSettings({ ...settings, requireEventApproval: e.target.checked })}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <label htmlFor="requireEventApproval" className="ml-2 block text-sm text-gray-900">
                        Etkinlik onayı gerektir
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Kullanıcı Ayarları</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowUserRegistration"
                        checked={settings.allowUserRegistration}
                        onChange={(e) => setSettings({ ...settings, allowUserRegistration: e.target.checked })}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <label htmlFor="allowUserRegistration" className="ml-2 block text-sm text-gray-900">
                        Kullanıcı kaydına izin ver
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireEmailVerification"
                        checked={settings.requireEmailVerification}
                        onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900">
                        E-posta doğrulaması gerektir
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Kullanıcı Rolü</label>
                    <select
                      value={settings.defaultUserRole}
                      onChange={(e) => setSettings({ ...settings, defaultUserRole: e.target.value as 'user' | 'admin' })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="user">Kullanıcı</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Bildirim Ayarları</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                        E-posta bildirimlerini etkinleştir
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="adminEmailNotifications"
                        checked={settings.adminEmailNotifications}
                        onChange={(e) => setSettings({ ...settings, adminEmailNotifications: e.target.checked })}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <label htmlFor="adminEmailNotifications" className="ml-2 block text-sm text-gray-900">
                        Admin e-posta bildirimlerini etkinleştir
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bildirim E-posta Adresi</label>
                    <input
                      type="email"
                      value={settings.notificationEmail}
                      onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Güvenlik Ayarları</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Oturum Zaman Aşımı (Saat)</label>
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maksimum Giriş Denemesi</label>
                      <input
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableTwoFactor"
                      checked={settings.enableTwoFactor}
                      onChange={(e) => setSettings({ ...settings, enableTwoFactor: e.target.checked })}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-900">
                      İki faktörlü kimlik doğrulamayı etkinleştir
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Analytics Ayarları</h3>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableAnalytics"
                      checked={settings.enableAnalytics}
                      onChange={(e) => setSettings({ ...settings, enableAnalytics: e.target.checked })}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableAnalytics" className="ml-2 block text-sm text-gray-900">
                      Analytics'i etkinleştir
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Analytics Sağlayıcısı</label>
                    <select
                      value={settings.analyticsProvider}
                      onChange={(e) => setSettings({ ...settings, analyticsProvider: e.target.value as 'internal' | 'google' | 'mixpanel' })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="internal">Dahili Analytics</option>
                      <option value="google">Google Analytics</option>
                      <option value="mixpanel">Mixpanel</option>
                    </select>
                  </div>

                  {settings.analyticsProvider !== 'internal' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tracking ID</label>
                      <input
                        type="text"
                        value={settings.trackingId}
                        onChange={(e) => setSettings({ ...settings, trackingId: e.target.value })}
                        placeholder="GA-XXXXXXXXX veya Mixpanel Token"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'system' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Sistem Yönetimi</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleBackup}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Yedekleme Oluştur
                    </button>
                    
                    <button
                      onClick={handleClearCache}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Önbelleği Temizle
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Sistem Bilgileri</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Son Yedekleme: {stats.lastBackup || 'Hiç yedekleme yapılmamış'}</p>
                      <p>Sistem Çalışma Süresi: {stats.systemUptime || 'Bilinmiyor'}</p>
                      <p>Redis Durumu: {stats.redisStatus === 'connected' ? 'Bağlı' : 'Bağlantı Yok'}</p>
                      <p>Drive Durumu: {stats.driveStatus === 'connected' ? 'Bağlı' : 'Bağlantı Yok'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Sıfırla
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminSettingsPage() {
  return <AdminSettings />
}
