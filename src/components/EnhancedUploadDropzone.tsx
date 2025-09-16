'use client'
import { useRef, useState } from 'react'
import clsx from 'clsx'
import { Camera, Upload, X, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface UploadItem {
  id: string
  name: string
  size: number
  progress: number
  status: 'idle' | 'uploading' | 'done' | 'error'
  file: File
  preview?: string
  isFromCamera?: boolean
}

interface EnhancedUploadDropzoneProps {
  albumCode: string
  tableNumber?: string
  onPhotoCountUpdate?: (count: number) => void
}

async function uploadToServer(albumCode: string, file: File, tableNumber: string = '1', onProgress?: (p: number) => void) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('albumCode', albumCode)
  formData.append('tableNumber', tableNumber)

  const xhr = new XMLHttpRequest()
  return new Promise<{ status: number; response?: any }>((resolve, reject) => {
    xhr.open('POST', `/api/u/${albumCode}/upload`, true)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      try {
        const status = xhr.status
        const text = xhr.responseText
        const json = text ? JSON.parse(text) : undefined
        resolve({ status, response: json })
      } catch (e) {
        resolve({ status: xhr.status })
      }
    }
    xhr.onerror = () => reject(new Error('upload failed'))
    xhr.send(formData)
  })
}

export default function EnhancedUploadDropzone({ albumCode, tableNumber = '1', onPhotoCountUpdate }: EnhancedUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()

  const onPickFiles = () => fileInputRef.current?.click()
  const onTakePhoto = () => cameraInputRef.current?.click()

  const createUploadItem = (file: File, fromCamera: boolean = false): UploadItem => {
    const id = `${file.name}-${file.size}-${Date.now()}`
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    
    return {
      id,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'idle',
      file,
      preview,
      isFromCamera: fromCamera
    }
  }


  const uploadFile = async (item: UploadItem) => {
    try {
      setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: 'uploading', progress: 0 } : x))
      
      const result = await uploadToServer(albumCode, item.file, tableNumber, (p) => {
        setItems(prev => prev.map(x => x.id === item.id ? { ...x, progress: p } : x))
      })
      
      if (result.status >= 200 && result.status < 300) {
        setItems(prev => prev.map(x => x.id === item.id ? { ...x, progress: 100, status: 'done' } : x))
        toast({
          title: 'Yükleme başarılı!',
          description: `${item.file.name} başarıyla yüklendi.`,
          variant: 'success'
        })
        
        // Fotoğraf sayısını güncelle
        if (onPhotoCountUpdate) {
          onPhotoCountUpdate(1) // Her başarılı yükleme için +1
        }
      } else {
        throw new Error('upload failed')
      }
    } catch (e: any) {
      console.error('Upload error:', e)
      setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: 'error' } : x))
      toast({
        title: 'Yükleme başarısız',
        description: e.message || 'Yükleme başarısız. Yeniden dene.',
        variant: 'error'
      })
    }
  }

  const onFiles = async (files: FileList | null, fromCamera: boolean = false) => {
    if (!files) return
    
    const fileList = Array.from(files)
    const newItems: UploadItem[] = []
    
    // Tüm dosyaları önce ekle
    for (const file of fileList) {
      const newItem = createUploadItem(file, fromCamera)
      newItems.push(newItem)
      setItems(prev => [...prev, newItem])
    }
    
    // Sonra sırayla yükle
    for (const item of newItems) {
      await uploadFile(item)
    }
  }

  const retryUpload = (item: UploadItem) => {
    uploadFile(item)
  }

  const removeItem = (itemId: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === itemId)
      if (item?.preview) {
        URL.revokeObjectURL(item.preview)
      }
      return prev.filter(i => i.id !== itemId)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    onFiles(e.dataTransfer.files, false)
  }

  const getStatusIcon = (status: UploadItem['status']) => {
    switch (status) {
      case 'uploading':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
      case 'done':
        return <Check className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusText = (item: UploadItem) => {
    switch (item.status) {
      case 'uploading':
        return `Yükleniyor %${item.progress}`
      case 'done':
        return 'Tamamlandı'
      case 'error':
        return 'Hata'
      default:
        return 'Bekliyor'
    }
  }

  const getStatusColor = (status: UploadItem['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600'
      case 'done':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-slate-500'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Input Elements */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*,video/*" 
        multiple 
        className="hidden" 
        onChange={e => onFiles(e.target.files, false)} 
      />
      <input 
        ref={cameraInputRef} 
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        onChange={e => onFiles(e.target.files, true)} 
      />

      {/* Upload Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onTakePhoto}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Camera className="w-5 h-5" />
          <span>Fotoğraf Çek</span>
        </button>
        
        <button 
          onClick={onPickFiles}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Upload className="w-5 h-5" />
          <span>Dosya Seç</span>
        </button>
      </div>

      {/* Drag & Drop Area */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        )}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 font-medium mb-2">
          {isDragging ? 'Dosyaları buraya bırakın' : 'Dosyaları sürükleyip bırakın'}
        </p>
        <p className="text-sm text-gray-500">
          Fotoğraf ve video dosyaları desteklenir
        </p>
      </div>

      {/* Upload Progress */}
      {items.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Yüklenen Dosyalar ({items.length})
          </h3>
          
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start space-x-4">
                  {/* Preview */}
                  {item.preview ? (
                    <div className="flex-shrink-0">
                      <img 
                        src={item.preview} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        style={{
                          transform: item.isFromCamera ? 'scaleX(-1)' : 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(item.size)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <div className={clsx('text-xs font-medium', getStatusColor(item.status))}>
                          {getStatusText(item)}
                        </div>
                        {item.status !== 'uploading' && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {item.status === 'uploading' && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${item.progress}%` }} 
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Retry */}
                    {item.status === 'error' && (
                      <div className="mt-3">
                        <button
                          onClick={() => retryUpload(item)}
                          className="flex items-center space-x-1 text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Tekrar Dene</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
