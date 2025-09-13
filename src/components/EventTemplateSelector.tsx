'use client'
import { useState } from 'react'
import { Search, Filter, Check, Star, Calendar, Users, Camera, Settings, X } from 'lucide-react'
import { EventTemplate, EVENT_TEMPLATES, getTemplatesByCategory, getTemplateCategories } from '@/lib/event-templates'

interface EventTemplateSelectorProps {
  onSelectTemplate: (template: EventTemplate) => void
  onClose: () => void
  className?: string
}

export default function EventTemplateSelector({
  onSelectTemplate,
  onClose,
  className = ''
}: EventTemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null)

  const categories = ['all', ...getTemplateCategories()]
  
  const filteredTemplates = EVENT_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectTemplate = (template: EventTemplate) => {
    setSelectedTemplate(template)
  }

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wedding': return '💒'
      case 'corporate': return '🏢'
      case 'birthday': return '🎂'
      case 'graduation': return '🎓'
      case 'anniversary': return '💕'
      case 'custom': return '🎉'
      default: return '📅'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'wedding': return 'Düğün'
      case 'corporate': return 'Kurumsal'
      case 'birthday': return 'Doğum Günü'
      case 'graduation': return 'Mezuniyet'
      case 'anniversary': return 'Yıldönümü'
      case 'custom': return 'Özel'
      default: return 'Tümü'
    }
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Etkinlik Şablonu Seçin</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Search and Filter */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Şablon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`
                  relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${selectedTemplate?.id === template.id
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {selectedTemplate?.id === template.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-100">
                    {template.assets?.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={template.assets.coverImage} alt={template.name} className="w-full h-full object-cover" />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: template.color + '20' }}
                      >
                        {template.icon}
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded bg-white/80 backdrop-blur border">
                      {template.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <Camera className="w-3 h-3 mr-1" />
                        Max {template.defaultSettings.maxFiles} dosya
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Settings className="w-3 h-3 mr-1" />
                        {template.defaultSettings.maxFileSize}MB limit
                      </div>
                      {template.assets?.stickers && (
                        <div className="flex items-center gap-1 text-sm">
                          {template.assets.stickers.slice(0,5).map((s, i) => (
                            <span key={i} className="inline-block">{s}</span>
                          ))}
                        </div>
                      )}
                      {template.customFields && template.customFields.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Star className="w-3 h-3 mr-1" />
                          {template.customFields.length} özel alan
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Şablon bulunamadı
              </h3>
              <p className="text-gray-600">
                Arama kriterlerinize uygun şablon bulunamadı.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedTemplate ? (
                <span className="text-brand-primary font-medium">
                  "{selectedTemplate.name}" seçildi
                </span>
              ) : (
                'Lütfen bir şablon seçin'
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedTemplate}
                className="px-6 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Şablonu Kullan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
