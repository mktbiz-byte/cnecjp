'''
import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { supabase } from '../../lib/supabase'
import AdminNavigation from './AdminNavigation'
import { 
  Loader2, User, Mail, Phone, Calendar, Shield, 
  CheckCircle, XCircle, Clock, AlertCircle, 
  Search, Filter, RefreshCw, Eye, Edit, Crown,
  Users, UserCheck, UserX, Settings, Plus, Minus,
  Star, Award, UserPlus, Trash2, Building
} from 'lucide-react'

const UserApprovalManagerEnhanced = () => {
  const { language } = useLanguage()
  
  const [users, setUsers] = useState([])
  const [corporateUsers, setCorporateUsers] = useState([])
  const [withdrawalRequests, setWithdrawalRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [activeTab, setActiveTab] = useState('regular'); // regular or corporate

  // 필터 및 검색
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [roleChangeModal, setRoleChangeModal] = useState(false)
  const [pointModal, setPointModal] = useState(false)
  const [withdrawalModal, setWithdrawalModal] = useState(false)
  
  // 포인트 관리
  const [pointAmount, setPointAmount] = useState('')
  const [pointDescription, setPointDescription] = useState('')
  
  // 권한 변경
  const [newRole, setNewRole] = useState('')

  // 다국어 텍스트
  const texts = {
    ko: {
      title: '사용자 관리',
      regularUsers: '일반 사용자',
      corporateUsers: '기업 사용자',
      subtitle: '가입한 사용자들을 승인하고 관리합니다',
      totalUsers: '총 사용자',
      pendingUsers: '승인 대기',
      approvedUsers: '승인됨',
      rejectedUsers: '거절됨',
      adminUsers: '관리자',
      vipUsers: 'VIP 사용자',
      managerUsers: '매니저',
      withdrawalRequests: '탈퇴 요청',
      filterByStatus: '상태별 필터',
      filterByRole: '역할별 필터',
      searchPlaceholder: '이름, 이메일로 검색...',
      allStatuses: '모든 상태',
      allRoles: '모든 역할',
      pending: '승인 대기',
      approved: '승인됨',
      rejected: '거절됨',
      user: '일반 사용자',
      vip: 'VIP 사용자',
      manager: '매니저',
      admin: '관리자',
      viewDetails: '상세 보기',
      approve: '승인',
      reject: '거절',
      changeRole: '권한 변경',
      addPoints: '포인트 추가',
      subtractPoints: '포인트 차감',
      viewWithdrawals: '탈퇴 요청 보기',
      refresh: '새로고침',
      joinDate: '가입일',
      lastLogin: '최근 로그인',
      points: '포인트',
      status: '상태',
      role: '권한',
      actions: '작업',
      userDetails: '사용자 상세 정보',
      roleChange: '권한 변경',
      pointManagement: '포인트 관리',
      withdrawalManagement: '탈퇴 요청 관리',
      selectNewRole: '새 권한 선택',
      pointAmount: '포인트 수량',
      description: '설명',
      reason: '사유',
      save: '저장',
      cancel: '취소',
      close: '닫기',
      confirm: '확인',
      processing: '처리 중...',
      noUsers: '사용자가 없습니다',
      noCorporateUsers: '기업 사용자가 없습니다',
      noWithdrawals: '탈퇴 요청이 없습니다',
      companyName: '회사명',
      representativeName: '담당자명',
      phoneNumber: '연락처',
      messages: {
        approved: '사용자가 승인되었습니다.',
        rejected: '사용자가 거절되었습니다.',
        roleChanged: '사용자 권한이 변경되었습니다.',
        pointsAdded: '포인트가 추가되었습니다.',
        pointsSubtracted: '포인트가 차감되었습니다.',
        withdrawalProcessed: '탈퇴 요청이 처리되었습니다.',
        corporateApproved: '기업 계정이 승인되었습니다.',
        error: '오류가 발생했습니다.'
      }
    },
    ja: {
        title: 'ユーザー管理',
        regularUsers: '一般ユーザー',
        corporateUsers: '企業ユーザー',
        subtitle: '登録ユーザーを承認・管理します',
        totalUsers: '総ユーザー数',
        pendingUsers: '承認待ち',
        approvedUsers: '承認済み',
        rejectedUsers: '拒否',
        adminUsers: '管理者',
        vipUsers: 'VIPユーザー',
        managerUsers: 'マネージャー',
        withdrawalRequests: '退会申請',
        filterByStatus: 'ステータス別フィルター',
        filterByRole: '役割別フィルター',
        searchPlaceholder: '名前、メールで検索...',
        allStatuses: '全てのステータス',
        allRoles: '全ての役割',
        pending: '承認待ち',
        approved: '承認済み',
        rejected: '拒否',
        user: '一般ユーザー',
        vip: 'VIPユーザー',
        manager: 'マネージャー',
        admin: '管理者',
        viewDetails: '詳細表示',
        approve: '承認',
        reject: '拒否',
        changeRole: '権限変更',
        addPoints: 'ポイント追加',
        subtractPoints: 'ポイント減算',
        viewWithdrawals: '退会申請表示',
        refresh: '更新',
        joinDate: '登録日',
        lastLogin: '最終ログイン',
        points: 'ポイント',
        status: 'ステータス',
        role: '権限',
        actions: '操作',
        userDetails: 'ユーザー詳細',
        roleChange: '権限変更',
        pointManagement: 'ポイント管理',
        withdrawalManagement: '退会申請管理',
        selectNewRole: '新しい権限を選択',
        pointAmount: 'ポイント数',
        description: '説明',
        reason: '理由',
        save: '保存',
        cancel: 'キャンセル',
        close: '閉じる',
        confirm: '確認',
        processing: '処理中...',
        noUsers: 'ユーザーがいません',
        noCorporateUsers: '企業ユーザーがいません',
        noWithdrawals: '退会申請がありません',
        companyName: '会社名',
        representativeName: '担当者名',
        phoneNumber: '連絡先',
        messages: {
          approved: 'ユーザーが承認されました。',
          rejected: 'ユーザーが拒否されました。',
          roleChanged: 'ユーザー権限が変更されました。',
          pointsAdded: 'ポイントが追加されました。',
          pointsSubtracted: 'ポイントが減算されました。',
          withdrawalProcessed: '退会申請が処理されました。',
          corporateApproved: '企業アカウントが承認されました。',
          error: 'エラーが発生しました。'
        }
      }
  }

  const t = texts[language] || texts.ko

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    await Promise.all([loadUsers(), loadWithdrawalRequests(), loadCorporateUsers()])
    setLoading(false)
  }

  const loadUsers = async () => {
    try {
        const { data, error } = await supabase.from('user_profiles').select('*')
        if(error) throw error;
        setUsers(data || [])
    } catch (error) {
      console.error('사용자 로드 오류:', error)
      setError(t.messages.error)
    }
  }

  const loadCorporateUsers = async () => {
    try {
      const { data, error } = await supabase.from('corporate_accounts').select('*').order('created_at', { ascending: false })
      if (error) throw error;
      setCorporateUsers(data || [])
    } catch (error) {
      console.error('기업 사용자 로드 오류:', error)
      setError(t.messages.error)
    }
  }

  const loadWithdrawalRequests = async () => {
    try {
      const { data: withdrawals, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (withdrawalError) throw withdrawalError
      
      if (withdrawals && withdrawals.length > 0) {
        const userIds = withdrawals.map(w => w.user_id)
        const { data: profiles, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_id, name, email')
          .in('user_id', userIds)
        
        if (profileError) throw profileError
        
        const enrichedWithdrawals = withdrawals.map(withdrawal => ({
          ...withdrawal,
          user_profiles: profiles?.find(p => p.user_id === withdrawal.user_id) || {
            name: '알 수 없음',
            email: '알 수 없음'
          }
        }))
        setWithdrawalRequests(enrichedWithdrawals)
      } else {
        setWithdrawalRequests([])
      }
    } catch (error) {
      console.error('탈퇴 요청 로드 오류:', error)
      setWithdrawalRequests([])
    }
  }

  const handleApproval = async (userId, status) => {
    try {
      setProcessing(true)
      const { error } = await supabase.from('user_profiles').update({ approval_status: status }).eq('user_id', userId)
      if(error) throw error
      await loadUsers()
      setSuccess(status === 'approved' ? t.messages.approved : t.messages.rejected)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('승인 처리 오류:', error)
      setError(t.messages.error)
      setTimeout(() => setError(''), 3000)
    } finally {
      setProcessing(false)
    }
  }

  const handleCorporateApproval = async (accountId, isApproved) => {
    try {
        setProcessing(true);
        const { error } = await supabase
            .from('corporate_accounts')
            .update({ is_approved: isApproved, approved_at: new Date().toISOString() })
            .eq('id', accountId);

        if (error) throw error;

        await loadCorporateUsers();
        setSuccess(t.messages.corporateApproved);
        setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
        console.error('기업 계정 승인 오류:', error);
        setError(t.messages.error);
        setTimeout(() => setError(''), 3000);
    } finally {
        setProcessing(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return
    
    try {
      setProcessing(true)
      
      const { error } = await supabase
        .rpc('change_user_role', {
          target_user_id: selectedUser.user_id,
          new_role: newRole
        })
      
      if (error) throw error
      
      await loadUsers()
      setSuccess(t.messages.roleChanged)
      setRoleChangeModal(false)
      setSelectedUser(null)
      setNewRole('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('권한 변경 오류:', error)
      setError(t.messages.error)
      setTimeout(() => setError(''), 3000)
    } finally {
      setProcessing(false)
    }
  }

  const handlePointManagement = async (isAdd) => {
    if (!selectedUser || !pointAmount) return
    
    try {
      setProcessing(true)
      
      const amount = parseInt(pointAmount)
      if (isNaN(amount) || amount <= 0) {
        setError(language === 'ko' ? '유효한 포인트 수량을 입력해주세요.' : '有効なポイント数を入力してください。')
        return
      }
      
      const finalAmount = isAdd ? amount : -amount
      const description = pointDescription || (isAdd ? 
        (language === 'ko' ? '관리자 포인트 추가' : '管理者ポイント追加') : 
        (language === 'ko' ? '관리자 포인트 차감' : '管理者ポイント減算'))
      
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: selectedUser.user_id,
          amount: finalAmount,
          transaction_type: isAdd ? 'admin_add' : 'admin_subtract',
          description: description,
          created_at: new Date().toISOString()
        })
      
      if (transactionError) throw transactionError
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          points: selectedUser.points + finalAmount 
        })
        .eq('user_id', selectedUser.user_id)
      
      if (updateError) throw updateError
      
      await loadUsers()
      setSuccess(isAdd ? t.messages.pointsAdded : t.messages.pointsSubtracted)
      setPointModal(false)
      setSelectedUser(null)
      setPointAmount('')
      setPointDescription('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('포인트 관리 오류:', error)
      setError(language === 'ko' ? '포인트 처리 중 오류가 발생했습니다.' : 'ポイント処理中にエラーが発生しました。')
      setTimeout(() => setError(''), 3000)
    } finally {
      setProcessing(false)
    }
  }

  const handleWithdrawalRequest = async (requestId, status, adminNotes = '') => {
    try {
      setProcessing(true)
      
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status,
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', requestId)
      
      if (error) throw error
      
      await loadWithdrawalRequests()
      setSuccess(t.messages.withdrawalProcessed)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('탈퇴 요청 처리 오류:', error)
      setError(t.messages.error)
      setTimeout(() => setError(''), 3000)
    } finally {
      setProcessing(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesStatus = !statusFilter || user.approval_status === statusFilter
    const matchesRole = !roleFilter || user.user_role === roleFilter
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesRole && matchesSearch
  })

  const filteredCorporateUsers = corporateUsers.filter(user => {
    const matchesStatus = !statusFilter || (user.is_approved ? 'approved' : 'pending') === statusFilter
    const matchesSearch = !searchTerm || 
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.representative_name?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: t.pending },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: t.approved },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', text: t.rejected }
    }
    
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  const getRoleBadge = (role) => {
    const badges = {
      user: { icon: User, color: 'bg-gray-100 text-gray-800', text: t.user },
      vip: { icon: Star, color: 'bg-purple-100 text-purple-800', text: t.vip },
      manager: { icon: Award, color: 'bg-blue-100 text-blue-800', text: t.manager },
      admin: { icon: Crown, color: 'bg-red-100 text-red-800', text: t.admin }
    }
    
    const badge = badges[role] || badges.user
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  const userStats = {
    total: users.length,
    pending: users.filter(u => u.approval_status === 'pending').length,
    approved: users.filter(u => u.approval_status === 'approved').length,
    rejected: users.filter(u => u.approval_status === 'rejected').length,
    admin: users.filter(u => u.user_role === 'admin').length,
    vip: users.filter(u => u.user_role === 'vip').length,
    manager: users.filter(u => u.user_role === 'manager').length,
    withdrawals: withdrawalRequests.filter(w => w.status === 'pending').length,
    totalCorporate: corporateUsers.length,
    pendingCorporate: corporateUsers.filter(u => !u.is_approved).length,
    approvedCorporate: corporateUsers.filter(u => u.is_approved).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="mt-2 text-gray-600">{t.subtitle}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setWithdrawalModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t.viewWithdrawals}
                {userStats.withdrawals > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {userStats.withdrawals}
                  </span>
                )}
              </button>
              <button
                onClick={loadAllData}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t.refresh}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('regular')}
                    className={`${
                        activeTab === 'regular'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                    <User className="w-4 h-4 mr-2" /> {t.regularUsers}
                </button>
                <button
                    onClick={() => setActiveTab('corporate')}
                    className={`${
                        activeTab === 'corporate'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                    <Building className="w-4 h-4 mr-2" /> {t.corporateUsers}
                </button>
            </nav>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'regular' && (
            <>
                {/* 통계 카드 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center"><Users className="h-8 w-8 text-blue-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-500">{t.totalUsers}</p><p className="text-2xl font-bold text-gray-900">{userStats.total}</p></div></div></div>
                    <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center"><Clock className="h-8 w-8 text-yellow-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-500">{t.pendingUsers}</p><p className="text-2xl font-bold text-gray-900">{userStats.pending}</p></div></div></div>
                    <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center"><UserCheck className="h-8 w-8 text-green-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-500">{t.approvedUsers}</p><p className="text-2xl font-bold text-gray-900">{userStats.approved}</p></div></div></div>
                    <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center"><UserX className="h-8 w-8 text-red-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-500">{t.rejectedUsers}</p><p className="text-2xl font-bold text-gray-900">{userStats.rejected}</p></div></div></div>
                </div>

                {/* 필터 및 검색 */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">
                                <option value="">{t.allStatuses}</option>
                                <option value="pending">{t.pending}</option>
                                <option value="approved">{t.approved}</option>
                                <option value="rejected">{t.rejected}</option>
                            </select>
                        </div>
                        <div>
                            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">
                                <option value="">{t.allRoles}</option>
                                <option value="user">{t.user}</option>
                                <option value="vip">{t.vip}</option>
                                <option value="manager">{t.manager}</option>
                                <option value="admin">{t.admin}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 사용자 목록 테이블 */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.joinDate}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.role}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.points}</th>
                                    <th scope="col" className="relative px-6 py-3
                                    "><span className="sr-only">{t.actions}</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map(user => (
                                    <tr key={user.user_id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full" src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.approval_status)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.user_role)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{user.points || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {user.approval_status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleApproval(user.user_id, 'approved')} className="text-indigo-600 hover:text-indigo-900 mr-4">{t.approve}</button>
                                                    <button onClick={() => handleApproval(user.user_id, 'rejected')} className="text-red-600 hover:text-red-900">{t.reject}</button>
                                                </>
                                            )}
                                            {user.approval_status === 'approved' && (
                                                <button onClick={() => { setSelectedUser(user); setRoleChangeModal(true); setNewRole(user.user_role); }} className="text-gray-600 hover:text-gray-900">{t.changeRole}</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && <p className="text-center py-8 text-gray-500">{t.noUsers}</p>}
                    </div>
                </div>
            </>
        )}

        {activeTab === 'corporate' && (
            <>
                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center"><Users className="h-8 w-8 text-blue-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-500">{t.totalUsers}</p><p className="text-2xl font-bold text-gray-900">{userStats.totalCorporate}</p></div></div></div>
                    <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center"><Clock className="h-8 w-8 text-yellow-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-500">{t.pendingUsers}</p><p className="text-2xl font-bold text-gray-900">{userStats.pendingCorporate}</p></div></div></div>
                    <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center"><UserCheck className="h-8 w-8 text-green-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-500">{t.approvedUsers}</p><p className="text-2xl font-bold text-gray-900">{userStats.approvedCorporate}</p></div></div></div>
                </div>

                {/* 필터 및 검색 */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">
                                <option value="">{t.allStatuses}</option>
                                <option value="pending">{t.pending}</option>
                                <option value="approved">{t.approved}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 기업 사용자 목록 테이블 */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.companyName}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.representativeName}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.phoneNumber}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.joinDate}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t.actions}</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCorporateUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.company_name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.representative_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.is_approved ? 'approved' : 'pending')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {!user.is_approved && (
                                                <button onClick={() => handleCorporateApproval(user.id, true)} className="text-indigo-600 hover:text-indigo-900" disabled={processing}>
                                                    {processing ? t.processing : t.approve}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredCorporateUsers.length === 0 && <p className="text-center py-8 text-gray-500">{t.noCorporateUsers}</p>}
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  )
}

export default UserApprovalManagerEnhanced
'''
