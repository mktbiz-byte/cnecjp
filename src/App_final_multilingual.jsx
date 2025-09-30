import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { database } from './lib/supabase'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'

// 페이지 컴포넌트
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import MyPage from './components/MyPage'
import CampaignDetail from './components/CampaignDetail'
import CampaignApplication from './components/CampaignApplication'
import ApplicationComplete from './components/ApplicationComplete'
import VideoUpload from './components/VideoUpload'
import VideoUploadComplete from './components/VideoUploadComplete'
import NotFound from './components/NotFound'

// 관리자 페이지 컴포넌트
import AdminLogin from './components/admin/AdminLogin'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminCampaigns from './components/admin/AdminCampaigns'
import AdminCampaignCreate from './components/admin/AdminCampaignCreate'
import AdminCampaignEdit from './components/admin/AdminCampaignEdit'
import AdminApplications from './components/admin/AdminApplications'
import AdminUsers from './components/admin/AdminUsers'
import AdminUserDetail from './components/admin/AdminUserDetail'
import ApplicationsReport from './components/admin/ApplicationsReport'
import ApplicationsReportSimple_final from './components/admin/ApplicationsReportSimple_final'
import CompanyReport_multilingual from './components/CompanyReport_multilingual'
import ConfirmedCreatorsReport_multilingual from './components/admin/ConfirmedCreatorsReport_multilingual'
import SNSUploadFinalReport_multilingual from './components/admin/SNSUploadFinalReport_multilingual'
import SystemSettings_enhanced from './components/admin/SystemSettings_enhanced'
import EmailSettings from './components/admin/EmailSettings'

// 다국어 지원 초기화
import i18n from './lib/i18n'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    // 사용자 인증 상태 확인
    const checkAuth = async () => {
      try {
        const session = await database.auth.getSession()
        if (session) {
          setUser(session.user)
          
          // 관리자 권한 확인
          if (session.user) {
            const isAdmin = await database.auth.isAdmin(session.user.id)
            if (isAdmin) {
              setAdminUser(session.user)
            }
          }
        }
      } catch (error) {
        console.error('인증 확인 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // 인증 상태 변경 이벤트 리스너
    const { data: authListener } = database.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
        
        // 관리자 권한 확인
        const isAdmin = await database.auth.isAdmin(session.user.id)
        if (isAdmin) {
          setAdminUser(session.user)
        }
        
        toast({
          title: '로그인 성공',
          description: '환영합니다!',
        })
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setAdminUser(null)
        toast({
          title: '로그아웃 되었습니다',
          description: '다음에 또 만나요!',
        })
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [toast])

  // 사용자 인증이 필요한 라우트 보호
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>로딩 중...</div>
    if (!user) return <Navigate to="/login" />
    return children
  }

  // 관리자 인증이 필요한 라우트 보호
  const AdminRoute = ({ children }) => {
    if (loading) return <div>로딩 중...</div>
    if (!adminUser) return <Navigate to="/admin/login" />
    return children
  }

  return (
    <Router>
      <Toaster />
      <Routes>
        {/* 일반 사용자 라우트 */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/campaign/:id/apply" element={<ProtectedRoute><CampaignApplication /></ProtectedRoute>} />
        <Route path="/application/complete" element={<ProtectedRoute><ApplicationComplete /></ProtectedRoute>} />
        <Route path="/campaign/:campaignId/upload" element={<ProtectedRoute><VideoUpload /></ProtectedRoute>} />
        <Route path="/upload/complete" element={<ProtectedRoute><VideoUploadComplete /></ProtectedRoute>} />
        
        {/* 관리자 라우트 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/campaigns" element={<AdminRoute><AdminCampaigns /></AdminRoute>} />
        <Route path="/admin/campaigns/create" element={<AdminRoute><AdminCampaignCreate /></AdminRoute>} />
        <Route path="/admin/campaigns/:id/edit" element={<AdminRoute><AdminCampaignEdit /></AdminRoute>} />
        <Route path="/admin/applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
        <Route path="/admin/reports/applications" element={<AdminRoute><ApplicationsReport /></AdminRoute>} />
        <Route path="/admin/reports/applications-simple" element={<AdminRoute><ApplicationsReportSimple_final /></AdminRoute>} />
        <Route path="/admin/reports/company" element={<AdminRoute><CompanyReport_multilingual /></AdminRoute>} />
        <Route path="/admin/reports/confirmed-creators" element={<AdminRoute><ConfirmedCreatorsReport_multilingual /></AdminRoute>} />
        <Route path="/admin/reports/sns-uploads" element={<AdminRoute><SNSUploadFinalReport_multilingual /></AdminRoute>} />
        <Route path="/admin/reports/sns-uploads/:campaignId" element={<AdminRoute><SNSUploadFinalReport_multilingual /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><SystemSettings_enhanced /></AdminRoute>} />
        <Route path="/admin/settings/email" element={<AdminRoute><EmailSettings /></AdminRoute>} />
        
        {/* 404 페이지 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
