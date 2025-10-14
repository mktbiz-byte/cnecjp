'''
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
// import { AuthProvider } from './contexts/AuthContext'; // AuthProvider를 주석 처리
import { CorporateAuthProvider } from './contexts/CorporateAuthContext';

// ... (기존 컴포넌트 import는 그대로 유지)

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
import CorporateLayout from './components/corporate/CorporateLayout';
import CorporateDashboard from './components/corporate/CorporateDashboard';


function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    // <AuthProvider>
      <CorporateAuthProvider>
        <Router>
          <Routes>
            {/* 공통 페이지 */}
            <Route path="/" element={<HomePageExactReplica />} />
            <Route path="/login" element={<LoginPageExactReplica />} />
            <Route path="/signup" element={<SignupPageExactReplica />} />
            <Route path="/auth/callback" element={<AuthCallbackSafe />} />
            
            {/* 사용자 페이지 (일시적으로 비활성화 또는 접근 제한 필요) */}
            <Route path="/campaign-application" element={<div>페이지 준비 중</div>} />
            <Route path="/mypage" element={<div>페이지 준비 중</div>} />
            {/* ... 기타 사용자 페이지 ... */}

            {/* 관리자 페이지 (일시적으로 비활성화 또는 접근 제한 필요) */}
            <Route path="/admin" element={<div>페이지 준비 중</div>} />
            {/* ... 기타 관리자 페이지 ... */}

            {/* 기업 페이지 */}
            <Route path="/corporate/login" element={<CorporateLoginPage />} />
            <Route path="/corporate/signup" element={<CorporateSignupPage />} />
            <Route path="/corporate" element={<CorporateLayout />}>
              <Route path="dashboard" element={<CorporateDashboard />} />
            </Route>

            {/* 임시: 다른 모든 경로를 홈으로 리디렉션 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </CorporateAuthProvider>
    // </AuthProvider>
  );
}

export default App;
'''
