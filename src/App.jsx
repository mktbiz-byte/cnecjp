import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import emailScheduler from './lib/emailScheduler';
import './App.css';

// 모든 페이지 컴포넌트 import
import HomePageJP from './components/HomePageJP';
import LoginPageExactReplica from './components/LoginPageExactReplica';
import SignupPageExactReplica from './components/SignupPageExactReplica';
import CampaignApplicationPage from './components/CampaignApplicationPage';
// import CompanyReport from './components/CompanyReport';
// import CompanyReport from './components/CompanyReport_fixed';
import CompanyReport_multilingual from './components/admin/CompanyReport_multilingual';
import CompanyReportNew from './components/CompanyReportNew';
import MyPageWithWithdrawal from './components/MyPageWithWithdrawal';
import PayPalWithdrawal from './components/PayPalWithdrawal';
import JapanWithdrawalRequest from './components/JapanWithdrawalRequest';
import ProfileManagement from './components/ProfileManagement';
import ProfileSettings from './components/ProfileSettings';
import AuthCallbackSafe from './components/AuthCallbackSafe';

// 관리자 컴포넌트
import AdminDashboardSimple from './components/admin/AdminDashboardSimple';
import AdminCampaignsWithQuestions from './components/admin/AdminCampaignsWithQuestions';
import CampaignCreationWithTranslator from './components/admin/CampaignCreationWithTranslator';
// import ApplicationsReportSimple from './components/admin/ApplicationsReportSimple';
// import ApplicationsReportSimple from './components/admin/ApplicationsReportSimple_fixed_detail';
// import ApplicationsReportSimple from './components/admin/ApplicationsReportSimple_fixed_detail_improved';
import ApplicationsReportSimple from './components/admin/ApplicationsReportSimple_final';
// import ConfirmedCreatorsReport from './components/admin/ConfirmedCreatorsReport';
// import SNSUploadFinalReport from './components/admin/SNSUploadFinalReport';
import ConfirmedCreatorsReport_multilingual from './components/admin/ConfirmedCreatorsReport_multilingual';
import AdminConfirmedCreators from './components/admin/AdminConfirmedCreators';
import SNSUploadFinalReport_multilingual from './components/admin/SNSUploadFinalReport_multilingual';
import ConfirmedCreatorsNew from './components/admin/ConfirmedCreatorsNew';
import SNSUploadNew from './components/admin/SNSUploadNew';
import CampaignReportEnhanced from './components/admin/CampaignReportEnhanced';
import EmailTemplateManager from './components/admin/EmailTemplateManager';
import UserApprovalManagerEnhanced from './components/admin/UserApprovalManagerEnhanced';
import AdminWithdrawals from './components/admin/AdminWithdrawals';
import SystemSettings from './components/admin/SystemSettings';
import EmailSettings from './components/admin/EmailSettings';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

// 테스트용 관리자 로그인 컴포넌트
import SecretAdminLogin from './components/SecretAdminLogin';
import TestAdminLogin from './components/TestAdminLogin';
import CampaignApplicationUpdated from './components/CampaignApplicationUpdated';
import ProtectedRoute from './components/ProtectedRoute';

// 다국어 지원 초기화
import i18n from './lib/i18n';

const AppContent = () => {
  const { user } = useAuth();

  useEffect(() => {
    // 이메일 스케줄러 시작
    emailScheduler.start();
    
    // 컴포넌트 언마운트 시 스케줄러 중지
    return () => {
      emailScheduler.stop();
    };
  }, []);

  return (
    <div className="App">
      <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<HomePageJP />} />
        
        {/* 인증 관련 */}
        <Route path="/login" element={<LoginPageExactReplica />} />
        <Route path="/signup" element={<SignupPageExactReplica />} />
        <Route path="/auth/callback" element={<AuthCallbackSafe />} />
        
        {/* 사용자 페이지 */}
        <Route path="/campaign-application" element={<CampaignApplicationUpdated />} />
        <Route path="/mypage" element={<MyPageWithWithdrawal />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/paypal-withdrawal" element={<PayPalWithdrawal />} />
        <Route path="/company-report/:campaignId" element={<CompanyReportNew />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        
        {/* 관리자 페이지 - 보안을 위해 /admin/ 경로 제거 */}
        <Route path="/secret-admin-login" element={<SecretAdminLogin />} />
        <Route path="/test-admin-login" element={<TestAdminLogin />} />
        <Route path="/dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboardSimple /></ProtectedRoute>} />
        <Route path="/campaigns-manage" element={<ProtectedRoute requireAdmin={true}><AdminCampaignsWithQuestions /></ProtectedRoute>} />
        <Route path="/campaign-create" element={<ProtectedRoute requireAdmin={true}><CampaignCreationWithTranslator /></ProtectedRoute>} />
        <Route path="/applications-manage" element={<ProtectedRoute requireAdmin={true}><ApplicationsReportSimple /></ProtectedRoute>} />
        <Route path="/applications-report" element={<ProtectedRoute requireAdmin={true}><ApplicationsReportSimple /></ProtectedRoute>} />
        <Route path="/confirmed-creators" element={<ProtectedRoute requireAdmin={true}><AdminConfirmedCreators /></ProtectedRoute>} />
        <Route path="/confirmed-creators/:campaignId" element={<ProtectedRoute requireAdmin={true}><ConfirmedCreatorsNew /></ProtectedRoute>} />
        <Route path="/sns-uploads" element={<ProtectedRoute requireAdmin={true}><SNSUploadNew /></ProtectedRoute>} />
        <Route path="/sns-uploads/:campaignId" element={<ProtectedRoute requireAdmin={true}><SNSUploadNew /></ProtectedRoute>} />
        <Route path="/campaign-report/:campaignId" element={<ProtectedRoute requireAdmin={true}><CampaignReportEnhanced /></ProtectedRoute>} />
        <Route path="/email-templates" element={<ProtectedRoute requireAdmin={true}><EmailTemplateManager /></ProtectedRoute>} />
        <Route path="/users-manage" element={<ProtectedRoute requireAdmin={true}><UserApprovalManagerEnhanced /></ProtectedRoute>} />
        <Route path="/user-approval" element={<ProtectedRoute requireAdmin={true}><UserApprovalManagerEnhanced /></ProtectedRoute>} />
        <Route path="/withdrawals-manage" element={<ProtectedRoute requireAdmin={true}><AdminWithdrawals /></ProtectedRoute>} />
        <Route path="/system-settings" element={<ProtectedRoute requireAdmin={true}><SystemSettings /></ProtectedRoute>} />
        <Route path="/email-settings" element={<ProtectedRoute requireAdmin={true}><EmailSettings /></ProtectedRoute>} />
        
        {/* 개인정보처리방침 */}
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* 이용약관 */}
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
