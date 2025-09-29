import { useState, useEffect } from 'react'
import { database } from '../../lib/supabase'
import AdminNavigation from './AdminNavigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, Search, UserCheck, UserX, Eye, 
  AlertCircle, CheckCircle, Users, Filter,
  Mail, Phone, Calendar, MapPin, Instagram,
  Hash, Youtube, Globe, Shield, Clock
} from 'lucide-react'

const UserApprovalManager = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetail, setShowUserDetail] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 모든 사용자 프로필 로드
      const userProfiles = await database.userProfiles.getAll()
      setUsers(userProfiles || [])
      
    } catch (error) {
      console.error('Load users error:', error)
      setError('ユーザー情報の読み込みに失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // 검색어 필터링
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.includes(term)
      )
    }

    // 상태 필터링
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (statusFilter === 'pending') return !user.approved
        if (statusFilter === 'approved') return user.approved
        return true
      })
    }

    setFilteredUsers(filtered)
  }

  const handleApproveUser = async (userId) => {
    try {
      setProcessing(true)
      setError('')
      
      await database.userProfiles.update(userId, {
        approved: true,
        approved_at: new Date().toISOString()
      })
      
      setSuccess('ユーザーを承認しました。')
      loadUsers()
      
    } catch (error) {
      console.error('Approve user error:', error)
      setError('ユーザーの承認に失敗しました。')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectUser = async (userId) => {
    try {
      setProcessing(true)
      setError('')
      
      await database.userProfiles.update(userId, {
        approved: false,
        rejected_at: new Date().toISOString()
      })
      
      setSuccess('ユーザーを却下しました。')
      loadUsers()
      
    } catch (error) {
      console.error('Reject user error:', error)
      setError('ユーザーの却下に失敗しました。')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (user) => {
    if (user.approved) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          承認済み
        </Badge>
      )
    } else if (user.rejected_at) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <UserX className="h-3 w-3 mr-1" />
          却下
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          承認待ち
        </Badge>
      )
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const UserDetailModal = ({ user, onClose }) => {
    if (!user) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">ユーザー詳細</h3>
              <Button variant="outline" onClick={onClose}>
                ×
              </Button>
            </div>

            <div className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  基本情報
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">名前:</span>
                    <p className="text-gray-900">{user.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">年齢:</span>
                    <p className="text-gray-900">{user.age || 'N/A'}歳</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">肌タイプ:</span>
                    <p className="text-gray-900">
                      {user.skin_type === 'dry' ? '乾性肌' :
                       user.skin_type === 'oily' ? '脂性肌' :
                       user.skin_type === 'combination' ? '混合肌' :
                       user.skin_type === 'sensitive' ? '敏感肌' : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">登録日:</span>
                    <p className="text-gray-900">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* 연락처 정보 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  連絡先情報
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">メール:</span>
                    <p className="text-gray-900">{user.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">電話番号:</span>
                    <p className="text-gray-900">{user.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* 지역 정보 */}
              {(user.prefecture || user.city) && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    地域情報
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">都道府県:</span>
                      <p className="text-gray-900">{user.prefecture || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">市区町村:</span>
                      <p className="text-gray-900">{user.city || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SNS 정보 */}
              {(user.instagram_url || user.tiktok_url || user.youtube_url || user.other_sns_url) && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <Instagram className="h-4 w-4 mr-2" />
                    SNS情報
                  </h4>
                  <div className="space-y-2 text-sm">
                    {user.instagram_url && (
                      <div className="flex items-center space-x-2">
                        <Instagram className="h-4 w-4 text-pink-500" />
                        <a href={user.instagram_url} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          Instagram
                        </a>
                      </div>
                    )}
                    {user.tiktok_url && (
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-black" />
                        <a href={user.tiktok_url} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          TikTok
                        </a>
                      </div>
                    )}
                    {user.youtube_url && (
                      <div className="flex items-center space-x-2">
                        <Youtube className="h-4 w-4 text-red-500" />
                        <a href={user.youtube_url} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          YouTube
                        </a>
                      </div>
                    )}
                    {user.other_sns_url && (
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <a href={user.other_sns_url} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          その他SNS
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 자기소개 */}
              {user.bio && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">自己紹介</h4>
                  <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded">
                    {user.bio}
                  </p>
                </div>
              )}

              {/* 승인 상태 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  承認状態
                </h4>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(user)}
                  {user.approved_at && (
                    <span className="text-sm text-gray-600">
                      承認日: {formatDate(user.approved_at)}
                    </span>
                  )}
                  {user.rejected_at && (
                    <span className="text-sm text-gray-600">
                      却下日: {formatDate(user.rejected_at)}
                    </span>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              {!user.approved && (
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApproveUser(user.user_id)
                      onClose()
                    }}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    承認
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleRejectUser(user.user_id)
                      onClose()
                    }}
                    disabled={processing}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    却下
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">ユーザー情報を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ユーザー承認管理</h2>
          <p className="text-gray-600">新規登録ユーザーの承認・却下を管理できます</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>検索・フィルター</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">検索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="名前、メール、電話番号で検索"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">承認状態</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="pending">承認待ち</SelectItem>
                  <SelectItem value="approved">承認済み</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>統計</Label>
              <div className="text-sm text-gray-600">
                <p>総ユーザー数: {users.length}</p>
                <p>承認待ち: {users.filter(u => !u.approved && !u.rejected_at).length}</p>
                <p>承認済み: {users.filter(u => u.approved).length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-600" />
            <span>ユーザー一覧</span>
          </CardTitle>
          <CardDescription>
            {filteredUsers.length}件のユーザーが見つかりました
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.user_id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-800">{user.name || 'N/A'}</h3>
                      {getStatusBadge(user)}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>登録: {formatDate(user.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user)
                        setShowUserDetail(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      詳細
                    </Button>
                    
                    {!user.approved && !user.rejected_at && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveUser(user.user_id)}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          承認
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectUser(user.user_id)}
                          disabled={processing}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          却下
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">ユーザーが見つかりません</h3>
                <p className="text-gray-500">検索条件を変更してください。</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {showUserDetail && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => {
            setShowUserDetail(false)
            setSelectedUser(null)
          }} 
        />
      )}
      </div>
    </div>
  )
}

export default UserApprovalManager
