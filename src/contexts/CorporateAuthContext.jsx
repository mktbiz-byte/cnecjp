'''
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
      } catch (error) {
        console.error("Error in getSession catch:", error);
        setCorporateUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const account = await loadCorporateAccount(session.user.email);
        if (account) {
          setCorporateUser(session.user);
          localStorage.setItem('corporate_user', 'true');
        } 
      } else if (event === 'SIGNED_OUT') {
        setCorporateUser(null);
        setCorporateAccount(null);
        clearCorporateCookies();
        localStorage.removeItem('corporate_user');
      } else if (event === 'TOKEN_REFRESHED') {
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

  const clearCorporateCookies = () => {
    try {
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name && name.startsWith('corporate_')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('corporate_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing corporate cookies:", error);
    }
  };

  const loadCorporateAccount = async (email) => {
    try {
      const { data, error } = await supabase
        .from('corporate_accounts')
        .select('*')
        .eq('email', email)
        .single();
      if (error) {
        setCorporateAccount(null);
        return null;
      }
      setCorporateAccount(data);
      return data;
    } catch (error) {
      setCorporateAccount(null);
      return null;
    }
  };

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
      if (error) throw error;
      setCorporateAccount(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      await supabase.auth.signOut();
      clearCorporateCookies();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const account = await loadCorporateAccount(email);
      if (!account) {
        await supabase.auth.signOut();
        clearCorporateCookies();
        throw new Error("기업 계정이 존재하지 않습니다.");
      }
      localStorage.setItem('corporate_user', 'true');
      if (data.session?.access_token) {
        localStorage.setItem('corporate_auth_token', data.session.access_token);
        document.cookie = `corporate_token=${data.session.access_token}; path=/; max-age=86400`;
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, companyData) => {
    try {
      await supabase.auth.signOut();
      clearCorporateCookies();
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
      if (error) throw error;

      const { error: corporateError } = await supabase
        .from('corporate_accounts')
        .insert({
          email: email,
          company_name: companyData.company_name,
          is_approved: true // Automatic approval
        });
      if (corporateError) throw corporateError;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      clearCorporateCookies();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCorporateUser(null);
      setCorporateAccount(null);
      localStorage.removeItem('corporate_user');
      localStorage.removeItem('corporate_auth_token');
      window.location.href = '/corporate';
    } catch (error) {
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
'''
