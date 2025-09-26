import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { auth } from './lib/supabase'
import './App.css'

// 페이지 컴포넌트들
import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import MyPageComplete from './components/MyPageComplete'
import CampaignApplicationPage from './components/CampaignApplicationPage'
import WithdrawalRequest from './components/WithdrawalRequest'
import CampaignReport from './components/CampaignReport'
import CompanyReport from './components/CompanyReport'
import JapanBankTransfer from './components/JapanBankTransfer'

// 관리자 컴포넌트들
import AdminDashboard from './components/admin/AdminDashboard'
import AdminCampaignsEnhanced from './components/admin/AdminCampaignsEnhanced'
import AdminApplications from './components/admin/AdminApplications'
import AdminWithdrawals from './components/admin/AdminWithdrawals'
import AdminCompanyAccess from './components/admin/AdminCompanyAccess'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <Routes>
              {/* 메인 페이지 */}
              <Route path="/" element={<HomePage />} />
              
              {/* 인증 관련 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* 사용자 페이지 */}
              <Route path="/mypage" element={<MyPageComplete />} />
              <Route path="/campaign-application" element={<CampaignApplicationPage />} />
              <Route path="/withdrawal" element={<WithdrawalRequest />} />
              <Route path="/japan-bank-transfer" element={<JapanBankTransfer />} />
              
              {/* 캠페인 보고서 */}
              <Route path="/campaign-report/:campaignId" element={<CampaignReport />} />
              
              {/* 회사별 리포트 (토큰 기반 액세스) */}
              <Route path="/company-report/:companyId" element={<CompanyReport />} />
              
              {/* 관리자 페이지 */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/campaigns" element={<AdminCampaignsEnhanced />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/admin/company-access" element={<AdminCompanyAccess />} />
              
              {/* 404 페이지 */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="text-center">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
                      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                      <p className="text-gray-600 mb-6">ページが見つかりません。</p>
                      <a 
                        href="/" 
                        className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        ホームに戻る
                      </a>
                    </div>
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
