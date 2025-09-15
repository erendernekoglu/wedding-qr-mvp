'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  ShieldOff,
  Mail,
  Calendar,
  Activity,
  Users as UsersIcon
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  phone?: string
  company?: string
  isAdmin: boolean
  createdAt: string
  lastLoginAt?: string
}

interface UserStats {
  totalUsers: number
  adminUsers: number
  regularUsers: number
  newUsersToday: number
  activeUsersToday: number
}

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    newUsersToday: 0,
    activeUsersToday: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'lastLoginAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterAndSortUsers()
  }, [users, searchTerm, filterRole, sortBy, sortOrder])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data.users)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Users fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortUsers = () => {
    let filtered = [...users]

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Rol filtresi
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => 
        filterRole === 'admin' ? user.isAdmin : !user.isAdmin
      )
    }

    // Sıralama
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'lastLoginAt':
          aValue = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0
          bValue = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredUsers(filtered)
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: !currentStatus })
      })

      const data = await response.json()
      
      if (data.success) {
        // Kullanıcı listesini güncelle
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isAdmin: !currentStatus } : user
        ))
      }
    } catch (error) {
      console.error('Toggle admin status error:', error)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setUsers(prev => prev.filter(user => user.id !== userId))
      }
    } catch (error) {
      console.error('Delete user error:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Az önce'
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`
    return `${Math.floor(diffInMinutes / 1440)} gün önce`
  }

  if (loading) {
    return (
      <AdminLayout title="Kullanıcı Yönetimi" description="Sistem kullanıcılarını yönetin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Kullanıcı Yönetimi" description="Sistem kullanıcılarını yönetin">
      <div className="space-y-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" />
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
                  <Shield className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Admin Kullanıcı</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.adminUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Bugün Kayıt</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.newUsersToday}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Bugün Aktif</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeUsersToday}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtreler ve Arama */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="İsim, e-posta veya şirket ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">Tüm Roller</option>
                  <option value="admin">Admin</option>
                  <option value="user">Kullanıcı</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sırala</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="createdAt">Kayıt Tarihi</option>
                  <option value="name">İsim</option>
                  <option value="email">E-posta</option>
                  <option value="lastLoginAt">Son Giriş</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sıra</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="desc">Azalan</option>
                  <option value="asc">Artan</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Kullanıcı Listesi */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li key={user.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-pink-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        {user.isAdmin && (
                          <Shield className="ml-2 h-4 w-4 text-pink-500" />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-1" />
                        {user.email}
                      </div>
                      {user.company && (
                        <p className="text-sm text-gray-500">{user.company}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-gray-500">
                      <p>Kayıt: {formatDate(user.createdAt)}</p>
                      {user.lastLoginAt && (
                        <p>Son giriş: {getTimeAgo(user.lastLoginAt)}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                        className={`p-2 rounded-md ${
                          user.isAdmin 
                            ? 'text-pink-600 hover:bg-pink-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={user.isAdmin ? 'Admin yetkisini kaldır' : 'Admin yetkisi ver'}
                      >
                        {user.isAdmin ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                      </button>
                      
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Kullanıcıyı sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Kullanıcı bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Arama kriterlerinize uygun kullanıcı bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function AdminUsersPage() {
  return (
    <AdminAuthProvider>
      <AdminUsers />
    </AdminAuthProvider>
  )
}
