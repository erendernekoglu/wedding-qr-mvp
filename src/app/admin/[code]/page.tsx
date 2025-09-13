'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, Download, Eye, Calendar, FileImage, Users, RefreshCw, Settings, Key, BarChart3, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface FileData {
  id: string
  fileId: string
  name: string
  size: number
  mimeType: string
  createdAt: string
}

interface AlbumData {
  code: string
  name: string
  createdAt: string
  fileCount: number
  totalSize: number
}

interface BetaCode {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
  maxUses?: number
  currentUses: number
  createdBy: string
  createdAt: string
  expiresAt?: string
  lastUsedAt?: string
}

interface BetaUsage {
  id: string
  betaCodeId: string
  userId: string
  userAgent: string
  ipAddress: string
  usedAt: string
  action: string
}

export default function AdminPage() {
  const { code } = useParams<{ code: string }>()
  const [album, setAlbum] = useState<AlbumData | null>(null)
  const [files, setFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Beta kod yönetimi state'leri
  const [activeTab, setActiveTab] = useState<'album' | 'beta'>('album')
  const [betaCodes, setBetaCodes] = useState<BetaCode[]>([])
  const [betaUsages, setBetaUsages] = useState<BetaUsage[]>([])
  const [showCreateBeta, setShowCreateBeta] = useState(false)
  const [newBetaCode, setNewBetaCode] = useState({
    code: '',
    name: '',
    description: '',
    maxUses: '',
    expiresAt: ''
  })

  const fetchAlbumData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/${code}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Album verisi alınamadı')
      }

      const data = await response.json()
      setAlbum(data.album)
      setFiles(data.files)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchBetaCodes = async () => {
    try {
      const response = await fetch('/api/admin/beta-codes')
      if (response.ok) {
        const data = await response.json()
        setBetaCodes(data.betaCodes)
      }
    } catch (err) {
      console.error('Beta codes fetch error:', err)
    }
  }

  const createBetaCode = async () => {
    try {
      const response = await fetch('/api/admin/beta-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBetaCode,
          maxUses: newBetaCode.maxUses ? parseInt(newBetaCode.maxUses) : undefined,
          expiresAt: newBetaCode.expiresAt || undefined
        })
      })
      
      if (response.ok) {
        setNewBetaCode({ code: '', name: '', description: '', maxUses: '', expiresAt: '' })
        setShowCreateBeta(false)
        fetchBetaCodes()
      }
    } catch (err) {
      console.error('Create beta code error:', err)
    }
  }

  const toggleBetaCode = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/beta-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })
      fetchBetaCodes()
    } catch (err) {
      console.error('Toggle beta code error:', err)
    }
  }

  const deleteBetaCode = async (id: string) => {
    if (!confirm('Bu beta kodunu silmek istediğinizden emin misiniz?')) return
    
    try {
      await fetch(`/api/admin/beta-codes/${id}`, {
        method: 'DELETE'
      })
      fetchBetaCodes()
    } catch (err) {
      console.error('Delete beta code error:', err)
    }
  }

  const fetchBetaUsage = async (betaCodeId: string) => {
    try {
      const response = await fetch(`/api/admin/beta-codes/${betaCodeId}/usage`)
      if (response.ok) {
        const data = await response.json()
        setBetaUsages(data.usages)
      }
    } catch (err) {
      console.error('Beta usage fetch error:', err)
    }
  }

  useEffect(() => {
    if (code) {
      fetchAlbumData()
      fetchBetaCodes()
    }
  }, [code])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️'
    } else if (mimeType.startsWith('video/')) {
      return '🎥'
    } else {
      return '📄'
    }
  }

  const downloadFile = async (file: FileData) => {
    try {
      // Google Drive'dan dosya indirme linki al
      const response = await fetch(`/api/files/${file.fileId}/download`)
      if (!response.ok) throw new Error('Dosya indirilemedi')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-primary" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-brand-primary hover:text-brand-primary/80"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Album Bulunamadı</h2>
          <p className="text-gray-600 mb-4">Bu album kodu geçersiz veya silinmiş olabilir.</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-brand-primary hover:text-brand-primary/80"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Ana Sayfa</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Paneli
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={activeTab === 'album' ? fetchAlbumData : fetchBetaCodes}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Yenile</span>
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('album')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'album'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileImage className="w-4 h-4 inline mr-2" />
              Album Yönetimi
            </button>
            <button
              onClick={() => setActiveTab('beta')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'beta'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Key className="w-4 h-4 inline mr-2" />
              Beta Kod Yönetimi
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'album' ? (
          <>
            {/* Album Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileImage className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{album.fileCount}</div>
              <div className="text-sm text-gray-600">Toplam Dosya</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatFileSize(album.totalSize)}</div>
              <div className="text-sm text-gray-600">Toplam Boyut</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatDate(album.createdAt).split(' ')[0]}
              </div>
              <div className="text-sm text-gray-600">Oluşturulma Tarihi</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{album.code}</div>
              <div className="text-sm text-gray-600">Album Kodu</div>
            </div>
          </div>
        </div>

        {/* Dosya Listesi */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Yüklenen Dosyalar</h2>
            <p className="text-sm text-gray-600 mt-1">
              {files.length} dosya yüklenmiş
            </p>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz dosya yüklenmemiş</h3>
              <p className="text-gray-600">
                Misafirler QR kodu okutarak fotoğraf yüklemeye başladığında burada görünecek.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {files.map((file) => (
                <div key={file.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getFileIcon(file.mimeType)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadFile(file)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>İndir</span>
                      </button>
                      
                      <a
                        href={`https://drive.google.com/file/d/${file.fileId}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Görüntüle</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        ) : (
          <>
            {/* Beta Kod Yönetimi */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Beta Kodları</h2>
                <button
                  onClick={() => setShowCreateBeta(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Beta Kodu</span>
                </button>
              </div>

              {showCreateBeta && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Yeni Beta Kodu Oluştur</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kod</label>
                      <input
                        type="text"
                        value={newBetaCode.code}
                        onChange={(e) => setNewBetaCode({...newBetaCode, code: e.target.value.toUpperCase()})}
                        placeholder="örn: FRIEND2024"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
                      <input
                        type="text"
                        value={newBetaCode.name}
                        onChange={(e) => setNewBetaCode({...newBetaCode, name: e.target.value})}
                        placeholder="örn: Arkadaş Grubu"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                      <input
                        type="text"
                        value={newBetaCode.description}
                        onChange={(e) => setNewBetaCode({...newBetaCode, description: e.target.value})}
                        placeholder="Opsiyonel açıklama"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maksimum Kullanım</label>
                      <input
                        type="number"
                        value={newBetaCode.maxUses}
                        onChange={(e) => setNewBetaCode({...newBetaCode, maxUses: e.target.value})}
                        placeholder="Boş bırak = sınırsız"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma Tarihi</label>
                      <input
                        type="datetime-local"
                        value={newBetaCode.expiresAt}
                        onChange={(e) => setNewBetaCode({...newBetaCode, expiresAt: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setShowCreateBeta(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={createBetaCode}
                      className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 transition-colors"
                    >
                      Oluştur
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {betaCodes.map((betaCode) => (
                  <div key={betaCode.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{betaCode.name}</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {betaCode.code}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            betaCode.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {betaCode.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        {betaCode.description && (
                          <p className="text-sm text-gray-600 mb-2">{betaCode.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Kullanım: {betaCode.currentUses}{betaCode.maxUses ? `/${betaCode.maxUses}` : ''}</span>
                          <span>Oluşturulma: {formatDate(betaCode.createdAt)}</span>
                          {betaCode.lastUsedAt && (
                            <span>Son Kullanım: {formatDate(betaCode.lastUsedAt)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => fetchBetaUsage(betaCode.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>İstatistikler</span>
                        </button>
                        <button
                          onClick={() => toggleBetaCode(betaCode.id, !betaCode.isActive)}
                          className={`inline-flex items-center space-x-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                            betaCode.isActive
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          <Edit className="w-4 h-4" />
                          <span>{betaCode.isActive ? 'Pasifleştir' : 'Aktifleştir'}</span>
                        </button>
                        <button
                          onClick={() => deleteBetaCode(betaCode.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Sil</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Beta Kullanım İstatistikleri */}
            {betaUsages.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kullanım İstatistikleri</h3>
                <div className="space-y-2">
                  {betaUsages.map((usage) => (
                    <div key={usage.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{usage.action}</span>
                        <span className="text-xs text-gray-500 ml-2">{usage.userId}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(usage.usedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
