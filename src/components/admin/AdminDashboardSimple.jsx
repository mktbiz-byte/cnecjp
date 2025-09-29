import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { database } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  Award, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Settings, 
  LogOut, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  BarChart3,
  UserCheck,
  CreditCard
} from 'lucide-react'

const AdminDashboardSimple = () => {
  const { user, signOut } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()

  // 다국어 텍스트
  const texts = {
    ko: {
      title: 'CNEC 관리자 대시보드',
      totalCampaigns: '총 캠페인',
      activeCampaigns: '활성 캠페인',
      totalApplications: '총 신청서',
      totalUsers: '등록 사용자',
      totalRewards: '총 보상금',
      pendingApplications: '대기 신청서',
      campaignManagement: '캠페인 관리',
      applicationManagement: '신청서 관리',
      userApproval: '사용자 승인',
      withdrawalManagement: '출금 관리',
      emailTemplates: '이메일 템플릿',
      logout: '로그아웃',
      loading: '데이터를 불러오는 중...',
      error: '데이터를 불러오는데 실패했습니다.',
      admin: '관리자'
    },
    ja: {
      title: 'CNEC 管理者ダッシュボード',
      totalCampaigns: '総キャンペーン',
      activeCampaigns: 'アクティブキャンペーン',
      totalApplications: '総申請書',
      totalUsers: '登録ユーザー',
      totalRewards: '総報酬金',
      pendingApplications: '待機申請書',
      campaignManagement: 'キャンペーン管理',
      applicationManagement: '申請書管理',
      userApproval: 'ユーザー承認',
      withdrawalManagement: '出金管理',
      emailTemplates: 'メールテンプレート',
      logout: 'ログアウト',
      loading: 'データを読み込み中...',
      error: 'データの読み込みに失敗しました。',
      admin: '管理者'
    }
  }

  const t = texts[language] || texts.ko
  
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalApplications: 0,
    totalRewards: 0,
    totalUsers: 0,
    pendingApplications: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // 관리자 권한 확인 - 테스트 계정 포함
    if (!user) {
      console.log('사용자 로그인 필요')
      navigate('/secret-admin-login')
      return
    }
    
    // 관리자 이메일 확인 (더 유연한 체크)
    const adminEmails = ['mkt_biz@cnec.co.kr', 'admin@cnec.test']
    const isAdmin = adminEmails.some(email => user.email?.includes(email))
    
    if (!isAdmin) {
      console.log('관리자 권한 없음:', user?.email)
      navigate('/')
      return
    }

    console.log('관리자 로그인 성공:', user?.email)
    loadDashboardData()
  }, [user, navigate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 실제 데이터베이스에서 통계 데이터 로드
      const statsData = await database.stats.getOverall()
      
      // 추가 통계 계산
      const campaigns = await database.campaigns.getAll()
      const applications = await database.applications.getAll()
      
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length
      const pendingApplications = applications.filter(a => a.status === 'pending').length
      
      setStats({
        totalCampaigns: statsData.totalCampaigns,
        activeCampaigns: activeCampaigns,
        totalApplications: statsData.totalApplications,
        totalRewards: statsData.totalRewards,
        totalUsers: statsData.totalUsers,
        pendingApplications: pendingApplications
      })
      
    } catch (error) {
      console.error('Dashboard data loading error:', error)
      setError('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {t.admin}: {user?.email}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.logout}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalCampaigns}</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {t.activeCampaigns}: {stats.activeCampaigns}{language === 'ko' ? '개' : '件'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalApplications}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {t.pendingApplications}: {stats.pendingApplications}{language === 'ko' ? '개' : '件'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {language === 'ko' ? '활성 크리에이터' : 'アクティブクリエイター'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalRewards}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{stats.totalRewards.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {language === 'ko' ? '이번 달 지급액' : '今月の支払額'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span>{t.campaignManagement}</span>
              </CardTitle>
              <CardDescription>
                {language === 'ko' ? '캠페인 생성, 수정, 삭제 및 상태 관리' : 'キャンペーンの作成、編集、削除、ステータス管理'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/campaigns">
                <Button className="w-full">
                  {language === 'ko' ? '캠페인 관리하기' : 'キャンペーン管理'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>{t.applicationManagement}</span>
              </CardTitle>
              <CardDescription>
                {language === 'ko' ? '크리에이터 신청서 검토 및 승인/거절' : 'クリエイター申請書の審査と承認/拒否'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/applications">
                <Button className="w-full" variant="outline">
                  {language === 'ko' ? '신청서 검토하기' : '申請書を審査'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span>{t.withdrawalManagement}</span>
              </CardTitle>
              <CardDescription>
                {language === 'ko' ? '크리에이터 출금 요청 처리 및 관리' : 'クリエイター出金リクエストの処理と管理'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/withdrawals">
                <Button className="w-full" variant="outline">
                  {language === 'ko' ? '출금 처리하기' : '出金処理'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <span>{t.userApproval}</span>
              </CardTitle>
              <CardDescription>
                {language === 'ko' ? '신규 가입자 승인 및 사용자 관리' : '新規登録者の承認とユーザー管理'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/user-approval">
                <Button className="w-full" variant="outline">
                  {language === 'ko' ? '사용자 승인하기' : 'ユーザー承認'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                <span>{language === 'ko' ? '통계 및 분석' : '統計と分析'}</span>
              </CardTitle>
              <CardDescription>
                {language === 'ko' ? '플랫폼 성과 분석 및 리포트' : 'プラットフォーム成果分析とレポート'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                {language === 'ko' ? '통계 보기 (준비중)' : '統計表示（準備中）'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-indigo-600" />
                <span>{t.emailTemplates}</span>
              </CardTitle>
              <CardDescription>
                {language === 'ko' ? '자동 발송 이메일 템플릿 관리' : '自動送信メールテンプレート管理'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/email-templates">
                <Button className="w-full" variant="outline">
                  {language === 'ko' ? '템플릿 관리하기' : 'テンプレート管理'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span>{language === 'ko' ? '시스템 설정' : 'システム設定'}</span>
              </CardTitle>
              <CardDescription>
                {language === 'ko' ? '플랫폼 설정 및 관리자 도구' : 'プラットフォーム設定と管理者ツール'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                {language === 'ko' ? '설정 관리 (준비중)' : '設定管理（準備中）'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 최근 활동 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>
                플랫폼의 최근 활동 내역을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">새로운 캠페인 신청</p>
                    <p className="text-xs text-gray-500">바블몽키 젤리풋스파 캠페인에 3명이 신청했습니다</p>
                  </div>
                  <span className="text-xs text-gray-400">2시간 전</span>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">출금 요청</p>
                    <p className="text-xs text-gray-500">크리에이터 2명이 포인트 출금을 요청했습니다</p>
                  </div>
                  <span className="text-xs text-gray-400">5시간 전</span>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">새 사용자 등록</p>
                    <p className="text-xs text-gray-500">5명의 새로운 크리에이터가 가입했습니다</p>
                  </div>
                  <span className="text-xs text-gray-400">1일 전</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboardSimple
