import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import emailScheduler from './lib/emailScheduler';
import './App.css';

// 모든 페이지 컴포넌트 import
import HomePageExactReplica from './components/HomePageExactReplica';
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
import SNSUploadFinalReport_multilingual from './components/admin/SNSUploadFinalReport_multilingual';
import ConfirmedCreatorsNew from './components/admin/ConfirmedCreatorsNew';
import SNSUploadNew from './components/admin/SNSUploadNew';
import CampaignReportEnhanced from './components/admin/CampaignReportEnhanced';
import EmailTemplateManager from './components/admin/EmailTemplateManager';
import UserApprovalManagerEnhanced from './components/admin/UserApprovalManagerEnhanced';
import AdminWithdrawals from './components/admin/AdminWithdrawals';
import SystemSettings from './components/admin/SystemSettings';
import EmailSettings from './components/admin/EmailSettings';

// 테스트용 관리자 로그인 컴포넌트
import SecretAdminLogin from './components/SecretAdminLogin';
import TestAdminLogin from './components/TestAdminLogin';
import CampaignApplicationUpdated from './components/CampaignApplicationUpdated';

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
        <Route path="/" element={<HomePageExactReplica />} />
        
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
        
        {/* 관리자 페이지 */}
        <Route path="/secret-admin-login" element={<SecretAdminLogin />} />
        <Route path="/test-admin-login" element={<TestAdminLogin />} />
        <Route path="/admin" element={<AdminDashboardSimple />} />
        <Route path="/admin/campaigns" element={<AdminCampaignsWithQuestions />} />
        <Route path="/admin/campaign-create" element={<CampaignCreationWithTranslator />} />
        <Route path="/admin/applications" element={<ApplicationsReportSimple />} />
        <Route path="/admin/confirmed-creators" element={<ConfirmedCreatorsReport_multilingual />} />
        <Route path="/admin/confirmed-creators/:campaignId" element={<ConfirmedCreatorsNew />} />
        <Route path="/admin/sns-uploads" element={<SNSUploadNew />} />
        <Route path="/admin/sns-uploads/:campaignId" element={<SNSUploadNew />} />
        <Route path="/admin/campaign-report/:campaignId" element={<CampaignReportEnhanced />} />
        <Route path="/admin/email-templates" element={<EmailTemplateManager />} />
        <Route path="/admin/users" element={<UserApprovalManagerEnhanced />} />
        <Route path="/admin/user-approval" element={<UserApprovalManagerEnhanced />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
        <Route path="/admin/system-settings" element={<SystemSettings />} />
        <Route path="/admin/email-settings" element={<EmailSettings />} />
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
