import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { auth } from './lib/supabase'
import './App.css'

// 페이지 컴포넌트들
import HomePageExactReplica from './components/HomePageExactReplica'
import LoginPageExactReplica from './components/LoginPageExactReplica'
import SignupPageExactReplica from './components/SignupPageExactReplica'
import MyPageWorkflow from './components/MyPageWorkflow'
import CampaignApplicationUpdated from './components/CampaignApplicationUpdated'
import WithdrawalRequest from './components/WithdrawalRequest'
import CampaignReport from './components/CampaignReport'
import CompanyReport from './components/CompanyReport'
import JapanBankTransfer from './components/JapanBankTransfer'

// 관리자 컴포넌트들
import AdminDashboard from './components/admin/AdminDashboardSimple'
import AdminCampaignsWithQuestions from './components/admin/AdminCampaignsWithQuestions'
import AdminApplications from './components/admin/AdminApplications'
import AdminWithdrawals from './components/admin/AdminWithdrawals'
import AdminCompanyAccess from './components/admin/AdminCompanyAccess'
import AdminEmailManagement from './components/admin/AdminEmailManagement'
import AdminTestSetup from './components/AdminTestSetup'
import SecretAdminLogin from './components/SecretAdminLogin'
import CampaignApplicationsReport from './components/admin/CampaignApplicationsReport'
import CampaignFinalReport from './components/admin/CampaignFinalReport'
import MyPageWithPointSystem from './components/MyPageWithPointSystem'
import ApplicationsReportSimple from './components/admin/ApplicationsReportSimple'
import ConfirmedCreatorsReport from './components/admin/ConfirmedCreatorsReport'
import SNSUploadFinalReport from './components/admin/SNSUploadFinalReport'
import JapanWithdrawalRequest from './components/JapanWithdrawalRequest'
import ProfileManagement from './components/ProfileManagement'
import EmailTemplateManager from './components/admin/EmailTemplateManager'
import UserApprovalManager from './components/admin/UserApprovalManager'
import AuthCallbackSafe from './components/AuthCallbackSafe'
import CampaignApplicationWithEmail from './components/CampaignApplicationWithEmail'
import EmailScheduler from './components/EmailScheduler'

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
              <Route path="/" element={<HomePageExactReplica />} />
              
              {/* 인증 관련 */}
              <Route path="/login" element={<LoginPageExactReplica />} />
              <Route path="/signup" element={<SignupPageExactReplica />} />
              <Route path="/auth/callback" element={<AuthCallbackSafe />} />
              
              {/* 사용자 페이지 */}
              <Route path="/mypage" element={<MyPageWithPointSystem />} />
              <Route path="/profile" element={<ProfileManagement />} />
              <Route path="/campaign-application" element={<CampaignApplicationUpdated />} />
              <Route path="/campaign-application-basic" element={<CampaignApplicationWithEmail />} />
              <Route path="/withdrawal" element={<JapanWithdrawalRequest />} />
              <Route path="/japan-bank-transfer" element={<JapanBankTransfer />} />
              <Route path="/email-scheduler" element={<EmailScheduler />} />
              
              {/* 캠페인 보고서 */}
              <Route path="/campaign-report/:campaignId" element={<CampaignReport />} />
              
              {/* 회사별 리포트 (토큰 기반 액세스) */}
              <Route path="/company-report/:companyId" element={<CompanyReport />} />
              
              {/* 관리자 페이지 */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/campaigns" element={<AdminCampaignsWithQuestions />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/admin/company-access" element={<AdminCompanyAccess />} />
              <Route path="/admin/emails" element={<AdminEmailManagement />} />
              <Route path="/admin/test-setup" element={<AdminTestSetup />} />
              <Route path="/admin/campaigns/:campaignId/applications" element={<ApplicationsReportSimple />} />
              <Route path="/admin/campaigns/:campaignId/confirmed" element={<ConfirmedCreatorsReport />} />
              <Route path="/admin/campaigns/:campaignId/report" element={<SNSUploadFinalReport />} />
              <Route path="/admin/email-templates" element={<EmailTemplateManager />} />
              <Route path="/admin/user-approval" element={<UserApprovalManager />} />
              
              {/* 숨겨진 관리자 로그인 */}
              <Route path="/secret-admin-portal-cnec-2024" element={<SecretAdminLogin />} />
              
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
