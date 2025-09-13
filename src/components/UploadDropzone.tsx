'use client'
import { useRef, useState } from 'react'
import clsx from 'clsx'
import { useToast } from '@/components/ui/Toast'

interface UploadItem {
  id: string
  name: string
  size: number
  progress: number
  status: 'idle' | 'uploading' | 'done' | 'error'
  file: File
}

async function getUploadUrl(code: string, file: File) {
  const r = await fetch(`/api/u/${code}/sign`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ filename: file.name, size: file.size, mimeType: file.type })
  })
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({}))
    throw new Error(errorData.error || 'sign failed')
  }
  const { uploadUrl } = await r.json()
  return uploadUrl as string
}

async function uploadToServer(albumCode: string, file: File, onProgress?: (p: number) => void) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('albumCode', albumCode)

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

async function completeUpload(code: string, payload: { fileId: string; name: string; size: number; mimeType: string }) {
  const r = await fetch(`/api/u/${code}/complete`, {
    method: 'POST', 
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!r.ok) throw new Error('complete failed')
  return r.json()
}

export default function UploadDropzone({ albumCode }: { albumCode: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const { toast } = useToast()

  const onPick = () => inputRef.current?.click()

  const uploadFile = async (item: UploadItem) => {
    try {
      setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: 'uploading', progress: 0 } : x))
      
      const result = await uploadToServer(albumCode, item.file, (p) => {
        setItems(prev => prev.map(x => x.id === item.id ? { ...x, progress: p } : x))
      })
      
      if (result.status >= 200 && result.status < 300) {
        setItems(prev => prev.map(x => x.id === item.id ? { ...x, progress: 100, status: 'done' } : x))
        toast({
          title: 'Yükleme başarılı!',
          description: `${item.file.name} başarıyla yüklendi.`,
          variant: 'success'
        })
      } else {
        throw new Error('upload failed')
      }
    } catch (e: any) {
      setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: 'error' } : x))
      toast({
        title: 'Yükleme başarısız',
        description: 'Yükleme başarısız. Yeniden dene.',
        variant: 'error'
      })
    }
  }

  const onFiles = async (files: FileList | null) => {
    if (!files) return
    const list = Array.from(files)
    for (const f of list) {
      const id = `${f.name}-${f.size}-${Date.now()}`
      const newItem: UploadItem = { 
        id, 
        name: f.name, 
        size: f.size, 
        progress: 0, 
        status: 'idle',
        file: f
      }
      setItems(prev => [...prev, newItem])
      await uploadFile(newItem)
    }
  }

  const retryUpload = (item: UploadItem) => {
    uploadFile(item)
  }

  const getStatusText = (item: UploadItem) => {
    switch (item.status) {
      case 'uploading':
        return `yükleniyor %${item.progress}`
      case 'done':
        return 'tamamlandı ✅'
      case 'error':
        return 'hata ❌'
      default:
        return 'bekliyor'
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

  return (
    <div className="space-y-3">
      <input 
        ref={inputRef} 
        type="file" 
        accept="image/*,video/*" 
        multiple 
        className="hidden" 
        onChange={e => onFiles(e.target.files)} 
      />
      <button 
        onClick={onPick} 
        className="w-full rounded-xl bg-brand-primary text-white py-3 font-medium hover:bg-brand-primary/90 transition-colors"
      >
        Foto/Video Seç
      </button>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="rounded-lg border p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.name}</div>
                <div className="text-xs text-slate-500">
                  {(item.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={clsx('text-xs font-medium', getStatusColor(item.status))}>
                  {getStatusText(item)}
                </div>
                {item.status === 'error' && (
                  <button
                    onClick={() => retryUpload(item)}
                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Tekrar Dene
                  </button>
                )}
              </div>
            </div>
            
            {item.status === 'uploading' && (
              <div className="mt-2 h-2 w-full rounded bg-slate-100">
                <div 
                  className="h-2 rounded bg-brand-accent transition-all duration-300" 
                  style={{ width: `${item.progress}%` }} 
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}