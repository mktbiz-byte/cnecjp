import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePageExactReplica from './components/HomePageExactReplica'
import LoginPageExactReplica from './components/LoginPageExactReplica'
import SignupPageExactReplica from './components/SignupPageExactReplica'
import CampaignApplicationPage from './components/CampaignApplicationPage'
import MyPageWithWithdrawal from './components/MyPageWithWithdrawal'
import PayPalWithdrawal from './components/PayPalWithdrawal'
import JapanWithdrawalRequest from './components/JapanWithdrawalRequest'
import ProfileManagement from './components/ProfileManagement'
import AuthCallbackSafe from './components/AuthCallbackSafe'
import ProfileSettings from './components/ProfileSettings'
import AdminDashboardSimple from './components/admin/AdminDashboardSimple'
import AdminCampaignsWithQuestions from './components/admin/AdminCampaignsWithQuestions'
import CampaignCreationWithTranslator from './components/admin/CampaignCreationWithTranslator'
import ApplicationsReportSimple_final from './components/admin/ApplicationsReportSimple_final'
import ConfirmedCreatorsReport_multilingual from './components/admin/ConfirmedCreatorsReport_multilingual'
import SNSUploadFinalReport_multilingual from './components/admin/SNSUploadFinalReport_multilingual'
import CampaignReportEnhanced from './components/admin/CampaignReportEnhanced'
import EmailTemplateManager from './components/admin/EmailTemplateManager'
import EmailSettings from './components/admin/EmailSettings'
import UserApprovalManagerEnhanced from './components/admin/UserApprovalManagerEnhanced'
import AdminWithdrawals from './components/admin/AdminWithdrawals'
import SecretAdminLogin from './components/SecretAdminLogin'
import CampaignApplicationUpdated from './components/CampaignApplicationUpdated'
import TestAdminLogin from './components/TestAdminLogin'
import VideoSubmissionTracker from './components/VideoSubmissionTracker'
import CompanyReport_multilingual from './components/CompanyReport_multilingual'
import SystemSettings from './components/admin/SystemSettings'
import i18n from './lib/i18n'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  // 언어 변경 이벤트 리스너
  useEffect(() => {
    const handleLanguageChange = (e) => {
      setLanguage(e.detail.language);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 공개 페이지 */}
          <Route path="/" element={<HomePageExactReplica />} />
          <Route path="/login" element={<LoginPageExactReplica />} />
          <Route path="/signup" element={<SignupPageExactReplica />} />
          <Route path="/auth/callback" element={<AuthCallbackSafe />} />
          <Route path="/admin/login" element={<SecretAdminLogin />} />
          <Route path="/admin/test-login" element={<TestAdminLogin />} />
          
          {/* 회사 보고서 (다국어 지원) */}
          <Route path="/company/:campaignId/report" element={<CompanyReport_multilingual />} />
          
          {/* 사용자 페이지 */}
          <Route path="/campaigns/:campaignId/apply" element={<CampaignApplicationPage />} />
          <Route path="/campaigns/:campaignId/apply-updated" element={<CampaignApplicationUpdated />} />
          <Route path="/mypage" element={<MyPageWithWithdrawal />} />
          <Route path="/withdrawal/paypal" element={<PayPalWithdrawal />} />
          <Route path="/withdrawal/japan" element={<JapanWithdrawalRequest />} />
          <Route path="/profile" element={<ProfileManagement />} />
          <Route path="/settings" element={<ProfileSettings />} />
          <Route path="/video-submission/:applicationId" element={<VideoSubmissionTracker />} />
          
          {/* 관리자 페이지 */}
          <Route path="/admin" element={<AdminDashboardSimple />} />
          <Route path="/admin/campaigns" element={<AdminCampaignsWithQuestions />} />
          <Route path="/admin/campaigns/create" element={<CampaignCreationWithTranslator />} />
          <Route path="/admin/campaigns/:campaignId/edit" element={<CampaignCreationWithTranslator />} />
          <Route path="/admin/campaigns/:campaignId/applications" element={<ApplicationsReportSimple_final />} />
          <Route path="/admin/campaigns/:campaignId/confirmed" element={<ConfirmedCreatorsReport_multilingual />} />
          <Route path="/admin/campaigns/:campaignId/sns-uploads" element={<SNSUploadFinalReport_multilingual />} />
          <Route path="/admin/campaigns/:campaignId/report" element={<CampaignReportEnhanced />} />
          <Route path="/admin/email-templates" element={<EmailTemplateManager />} />
          <Route path="/admin/email-settings" element={<EmailSettings />} />
          <Route path="/admin/system-settings" element={<SystemSettings />} />
          <Route path="/admin/users" element={<UserApprovalManagerEnhanced />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          
          {/* 다국어 지원 보고서 페이지 (campaignId 없이 전체 보기) */}
          <Route path="/admin/confirmed-creators" element={<ConfirmedCreatorsReport_multilingual />} />
          <Route path="/admin/sns-uploads" element={<SNSUploadFinalReport_multilingual />} />
          
          {/* 기본 리디렉션 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
