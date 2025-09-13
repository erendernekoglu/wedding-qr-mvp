'use client'
import { useState } from 'react'
import { Trash2, Edit, Copy, Download, Archive, MoreHorizontal, Check, X } from 'lucide-react'

interface BulkOperationsProps {
  selectedItems: string[]
  onSelectAll: (selected: boolean) => void
  onBulkAction: (action: string, items: string[]) => void
  totalItems: number
  availableActions?: string[]
  className?: string
}

const BULK_ACTIONS = {
  delete: {
    label: 'Sil',
    icon: Trash2,
    color: 'text-red-600 hover:text-red-700',
    bgColor: 'hover:bg-red-50'
  },
  edit: {
    label: 'Düzenle',
    icon: Edit,
    color: 'text-blue-600 hover:text-blue-700',
    bgColor: 'hover:bg-blue-50'
  },
  duplicate: {
    label: 'Kopyala',
    icon: Copy,
    color: 'text-green-600 hover:text-green-700',
    bgColor: 'hover:bg-green-50'
  },
  download: {
    label: 'İndir',
    icon: Download,
    color: 'text-purple-600 hover:text-purple-700',
    bgColor: 'hover:bg-purple-50'
  },
  archive: {
    label: 'Arşivle',
    icon: Archive,
    color: 'text-gray-600 hover:text-gray-700',
    bgColor: 'hover:bg-gray-50'
  }
}

export default function BulkOperations({
  selectedItems,
  onSelectAll,
  onBulkAction,
  totalItems,
  availableActions = ['delete', 'edit', 'duplicate', 'download', 'archive'],
  className = ''
}: BulkOperationsProps) {
  const [showActions, setShowActions] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedCount = selectedItems.length
  const allSelected = selectedCount === totalItems && totalItems > 0
  const someSelected = selectedCount > 0 && selectedCount < totalItems

  const handleSelectAll = () => {
    onSelectAll(!allSelected)
  }

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return

    setIsProcessing(true)
    try {
      await onBulkAction(action, selectedItems)
      setShowActions(false)
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (selectedCount === 0) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
          />
          <span className="text-sm text-gray-600">
            {allSelected ? 'Tümünü Seç' : 'Tümünü Seç'}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {totalItems} öğe
        </span>
      </div>
    )
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <span className="text-sm font-medium text-blue-900">
              {allSelected ? 'Tümü seçili' : `${selectedCount} öğe seçili`}
            </span>
            {someSelected && (
              <span className="text-xs text-blue-600">
                ({totalItems} öğeden {selectedCount} tanesi)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {availableActions.map((action) => {
              const actionConfig = BULK_ACTIONS[action as keyof typeof BULK_ACTIONS]
              if (!actionConfig) return null

              const Icon = actionConfig.icon
              return (
                <button
                  key={action}
                  onClick={() => handleBulkAction(action)}
                  disabled={isProcessing}
                  className={`
                    inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md
                    transition-colors duration-200
                    ${actionConfig.color} ${actionConfig.bgColor}
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {actionConfig.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onSelectAll(false)}
            className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
          <span>İşlem yapılıyor...</span>
        </div>
      )}
    </div>
  )
}

// Bulk Action Confirmation Modal
interface BulkActionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  action: string
  itemCount: number
  itemType: string
  isDestructive?: boolean
}

export function BulkActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  itemCount,
  itemType,
  isDestructive = false
}: BulkActionModalProps) {
  if (!isOpen) return null

  const actionConfig = BULK_ACTIONS[action as keyof typeof BULK_ACTIONS]
  const Icon = actionConfig?.icon || Trash2

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-100' : 'bg-blue-100'}`}>
            <Icon className={`w-6 h-6 ${isDestructive ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Toplu İşlem Onayı
          </h3>
        </div>

        <p className="text-gray-600 mb-6">
          <strong>{itemCount}</strong> {itemType} için <strong>{actionConfig?.label || action}</strong> işlemini 
          gerçekleştirmek istediğinizden emin misiniz?
          {isDestructive && (
            <span className="block mt-2 text-red-600 font-medium">
              Bu işlem geri alınamaz!
            </span>
          )}
        </p>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-brand-primary hover:bg-brand-primary/90'
            }`}
          >
            {isDestructive ? 'Sil' : 'Onayla'}
          </button>
        </div>
      </div>
    </div>
  )
}
