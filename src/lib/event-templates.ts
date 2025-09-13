export interface EventTemplate {
  id: string
  name: string
  description: string
  category: 'wedding' | 'corporate' | 'birthday' | 'graduation' | 'anniversary' | 'custom'
  icon: string
  color: string
  defaultSettings: {
    maxFiles: number
    maxFileSize: number
    allowedTypes: string[]
    autoApprove: boolean
    requireApproval: boolean
    enableComments: boolean
    enableDownload: boolean
    enableSharing: boolean
    watermark: boolean
    compression: boolean
  }
  customFields?: {
    name: string
    type: 'text' | 'number' | 'date' | 'select' | 'textarea'
    required: boolean
    options?: string[]
    placeholder?: string
  }[]
  assets?: {
    coverImage: string
    gallery?: string[]
    stickers?: string[] // emoji veya küçük ikon stringleri
  }
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'wedding-classic',
    name: 'Düğün - Klasik',
    description: 'Geleneksel düğün etkinliği için hazır şablon',
    category: 'wedding',
    icon: '💒',
    color: '#C2185B',
    assets: {
      coverImage: 'https://images.pexels.com/photos/265740/pexels-photo-265740.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      gallery: [
        'https://images.pexels.com/photos/230290/pexels-photo-230290.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
        'https://images.pexels.com/photos/313707/pexels-photo-313707.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
      ],
      stickers: ['💍','💐','👰','🤵']
    },
    defaultSettings: {
      maxFiles: 50,
      maxFileSize: 100,
      allowedTypes: ['image/*', 'video/*'],
      autoApprove: true,
      requireApproval: false,
      enableComments: true,
      enableDownload: true,
      enableSharing: true,
      watermark: false,
      compression: true
    },
    customFields: [
      {
        name: 'Gelin Adı',
        type: 'text',
        required: true,
        placeholder: 'Gelin adını girin'
      },
      {
        name: 'Damat Adı',
        type: 'text',
        required: true,
        placeholder: 'Damat adını girin'
      },
      {
        name: 'Düğün Tarihi',
        type: 'date',
        required: true
      },
      {
        name: 'Düğün Yeri',
        type: 'text',
        required: false,
        placeholder: 'Düğün salonu veya mekan'
      }
    ]
  },
  {
    id: 'corporate-meeting',
    name: 'Kurumsal Toplantı',
    description: 'Şirket toplantıları ve etkinlikleri için şablon',
    category: 'corporate',
    icon: '🏢',
    color: '#2563EB',
    assets: {
      coverImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      gallery: [
        'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
        'https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
      ],
      stickers: ['📊','💼','🧑‍💻']
    },
    defaultSettings: {
      maxFiles: 20,
      maxFileSize: 50,
      allowedTypes: ['image/*', 'video/*', 'application/pdf'],
      autoApprove: false,
      requireApproval: true,
      enableComments: false,
      enableDownload: true,
      enableSharing: false,
      watermark: true,
      compression: true
    },
    customFields: [
      {
        name: 'Toplantı Konusu',
        type: 'text',
        required: true,
        placeholder: 'Toplantı konusunu girin'
      },
      {
        name: 'Katılımcı Sayısı',
        type: 'number',
        required: false
      },
      {
        name: 'Departman',
        type: 'select',
        required: false,
        options: ['İnsan Kaynakları', 'Pazarlama', 'Satış', 'Teknoloji', 'Finans', 'Diğer']
      }
    ]
  },
  {
    id: 'birthday-party',
    name: 'Doğum Günü Partisi',
    description: 'Doğum günü kutlamaları için eğlenceli şablon',
    category: 'birthday',
    icon: '🎂',
    color: '#F59E0B',
    assets: {
      coverImage: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      gallery: [
        'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
        'https://images.pexels.com/photos/207983/pexels-photo-207983.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
      ],
      stickers: ['🎈','🎁','🎉']
    },
    defaultSettings: {
      maxFiles: 30,
      maxFileSize: 25,
      allowedTypes: ['image/*', 'video/*'],
      autoApprove: true,
      requireApproval: false,
      enableComments: true,
      enableDownload: true,
      enableSharing: true,
      watermark: false,
      compression: true
    },
    customFields: [
      {
        name: 'Doğum Günü Kişisi',
        type: 'text',
        required: true,
        placeholder: 'Doğum günü kutlanan kişinin adı'
      },
      {
        name: 'Yaş',
        type: 'number',
        required: false
      },
      {
        name: 'Tema',
        type: 'select',
        required: false,
        options: ['Klasik', 'Süper Kahraman', 'Prenses', 'Hayvan', 'Spor', 'Müzik', 'Diğer']
      }
    ]
  },
  {
    id: 'graduation-ceremony',
    name: 'Mezuniyet Töreni',
    description: 'Mezuniyet törenleri için özel şablon',
    category: 'graduation',
    icon: '🎓',
    color: '#7C3AED',
    assets: {
      coverImage: 'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      gallery: [
        'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
      ],
      stickers: ['🎓','📜']
    },
    defaultSettings: {
      maxFiles: 40,
      maxFileSize: 50,
      allowedTypes: ['image/*', 'video/*'],
      autoApprove: true,
      requireApproval: false,
      enableComments: true,
      enableDownload: true,
      enableSharing: true,
      watermark: false,
      compression: true
    },
    customFields: [
      {
        name: 'Mezun Adı',
        type: 'text',
        required: true,
        placeholder: 'Mezun olan kişinin adı'
      },
      {
        name: 'Bölüm',
        type: 'text',
        required: false,
        placeholder: 'Mezun olunan bölüm'
      },
      {
        name: 'Okul',
        type: 'text',
        required: false,
        placeholder: 'Okul adı'
      },
      {
        name: 'Mezuniyet Yılı',
        type: 'number',
        required: false
      }
    ]
  },
  {
    id: 'anniversary-celebration',
    name: 'Yıldönümü Kutlaması',
    description: 'Evlilik yıldönümü ve özel günler için şablon',
    category: 'anniversary',
    icon: '💕',
    color: '#EC4899',
    assets: {
      coverImage: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      gallery: [
        'https://images.pexels.com/photos/1779491/pexels-photo-1779491.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
      ],
      stickers: ['💕','🍷','🍰']
    },
    defaultSettings: {
      maxFiles: 25,
      maxFileSize: 30,
      allowedTypes: ['image/*', 'video/*'],
      autoApprove: true,
      requireApproval: false,
      enableComments: true,
      enableDownload: true,
      enableSharing: true,
      watermark: false,
      compression: true
    },
    customFields: [
      {
        name: 'Yıldönümü Türü',
        type: 'select',
        required: true,
        options: ['Evlilik Yıldönümü', 'Birliktelik Yıldönümü', 'İş Yıldönümü', 'Diğer']
      },
      {
        name: 'Kaçıncı Yıl',
        type: 'number',
        required: false
      },
      {
        name: 'Çift Adı',
        type: 'text',
        required: false,
        placeholder: 'Çiftin adları'
      }
    ]
  },
  {
    id: 'custom-event',
    name: 'Özel Etkinlik',
    description: 'Tamamen özelleştirilebilir etkinlik şablonu',
    category: 'custom',
    icon: '🎉',
    color: '#10B981',
    assets: {
      coverImage: 'https://images.pexels.com/photos/1767434/pexels-photo-1767434.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      gallery: [
        'https://images.pexels.com/photos/1763863/pexels-photo-1763863.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
      ],
      stickers: ['✨','📷']
    },
    defaultSettings: {
      maxFiles: 20,
      maxFileSize: 50,
      allowedTypes: ['image/*', 'video/*', 'audio/*'],
      autoApprove: true,
      requireApproval: false,
      enableComments: true,
      enableDownload: true,
      enableSharing: true,
      watermark: false,
      compression: true
    }
  }
  ,
  {
    id: 'animals-party',
    name: 'Hayvan Temalı Parti',
    description: 'Çocuklar ve hayvan severler için eğlenceli tema',
    category: 'custom',
    icon: '🐾',
    color: '#22C55E',
    assets: {
      coverImage: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      gallery: [
        'https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
      ],
      stickers: ['🦁','🐼','🐵','🦊','🐯']
    },
    defaultSettings: {
      maxFiles: 30,
      maxFileSize: 25,
      allowedTypes: ['image/*', 'video/*'],
      autoApprove: true,
      requireApproval: false,
      enableComments: true,
      enableDownload: true,
      enableSharing: true,
      watermark: false,
      compression: true
    }
  }
]

export const getTemplateById = (id: string): EventTemplate | undefined => {
  return EVENT_TEMPLATES.find(template => template.id === id)
}

export const getTemplatesByCategory = (category: string): EventTemplate[] => {
  return EVENT_TEMPLATES.filter(template => template.category === category)
}

export const getTemplateCategories = (): string[] => {
  const categories = EVENT_TEMPLATES.map(template => template.category)
  return Array.from(new Set(categories))
}
