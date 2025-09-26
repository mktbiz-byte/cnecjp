import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { auth } from './lib/supabase'
import './App.css'

// 페이지 컴포넌트들
import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import MyPageEnhanced from './components/MyPageEnhanced'
import CampaignApplicationPage from './components/CampaignApplicationPage'
import WithdrawalRequest from './components/WithdrawalRequest'
import CampaignReport from './components/CampaignReport'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminCampaigns from './components/admin/AdminCampaigns'
import AdminApplications from './components/admin/AdminApplications'
import AuthCallback from './components/AuthCallback'

// 컨텍스트
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 초기 인증 상태 확인
    const initializeAuth = async () => {
      try {
        await auth.getSession()
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* 메인 페이지 */}
              <Route path="/" element={<HomePage />} />
              
              {/* 인증 관련 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* 사용자 페이지 */}
              <Route path="/mypage" element={<MyPageEnhanced />} />
              <Route path="/campaign-application" element={<CampaignApplicationPage />} />
              <Route path="/withdrawal" element={<WithdrawalRequest />} />
              
              {/* 캠페인 보고서 */}
              <Route path="/campaign-report/:campaignId" element={<CampaignReport />} />
              
              {/* 관리자 페이지 */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/campaigns" element={<AdminCampaigns />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              
              {/* 404 페이지 */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">페이지를 찾을 수 없습니다.</p>
                    <a href="/" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      홈으로 돌아가기
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
