import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CorporateAuthContext = createContext();

export const CorporateAuthProvider = ({ children }) => {
  const [corporateUser, setCorporateUser] = useState(null);
  const [corporateAccount, setCorporateAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          setCorporateUser(null);
        } else {
          console.log("Corporate session check:", session?.user?.email);
          
          // 기업 계정 확인
          if (session?.user) {
            const account = await loadCorporateAccount(session.user.email);
            if (account) {
              setCorporateUser(session.user);
              // 기업 사용자임을 나타내는 로컬 스토리지 설정
              localStorage.setItem('corporate_user', 'true');
            } else {
              // 기업 계정이 없는 경우 corporateUser는 null로 설정
              setCorporateUser(null);
              localStorage.removeItem('corporate_user');
            }
          } else {
            setCorporateUser(null);
            localStorage.removeItem('corporate_user');
          }
        }
      } catch (error) {
        console.error("Error in getSession catch:", error);
        setCorporateUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Corporate auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // 기업 계정 확인
        const account = await loadCorporateAccount(session.user.email);
        if (account) {
          setCorporateUser(session.user);
          // 기업 사용자임을 나타내는 로컬 스토리지 설정
          localStorage.setItem('corporate_user', 'true');
        } else {
          // 기업 계정이 없는 경우 corporateUser는 null로 설정
          setCorporateUser(null);
          localStorage.removeItem('corporate_user');
        }
      } else if (event === 'SIGNED_OUT') {
        setCorporateUser(null);
        setCorporateAccount(null);
        clearCorporateCookies();
        localStorage.removeItem('corporate_user');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed for corporate user");
        // 토큰 갱신 시에도 기업 계정 확인
        if (session?.user) {
          const account = await loadCorporateAccount(session.user.email);
          if (account) {
            setCorporateUser(session.user);
            localStorage.setItem('corporate_user', 'true');
          } else {
            setCorporateUser(null);
            localStorage.removeItem('corporate_user');
          }
        } else {
          setCorporateUser(null);
          localStorage.removeItem('corporate_user');
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 기업 전용 쿠키 정리 함수
  const clearCorporateCookies = () => {
    try {
      // 기업 관련 쿠키만 삭제
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name && name.startsWith('corporate_')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
      
      // 기업 관련 로컬 스토리지 항목 삭제
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('corporate_')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log("Corporate cookies and storage cleared");
    } catch (error) {
      console.error("Error clearing corporate cookies:", error);
    }
  };

  // 기업 계정 정보 로드 함수
  const loadCorporateAccount = async (email) => {
    try {
      const { data, error } = await supabase
        .from('corporate_accounts')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        console.error("Error loading corporate account:", error);
        setCorporateAccount(null);
        return null;
      }
      
      console.log("Corporate account loaded:", data);
      setCorporateAccount(data);
      return data;
    } catch (error) {
      console.error("Error in loadCorporateAccount:", error);
      setCorporateAccount(null);
      return null;
    }
  };

  // 기업 계정 정보 업데이트 함수
  const updateCorporateAccount = async (accountData) => {
    try {
      if (!corporateUser) throw new Error("User not authenticated");
      if (!corporateAccount) throw new Error("Corporate account not found");
      
      const { data, error } = await supabase
        .from('corporate_accounts')
        .update(accountData)
        .eq('id', corporateAccount.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating corporate account:", error);
        throw error;
      }
      
      setCorporateAccount(data);
      return data;
    } catch (error) {
      console.error("Error in updateCorporateAccount:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      // 먼저 기존 세션 정리
      await supabase.auth.signOut();
      clearCorporateCookies();
      
      // 로그인 시도
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Email sign in error:", error);
        throw error;
      }
      
      // 기업 계정 확인
      const account = await loadCorporateAccount(email);
      if (!account) {
        // 기업 계정이 없으면 로그아웃
        await supabase.auth.signOut();
        clearCorporateCookies();
        throw new Error("기업 계정이 존재하지 않습니다.");
      }
      
      // 승인 상태 확인
      if (!account.is_approved) {
        // 승인되지 않은 계정이면 로그아웃
        await supabase.auth.signOut();
        clearCorporateCookies();
        throw new Error("기업 계정이 아직 승인되지 않았습니다. 관리자에게 문의하세요.");
      }
      
      // 기업 사용자임을 나타내는 로컬 스토리지 설정
      localStorage.setItem('corporate_user', 'true');
      
      // 기업 전용 토큰 저장 (일반 사용자 토큰과 구분)
      if (data.session?.access_token) {
        localStorage.setItem('corporate_auth_token', data.session.access_token);
        document.cookie = `corporate_token=${data.session.access_token}; path=/; max-age=86400`;
      }
      
      return data;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, companyData) => {
    try {
      // 먼저 기존 세션 정리
      await supabase.auth.signOut();
      clearCorporateCookies();
      
      // 1. 사용자 계정 생성
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'corporate',
            company_name: companyData.company_name
          }
        }
      });
      
      if (error) {
        console.error("Email sign up error:", error);
        throw error;
      }
      
      // 2. 기업 계정 정보 저장
      const { error: corporateError } = await supabase
        .from('corporate_accounts')
        .insert({
          email: email,
          company_name: companyData.company_name,
          business_registration_number: companyData.business_registration_number,
          representative_name: companyData.representative_name,
          phone_number: companyData.phone_number,
          address: companyData.address,
          is_approved: false // 기본적으로 승인되지 않은 상태로 시작
        });
      
      if (corporateError) {
        console.error("Corporate account creation error:", corporateError);
        // 사용자 계정은 생성되었지만 기업 정보 저장에 실패한 경우
        throw corporateError;
      }
      
      return data;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // 기업 관련 쿠키 및 스토리지 정리
      clearCorporateCookies();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      
      setCorporateUser(null);
      setCorporateAccount(null);
      localStorage.removeItem('corporate_user');
      localStorage.removeItem('corporate_auth_token');
      
      // 기업 페이지로 리디렉션
      window.location.href = '/corporate';
    } catch (error) {
      console.error("Sign out error:", error);
      setCorporateUser(null);
      setCorporateAccount(null);
      throw error;
    }
  };

  const isAuthenticated = !!corporateUser && !!corporateAccount;

  const value = {
    corporateUser,
    corporateAccount,
    loading,
    isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateCorporateAccount,
    loadCorporateAccount
  };

  return <CorporateAuthContext.Provider value={value}>{children}</CorporateAuthContext.Provider>;
};

export const useCorporateAuth = () => {
  const context = useContext(CorporateAuthContext);
  if (!context) {
    throw new Error('useCorporateAuth must be used within a CorporateAuthProvider');
  }
  return context;
};
