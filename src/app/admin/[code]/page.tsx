'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, Download, Eye, Calendar, FileImage, Users, RefreshCw } from 'lucide-react'
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

export default function AdminPage() {
  const { code } = useParams<{ code: string }>()
  const [album, setAlbum] = useState<AlbumData | null>(null)
  const [files, setFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (code) {
      fetchAlbumData()
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
                Album Yönetimi
              </h1>
            </div>
            <button
              onClick={fetchAlbumData}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yenile</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  )
}
