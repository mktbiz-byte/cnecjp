import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useTranslation } from 'react-i18next';

// 기존 컴포넌트
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
import ConfirmedCreatorsReport from './components/admin/ConfirmedCreatorsReport';
import SNSUploadFinalReport from './components/admin/SNSUploadFinalReport';
import CampaignReport from './components/admin/CampaignReport';
import EmailTemplateManager from './components/admin/EmailTemplateManager';
import UserApprovalManagerEnhanced from './components/admin/UserApprovalManagerEnhanced';
import AdminWithdrawals from './components/admin/AdminWithdrawals';
import SystemSettings from './components/admin/SystemSettings';
import SecretAdminLogin from './components/SecretAdminLogin';
import TestAdminLogin from './components/TestAdminLogin';

// 기업 관련 컴포넌트
import CorporateLoginPage from './components/corporate/CorporateLoginPage';
import CorporateSignupPage from './components/corporate/CorporateSignupPage';
import CorporateDashboard from './components/corporate/CorporateDashboard';
import CorporateOrderList from './components/corporate/CorporateOrderList';
import CorporateOrderCreate from './components/corporate/CorporateOrderCreate';
import CorporateOrderDetail from './components/corporate/CorporateOrderDetail';
import CorporateCreatorList from './components/corporate/CorporateCreatorList';
import CorporateGuideManagement from './components/corporate/CorporateGuideManagement';

// 관리자 컴포넌트
import AdminLayout from './components/admin/AdminLayout';
import CorporateAccountsManager from './components/admin/CorporateAccountsManager';
import CorporateOrdersManager from './components/admin/CorporateOrdersManager';
import GuideTemplatesManager from './components/admin/GuideTemplatesManager';

function App() {
  const { t, i18n } = useTranslation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션 상태 확인
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // 초기 세션 확인
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  // 언어 설정
  useEffect(() => {
    const lang = localStorage.getItem('language') || 'ja';
    i18n.changeLanguage(lang);
  }, [i18n]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 공통 페이지 */}
        <Route path="/" element={<HomePageExactReplica />} />
        <Route path="/login" element={<LoginPageExactReplica />} />
        <Route path="/signup" element={<SignupPageExactReplica />} />
        <Route path="/auth/callback" element={<AuthCallbackSafe />} />
        
        {/* 사용자 페이지 */}
        <Route path="/campaign-application" element={<CampaignApplicationPage />} />
        <Route path="/mypage" element={<MyPageWithWithdrawal />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/paypal-withdrawal" element={<PayPalWithdrawal />} />
        <Route path="/company-report/:campaignId" element={<CompanyReport />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        
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

        {/* 기업 페이지 */}
        <Route path="/corporate/login" element={<CorporateLoginPage />} />
        <Route path="/corporate/signup" element={<CorporateSignupPage />} />
        <Route
          path="/corporate/dashboard"
          element={session ? <CorporateDashboard /> : <Navigate to="/corporate/login" />}
        />
        <Route
          path="/corporate/orders"
          element={session ? <CorporateOrderList /> : <Navigate to="/corporate/login" />}
        />
        <Route
          path="/corporate/orders/create"
          element={session ? <CorporateOrderCreate /> : <Navigate to="/corporate/login" />}
        />
        <Route
          path="/corporate/orders/:orderId"
          element={session ? <CorporateOrderDetail /> : <Navigate to="/corporate/login" />}
        />
        <Route
          path="/corporate/creators"
          element={session ? <CorporateCreatorList /> : <Navigate to="/corporate/login" />}
        />
        <Route
          path="/corporate/guides"
          element={session ? <CorporateGuideManagement /> : <Navigate to="/corporate/login" />}
        />

        {/* 기업 관리자 페이지 */}
        <Route
          path="/admin/corporate-accounts"
          element={session ? <AdminLayout><CorporateAccountsManager /></AdminLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/corporate-orders"
          element={session ? <AdminLayout><CorporateOrdersManager /></AdminLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/guide-templates"
          element={session ? <AdminLayout><GuideTemplatesManager /></AdminLayout> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
