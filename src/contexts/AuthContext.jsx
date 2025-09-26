import { createContext, useContext, useState, useEffect } from 'react'
import { auth, database } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      try {
        const session = await auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
          await checkAdminStatus(session.user.email)
        }
      } catch (error) {
        console.error('Initial session error:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
        await checkAdminStatus(session.user.email)
      } else {
        setUser(null)
        setUserProfile(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 사용자 프로필 로드
  const loadUserProfile = async (userId) => {
    try {
      const profile = await database.userProfiles.get(userId)
      setUserProfile(profile)
    } catch (error) {
      console.error('Load user profile error:', error)
    }
  }

  // 관리자 권한 확인
  const checkAdminStatus = async (email) => {
    // 관리자 이메일 목록
    const adminEmails = [
      'mkt_biz@cnec.co.kr',
      'admin@cnec.co.kr',
      'test@cnec.co.kr' // 테스트용
    ]
    
    const isAdminUser = adminEmails.includes(email)
    setIsAdmin(isAdminUser)
    console.log('Admin status:', isAdminUser, 'for email:', email)
  }

  // 구글 로그인
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const result = await auth.signInWithGoogle()
      return result
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 이메일 로그인
  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true)
      const result = await auth.signInWithEmail(email, password)
      return result
    } catch (error) {
      console.error('Email sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 이메일 회원가입
  const signUpWithEmail = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      const result = await auth.signUpWithEmail(email, password, userData)
      
      // 사용자 프로필 생성
      if (result.user) {
        await database.userProfiles.upsert({
          user_id: result.user.id,
          email: result.user.email,
          ...userData
        })
      }
      
      return result
    } catch (error) {
      console.error('Email sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // 프로필 업데이트
  const updateProfile = async (profileData) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      const updatedProfile = await database.userProfiles.upsert({
        user_id: user.id,
        email: user.email,
        ...profileData
      })
      
      setUserProfile(updatedProfile)
      return updatedProfile
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    isAdmin,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    loadUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
