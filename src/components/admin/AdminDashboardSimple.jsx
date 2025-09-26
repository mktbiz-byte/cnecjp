import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
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
  const navigate = useNavigate()
  
  const [stats, setStats] = useState({
    totalCampaigns: 4,
    activeCampaigns: 4,
    totalApplications: 12,
    totalRewards: 360000,
    totalUsers: 25,
    pendingApplications: 3
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // 관리자 권한 확인 - 테스트 계정 포함
    if (!user || (!user.email?.includes('mkt_biz@cnec.co.kr') && !user.email?.includes('admin@cnec.test'))) {
      console.log('관리자 권한 없음:', user?.email)
      navigate('/')
      return
    }

    console.log('관리자 로그인 성공:', user?.email)
  }, [user, navigate])

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
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">CNEC 관리자 대시보드</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                관리자: {user?.email}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
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
              <CardTitle className="text-sm font-medium">총 캠페인</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                활성 캠페인: {stats.activeCampaigns}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 신청서</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                대기중: {stats.pendingApplications}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">등록 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                활성 크리에이터
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 보상금</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{stats.totalRewards.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                이번 달 지급액
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
                <span>캠페인 관리</span>
              </CardTitle>
              <CardDescription>
                캠페인 생성, 수정, 삭제 및 상태 관리
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/campaigns">
                <Button className="w-full">
                  캠페인 관리하기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>신청서 관리</span>
              </CardTitle>
              <CardDescription>
                크리에이터 신청서 검토 및 승인/거절
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/applications">
                <Button className="w-full" variant="outline">
                  신청서 검토하기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span>출금 관리</span>
              </CardTitle>
              <CardDescription>
                크리에이터 출금 요청 처리 및 관리
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/withdrawals">
                <Button className="w-full" variant="outline">
                  출금 처리하기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <span>사용자 승인</span>
              </CardTitle>
              <CardDescription>
                신규 가입자 승인 및 사용자 관리
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/user-approval">
                <Button className="w-full" variant="outline">
                  사용자 승인하기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                <span>통계 및 분석</span>
              </CardTitle>
              <CardDescription>
                플랫폼 성과 분석 및 리포트
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                통계 보기 (준비중)
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-indigo-600" />
                <span>이메일 템플릿</span>
              </CardTitle>
              <CardDescription>
                자동 발송 이메일 템플릿 관리
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/email-templates">
                <Button className="w-full" variant="outline">
                  템플릿 관리하기
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span>시스템 설정</span>
              </CardTitle>
              <CardDescription>
                플랫폼 설정 및 관리자 도구
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                설정 관리 (준비중)
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
