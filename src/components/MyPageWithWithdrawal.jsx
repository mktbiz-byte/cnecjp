import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { database } from '../lib/supabase'
import { 
  User, Mail, Phone, MapPin, Calendar, Award, 
  CreditCard, Download, Settings, LogOut, 
  AlertTriangle, Trash2, Shield, Eye, EyeOff
} from 'lucide-react'

const MyPageWithWithdrawal = () => {
  const { user, signOut } = useAuth()
  const { language } = useLanguage()
  
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [pointTransactions, setPointTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  
  // 회원 탈퇴 관련 상태
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [withdrawalReason, setWithdrawalReason] = useState('')
  const [withdrawalDetails, setWithdrawalDetails] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 다국어 텍스트
  const texts = {
    ko: {
      title: '마이페이지',
      profile: '프로필',
      applications: '신청 내역',
      withdrawals: '출금 내역',
      points: '포인트 내역',
      accountSettings: '계정 설정',
      personalInfo: '개인정보',
      name: '이름',
      email: '이메일',
      phone: '전화번호',
      address: '주소',
      joinDate: '가입일',
      userRole: '사용자 등급',
      currentPoints: '보유 포인트',
      totalEarned: '총 획득 포인트',
      campaignApplications: '캠페인 신청',
      totalApplications: '총 신청 수',
      approvedApplications: '승인된 신청',
      completedCampaigns: '완료된 캠페인',
      withdrawalHistory: '출금 내역',
      totalWithdrawn: '총 출금액',
      pendingWithdrawals: '출금 대기',
      pointHistory: '포인트 내역',
      transactionType: '거래 유형',
      amount: '금액',
      date: '날짜',
      description: '설명',
      earned: '획득',
      spent: '사용',
      bonus: '보너스',
      withdrawal: '출금',
      accountDeletion: '회원 탈퇴',
      deleteAccount: '계정 삭제',
      deleteAccountWarning: '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.',
      deleteAccountDescription: '회원 탈퇴를 신청하시면 관리자 검토 후 처리됩니다. 탈퇴 후에는 모든 데이터가 복구 불가능하게 삭제됩니다.',
      withdrawalReason: '탈퇴 사유',
      withdrawalDetails: '상세 내용',
      confirmDeletion: '탈퇴 확인',
      confirmText: '정말로 탈퇴하시겠습니까? 확인하려면 "탈퇴합니다"를 입력하세요.',
      confirmPlaceholder: '탈퇴합니다',
      submitWithdrawal: '탈퇴 신청',
      cancel: '취소',
      processing: '처리 중...',
      logout: '로그아웃',
      noData: '데이터가 없습니다',
      roles: {
        user: '일반 사용자',
        vip: 'VIP 사용자',
        manager: '매니저',
        admin: '관리자'
      },
      reasons: {
        service: '서비스 불만족',
        privacy: '개인정보 우려',
        unused: '서비스 미사용',
        other: '기타'
      },
      messages: {
        withdrawalSubmitted: '탈퇴 신청이 완료되었습니다. 관리자 검토 후 처리됩니다.',
        error: '오류가 발생했습니다. 다시 시도해주세요.',
        confirmRequired: '탈퇴 확인 문구를 정확히 입력해주세요.',
        reasonRequired: '탈퇴 사유를 선택해주세요.'
      }
    },
    ja: {
      title: 'マイページ',
      profile: 'プロフィール',
      applications: '応募履歴',
      withdrawals: '出金履歴',
      points: 'ポイント履歴',
      accountSettings: 'アカウント設定',
      personalInfo: '個人情報',
      name: '名前',
      email: 'メール',
      phone: '電話番号',
      address: '住所',
      joinDate: '登録日',
      userRole: 'ユーザーランク',
      currentPoints: '保有ポイント',
      totalEarned: '総獲得ポイント',
      campaignApplications: 'キャンペーン応募',
      totalApplications: '総応募数',
      approvedApplications: '承認済み応募',
      completedCampaigns: '完了キャンペーン',
      withdrawalHistory: '出金履歴',
      totalWithdrawn: '総出金額',
      pendingWithdrawals: '出金待ち',
      pointHistory: 'ポイント履歴',
      transactionType: '取引種別',
      amount: '金額',
      date: '日付',
      description: '説明',
      earned: '獲得',
      spent: '使用',
      bonus: 'ボーナス',
      withdrawal: '出金',
      accountDeletion: '退会',
      deleteAccount: 'アカウント削除',
      deleteAccountWarning: 'アカウントを削除すると、すべてのデータが永久に削除されます。',
      deleteAccountDescription: '退会申請をすると、管理者の審査後に処理されます。退会後はすべてのデータが復旧不可能に削除されます。',
      withdrawalReason: '退会理由',
      withdrawalDetails: '詳細内容',
      confirmDeletion: '退会確認',
      confirmText: '本当に退会しますか？確認するには「退会します」と入力してください。',
      confirmPlaceholder: '退会します',
      submitWithdrawal: '退会申請',
      cancel: 'キャンセル',
      processing: '処理中...',
      logout: 'ログアウト',
      noData: 'データがありません',
      roles: {
        user: '一般ユーザー',
        vip: 'VIPユーザー',
        manager: 'マネージャー',
        admin: '管理者'
      },
      reasons: {
        service: 'サービス不満',
        privacy: 'プライバシー懸念',
        unused: 'サービス未使用',
        other: 'その他'
      },
      messages: {
        withdrawalSubmitted: '退会申請が完了しました。管理者の審査後に処理されます。',
        error: 'エラーが発生しました。再度お試しください。',
        confirmRequired: '退会確認文を正確に入力してください。',
        reasonRequired: '退会理由を選択してください。'
      }
    }
  }

  const t = texts[language] || texts.ko

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // 프로필 정보 로드
      const profileData = await database.userProfiles.get(user.id)
      setProfile(profileData)
      
      // 신청 내역 로드
      const applicationsData = await database.applications.getByUser(user.id)
      setApplications(applicationsData || [])
      
      // 출금 내역 로드 (아직 구현되지 않음)
      setWithdrawals([])
      
      // 포인트 거래 내역 로드
      const { data: pointData } = await database.supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setPointTransactions(pointData || [])
      
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error)
      setError(t.messages.error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawalSubmit = async () => {
    if (!withdrawalReason) {
      setError(t.messages.reasonRequired)
      return
    }
    
    if (confirmText !== (language === 'ja' ? '退会します' : '탈퇴합니다')) {
      setError(t.messages.confirmRequired)
      return
    }
    
    try {
      setProcessing(true)
      setError('')
      
      const { error } = await database.supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          reason: withdrawalReason,
          additional_info: withdrawalDetails,
          status: 'pending'
        })
      
      if (error) throw error
      
      setSuccess(t.messages.withdrawalSubmitted)
      setShowWithdrawalModal(false)
      setWithdrawalReason('')
      setWithdrawalDetails('')
      setConfirmText('')
      
      setTimeout(() => setSuccess(''), 5000)
      
    } catch (error) {
      console.error('탈퇴 신청 오류:', error)
      setError(t.messages.error)
    } finally {
      setProcessing(false)
    }
  }

  const getRoleBadge = (role) => {
    const badges = {
      user: 'bg-gray-100 text-gray-800',
      vip: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      admin: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[role] || badges.user}`}>
        {t.roles[role] || t.roles.user}
      </span>
    )
  }

  const getTransactionTypeColor = (type) => {
    const colors = {
      earn: 'text-green-600',
      bonus: 'text-blue-600',
      admin_add: 'text-purple-600',
      spend: 'text-red-600',
      admin_subtract: 'text-red-600'
    }
    return colors[type] || 'text-gray-600'
  }

  const getTransactionTypeText = (type) => {
    const types = {
      earn: t.earned,
      bonus: t.bonus,
      admin_add: t.bonus,
      spend: t.spent,
      admin_subtract: t.spent
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="mt-2 text-gray-600">
                {profile?.name || user?.email}님의 계정 정보
              </p>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t.logout}
            </button>
          </div>
        </div>

        {/* 알림 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <Shield className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'profile', label: t.profile, icon: User },
                { id: 'applications', label: t.applications, icon: Award },
                { id: 'withdrawals', label: t.withdrawals, icon: CreditCard },
                { id: 'points', label: t.points, icon: Download },
                { id: 'settings', label: t.accountSettings, icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2 inline" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'profile' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.personalInfo}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.name}</label>
                    <p className="mt-1 text-sm text-gray-900">{profile?.name || '이름 없음'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.email}</label>
                    <p className="mt-1 text-sm text-gray-900">{profile?.email || user?.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.phone}</label>
                    <p className="mt-1 text-sm text-gray-900">{profile?.phone || '등록되지 않음'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.address}</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {profile?.postal_code && profile?.address 
                        ? `${profile.postal_code} ${profile.address}`
                        : '등록되지 않음'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.joinDate}</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ko-KR') : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.userRole}</label>
                    <div className="mt-1">{getRoleBadge(profile?.user_role)}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.currentPoints}</label>
                    <p className="mt-1 text-lg font-semibold text-purple-600">
                      {profile?.points?.toLocaleString() || 0}P
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.totalEarned}</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {pointTransactions
                        .filter(t => ['earn', 'bonus', 'admin_add'].includes(t.transaction_type))
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toLocaleString()
                      }P
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.campaignApplications}</h2>
              
              {/* 신청 통계 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.totalApplications}</p>
                      <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.approvedApplications}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {applications.filter(a => a.status === 'approved').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Download className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.completedCampaigns}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {applications.filter(a => a.submission_status === 'submitted').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 신청 목록 */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        캠페인
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        신청일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                          {t.noData}
                        </td>
                      </tr>
                    ) : (
                      applications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {application.campaign_title || '캠페인 정보 없음'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              application.status === 'approved' ? 'bg-green-100 text-green-800' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {application.status === 'approved' ? '승인됨' :
                               application.status === 'rejected' ? '거절됨' : '대기중'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(application.created_at).toLocaleDateString('ko-KR')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.withdrawalHistory}</h2>
              
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4">{t.noData}</p>
              </div>
            </div>
          )}

          {activeTab === 'points' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.pointHistory}</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.transactionType}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.amount}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.description}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.date}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pointTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          {t.noData}
                        </td>
                      </tr>
                    ) : (
                      pointTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                              {getTransactionTypeText(transaction.transaction_type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}P
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {transaction.description || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString('ko-KR')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.accountSettings}</h2>
              
              <div className="space-y-6">
                {/* 계정 삭제 섹션 */}
                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <div className="flex items-start">
                    <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-red-900">{t.accountDeletion}</h3>
                      <p className="mt-2 text-sm text-red-700">
                        {t.deleteAccountWarning}
                      </p>
                      <p className="mt-2 text-sm text-red-700">
                        {t.deleteAccountDescription}
                      </p>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowWithdrawalModal(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t.deleteAccount}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 회원 탈퇴 모달 */}
        {showWithdrawalModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{t.accountDeletion}</h3>
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.withdrawalReason} *
                    </label>
                    <select
                      value={withdrawalReason}
                      onChange={(e) => setWithdrawalReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">사유를 선택하세요</option>
                      <option value="service">{t.reasons.service}</option>
                      <option value="privacy">{t.reasons.privacy}</option>
                      <option value="unused">{t.reasons.unused}</option>
                      <option value="other">{t.reasons.other}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.withdrawalDetails}
                    </label>
                    <textarea
                      value={withdrawalDetails}
                      onChange={(e) => setWithdrawalDetails(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="추가 설명이 있으시면 입력해주세요"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.confirmDeletion} *
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.confirmText}</p>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={t.confirmPlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleWithdrawalSubmit}
                    disabled={processing}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {processing ? t.processing : t.submitWithdrawal}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPageWithWithdrawal
