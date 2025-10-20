import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, userProfile, loading: authLoading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkAdminStatus = async () => {
      // AuthContext가 로딩 중이면 대기
      if (authLoading) {
        console.log('AuthContext 로딩 중...')
        return
      }

      // 사용자가 없으면 체크 완료
      if (!user) {
        console.log('사용자 없음 - 로그인 필요')
        setChecking(false)
        return
      }

      // 관리자 권한이 필요하지 않으면 체크 완료
      if (!requireAdmin) {
        console.log('관리자 권한 불필요 - 접근 허용')
        setChecking(false)
        return
      }

      // 관리자 권한 확인 시작
      console.log('=== 관리자 권한 확인 시작 ===')
      console.log('User ID:', user.id)
      console.log('User Email:', user.email)
      
      try {
        // 방법 1: AuthContext의 userProfile 사용 (가장 빠름)
        if (userProfile) {
          console.log('AuthContext userProfile 발견:', userProfile)
          if (userProfile.role === 'admin' || userProfile.is_admin === true) {
            console.log('✅ AuthContext에서 관리자 확인됨')
            setIsAdmin(true)
            setChecking(false)
            return
          }
        }

        // 방법 2: 직접 Supabase 쿼리 (RLS 우회를 위해 여러 방법 시도)
        console.log('직접 Supabase 쿼리 시도...')
        
        // 2-1: user_id로 조회
        let { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profileError) {
          console.error('user_id 조회 오류:', profileError)
        } else if (profile) {
          console.log('user_id로 프로필 발견:', profile)
          if (profile.role === 'admin' || profile.is_admin === true) {
            console.log('✅ user_id 쿼리에서 관리자 확인됨')
            setIsAdmin(true)
            setChecking(false)
            return
          }
        }

        // 2-2: email로 조회 (백업)
        if (!profile) {
          console.log('email로 재시도:', user.email)
          const { data: profileByEmail, error: emailError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', user.email)
            .maybeSingle()

          if (emailError) {
            console.error('email 조회 오류:', emailError)
          } else if (profileByEmail) {
            console.log('email로 프로필 발견:', profileByEmail)
            if (profileByEmail.role === 'admin' || profileByEmail.is_admin === true) {
              console.log('✅ email 쿼리에서 관리자 확인됨')
              setIsAdmin(true)
              setChecking(false)
              return
            }
          }
          
          profile = profileByEmail
        }

        // 프로필을 찾았지만 관리자가 아닌 경우
        if (profile) {
          console.log('❌ 프로필 발견했으나 관리자 아님:', {
            role: profile.role,
            is_admin: profile.is_admin
          })
          setIsAdmin(false)
          setChecking(false)
          return
        }

        // 프로필을 찾지 못한 경우
        console.warn('⚠️ 프로필을 찾을 수 없음 - 관리자 아님으로 처리')
        setIsAdmin(false)
        setChecking(false)

      } catch (error) {
        console.error('관리자 권한 확인 중 예외 발생:', error)
        setError(error.message)
        setIsAdmin(false)
        setChecking(false)
      }
    }

    checkAdminStatus()
  }, [user, userProfile, authLoading, requireAdmin])

  // AuthContext 로딩 중이거나 권한 확인 중
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
          {requireAdmin && (
            <p className="text-gray-500 text-sm mt-2">Checking admin permissions...</p>
          )}
        </div>
      </div>
    )
  }

  // 로그인하지 않은 경우
  if (!user) {
    console.log('🔒 로그인 필요 - /login으로 리디렉션')
    return <Navigate to="/login" replace />
  }

  // 관리자 권한이 필요한데 관리자가 아닌 경우
  if (requireAdmin && !isAdmin) {
    console.log('🚫 관리자 권한 없음 - Access Denied 표시')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-2">
            You do not have permission to access this page. This page is only available to administrators.
          </p>
          {error && (
            <p className="text-red-500 text-sm mb-4 font-mono bg-red-50 p-2 rounded">
              Error: {error}
            </p>
          )}
          <div className="text-xs text-gray-500 mb-6 bg-gray-50 p-3 rounded">
            <p className="font-semibold mb-1">Debug Info:</p>
            <p>Email: {user?.email}</p>
            <p>User ID: {user?.id?.substring(0, 8)}...</p>
            <p>Profile Loaded: {userProfile ? 'Yes' : 'No'}</p>
            {userProfile && (
              <>
                <p>Role: {userProfile.role || 'none'}</p>
                <p>Is Admin: {userProfile.is_admin ? 'true' : 'false'}</p>
              </>
            )}
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // 권한이 있는 경우 자식 컴포넌트 렌더링
  console.log('✅ 접근 허용 - 컴포넌트 렌더링')
  return children
}

export default ProtectedRoute

