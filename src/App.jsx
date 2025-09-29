import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';

// 모든 페이지 컴포넌트 import
import HomePageExactReplica from './components/HomePageExactReplica';
import LoginPageExactReplica from './components/LoginPageExactReplica';
import SignupPageExactReplica from './components/SignupPageExactReplica';
import CampaignApplicationUpdated from './components/CampaignApplicationUpdated';
import MyPageWithPointSystem from './components/MyPageWithPointSystem';
import JapanWithdrawalRequest from './components/JapanWithdrawalRequest';
import ProfileManagement from './components/ProfileManagement';
import ProfileSettings from './components/ProfileSettings';
import AuthCallbackSafe from './components/AuthCallbackSafe';

// 관리자 컴포넌트
import AdminDashboardSimple from './components/admin/AdminDashboardSimple';
import AdminCampaignsWithQuestions from './components/admin/AdminCampaignsWithQuestions';
import ApplicationsReportSimple from './components/admin/ApplicationsReportSimple';
import ConfirmedCreatorsReport from './components/admin/ConfirmedCreatorsReport';
import SNSUploadFinalReport from './components/admin/SNSUploadFinalReport';
import EmailTemplateManager from './components/admin/EmailTemplateManager';
import UserApprovalManager from './components/admin/UserApprovalManager';
import AdminWithdrawals from './components/admin/AdminWithdrawals';
import SystemSettings from './components/admin/SystemSettings';
import SecretAdminLogin from './components/SecretAdminLogin';
import TestAdminLogin from './components/TestAdminLogin';

function App() {
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
        <Route path="/campaign-application" element={<CampaignApplicationUpdated />} />
        <Route path="/mypage" element={<MyPageWithPointSystem />} />
        <Route path="/withdrawal" element={<JapanWithdrawalRequest />} />
        <Route path="/profile" element={<ProfileManagement />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        
        {/* 관리자 페이지 */}
        <Route path="/secret-admin-login" element={<SecretAdminLogin />} />
        <Route path="/test-admin-login" element={<TestAdminLogin />} />
        <Route path="/admin" element={<AdminDashboardSimple />} />
        <Route path="/admin/campaigns" element={<AdminCampaignsWithQuestions />} />
        <Route path="/admin/applications" element={<ApplicationsReportSimple />} />
        <Route path="/admin/confirmed-creators" element={<ConfirmedCreatorsReport />} />
        <Route path="/admin/sns-uploads" element={<SNSUploadFinalReport />} />
        <Route path="/admin/email-templates" element={<EmailTemplateManager />} />
        <Route path="/admin/user-approval" element={<UserApprovalManager />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
        <Route path="/admin/system-settings" element={<SystemSettings />} />
      </Routes>
    </div>
  );
};

export default App;
