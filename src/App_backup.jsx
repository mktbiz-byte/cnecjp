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
import CompanyReport from './components/CompanyReport';
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
import ApplicationsReportSimple from './components/admin/ApplicationsReportSimple';
import ConfirmedCreatorsReport from './components/admin/ConfirmedCreatorsReport'
import SNSUploadFinalReport from './components/admin/SNSUploadFinalReport'
import CampaignReport from './components/admin/CampaignReport'
import EmailTemplateManager from './components/admin/EmailTemplateManager';
import UserApprovalManagerEnhanced from './components/admin/UserApprovalManagerEnhanced';
import AdminWithdrawals from './components/admin/AdminWithdrawals';
import SystemSettings from './components/admin/SystemSettings';
import SecretAdminLogin from './components/SecretAdminLogin';
import TestAdminLogin from './components/TestAdminLogin';

function App() {
  useEffect(() => {
    // 이메일 스케줄러 시작
    emailScheduler.start();
    
    // 컴포넌트 언마운트 시 스케줄러 중지
    return () => {
      emailScheduler.stop();
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <MainContent />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

const MainContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<HomePageExactReplica />} />
        
        {/* 인증 관련 */}
        <Route path="/login" element={<LoginPageExactReplica />} />
        <Route path="/signup" element={<SignupPageExactReplica />} />
        <Route path="/auth/callback" element={<AuthCallbackSafe />} />
        
        {/* 사용자 페이지 */}
        <Route path="/campaign-application" element={<CampaignApplicationUpdated />}         <Route path="/mypage" element={<MyPageWithWithdrawal />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/paypal-withdrawal" element={<PayPalWithdrawal />} />
        <Route path="/company-report/:campaignId" element={<CompanyReport />} />       <Route path="/profile-settings" element={<ProfileSettings />} />
        
        {/* 관리자 페이지 */}
        <Route path="/secret-admin-login" element={<SecretAdminLogin />} />
        <Route path="/test-admin-login" element={<TestAdminLogin />} />
        <Route path="/admin" element={<AdminDashboardSimple />} />
        <Route path="/admin/campaigns" element={<AdminCampaignsWithQuestions />} />
        <Route path="/admin/campaign-create" element={<CampaignCreationWithTranslator />} />
        <Route path="/admin/applications" element={<ApplicationsReportSimple />} />
        <Route path="/admin/confirmed-creators" element={<ConfirmedCreatorsReport />} />
        <Route path="/admin/confirmed-creators/:campaignId" element={<ConfirmedCreatorsReport />} />
        <Route path="/admin/sns-uploads" element={<SNSUploadFinalReport />} />
        <Route path="/admin/sns-uploads/:campaignId" element={<SNSUploadFinalReport />} />
        <Route path="/admin/campaign-report/:campaignId" element={<CampaignReport />} />
        <Route path="/admin/email-templates" element={<EmailTemplateManager />} />
        <Route path="/admin/users" element={<UserApprovalManagerEnhanced />} />
        <Route path="/admin/user-approval" element={<UserApprovalManagerEnhanced />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
        <Route path="/admin/system-settings" element={<SystemSettings />} />
      </Routes>
    </div>
  );
};

export default App;
