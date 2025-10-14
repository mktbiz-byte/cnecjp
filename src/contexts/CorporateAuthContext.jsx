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
          console.log("Session loaded:", session?.user?.email);
          setCorporateUser(session?.user ?? null);
          
          // 기업 계정 정보 로드
          if (session?.user) {
            loadCorporateAccount(session.user.email);
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
        setCorporateUser(session.user);
        
        // 기업 계정 정보 로드
        loadCorporateAccount(session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setCorporateUser(null);
        setCorporateAccount(null);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
        setCorporateUser(session?.user ?? null);
      } else {
        setCorporateUser(session?.user ?? null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

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
        throw new Error("기업 계정이 존재하지 않습니다.");
      }
      
      // 승인 상태 확인
      if (!account.is_approved) {
        // 승인되지 않은 계정이면 로그아웃
        await supabase.auth.signOut();
        throw new Error("기업 계정이 아직 승인되지 않았습니다. 관리자에게 문의하세요.");
      }
      
      return data;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, companyData) => {
    try {
      // 1. 사용자 계정 생성
      const { data, error } = await supabase.auth.signUp({
        email,
        password
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
        // 이 경우 관리자가 수동으로 처리해야 할 수 있음
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      setCorporateUser(null);
      setCorporateAccount(null);
    } catch (error) {
      console.error("Sign out error:", error);
      setCorporateUser(null);
      setCorporateAccount(null);
      throw error;
    }
  };

  const value = {
    corporateUser,
    corporateAccount,
    loading,
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
