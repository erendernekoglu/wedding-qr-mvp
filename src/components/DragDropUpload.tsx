'use client'
import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface DragDropUploadProps {
  onFilesSelected: (files: FileList) => void
  isUploading?: boolean
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

export default function DragDropUpload({
  onFilesSelected,
  isUploading = false,
  maxFiles = 10,
  maxFileSize = 50,
  acceptedTypes = ['image/*', 'video/*', 'audio/*'],
  className = ''
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const [previewFiles, setPreviewFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = (files: FileList): { validFiles: File[]; errors: string[] } => {
    const validFiles: File[] = []
    const errors: string[] = []

    // Check file count
    if (files.length > maxFiles) {
      errors.push(`Maksimum ${maxFiles} dosya seçebilirsiniz`)
      return { validFiles, errors }
    }

    // Check each file
    Array.from(files).forEach((file, index) => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name} çok büyük (max ${maxFileSize}MB)`)
        return
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1))
        }
        return file.type === type
      })

      if (!isValidType) {
        errors.push(`${file.name} desteklenmeyen dosya türü`)
        return
      }

      validFiles.push(file)
    })

    return { validFiles, errors }
  }

  const handleFiles = useCallback((files: FileList) => {
    const { validFiles, errors } = validateFiles(files)
    
    setErrors(errors)
    setPreviewFiles(validFiles)
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles as any)
    }
  }, [maxFiles, maxFileSize, acceptedTypes, onFilesSelected])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev - 1)
    if (dragCounter === 1) {
      setIsDragOver(false)
    }
  }, [dragCounter])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setDragCounter(0)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeFile = (index: number) => {
    const newFiles = previewFiles.filter((_, i) => i !== index)
    setPreviewFiles(newFiles)
    setErrors([])
  }

  const clearAll = () => {
    setPreviewFiles([])
    setErrors([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type.startsWith('video/')) return '🎥'
    if (file.type.startsWith('audio/')) return '🎵'
    return '📄'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag & Drop Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-brand-primary bg-brand-primary/5 scale-105' 
            : 'border-gray-300 hover:border-brand-primary/50'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="space-y-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full transition-colors ${
            isDragOver ? 'bg-brand-primary text-white' : 'bg-brand-primary/10 text-brand-primary'
          }`}>
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent" />
            ) : (
              <Camera className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isUploading ? 'Yükleniyor...' : 'Fotoğraflarınızı Paylaşın'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isDragOver 
                ? 'Dosyaları buraya bırakın' 
                : 'Dosyaları buraya sürükleyip bırakın veya seçmek için tıklayın'
              }
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span>Maksimum {maxFiles} dosya</span>
              <span>•</span>
              <span>Max {maxFileSize}MB</span>
              <span>•</span>
              <span>Resim, video, ses</span>
            </div>
          </div>

          {!isUploading && (
            <button
              type="button"
              className="inline-flex items-center px-6 py-3 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Dosya Seç
            </button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">Hata</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* File Previews */}
      {previewFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Seçilen Dosyalar ({previewFiles.length})
            </h4>
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Tümünü Temizle
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {previewFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
              >
                <div className="text-2xl">{getFileIcon(file)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
            <div>
              <p className="text-sm font-medium text-blue-800">Dosyalar yükleniyor...</p>
              <p className="text-xs text-blue-600">Lütfen sayfayı kapatmayın</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
