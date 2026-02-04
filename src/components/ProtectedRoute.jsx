import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, userProfile, loading: authLoading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return

      if (!user) {
        setChecking(false)
        return
      }

      if (!requireAdmin) {
        setChecking(false)
        return
      }

      try {
        // AuthContext의 userProfile 사용
        if (userProfile) {
          if (userProfile.role === 'admin' || userProfile.is_admin === true) {
            setIsAdmin(true)
            setChecking(false)
            return
          }
        }

        // user_id로 조회
        let { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, is_admin')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!profileError && profile) {
          if (profile.role === 'admin' || profile.is_admin === true) {
            setIsAdmin(true)
            setChecking(false)
            return
          }
        }

        // email로 조회 (백업)
        if (!profile) {
          const { data: profileByEmail } = await supabase
            .from('user_profiles')
            .select('role, is_admin')
            .eq('email', user.email)
            .maybeSingle()

          if (profileByEmail) {
            if (profileByEmail.role === 'admin' || profileByEmail.is_admin === true) {
              setIsAdmin(true)
              setChecking(false)
              return
            }
          }
        }

        setIsAdmin(false)
        setChecking(false)

      } catch (error) {
        console.error('Admin check failed')
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
    return <Navigate to="/login" replace />
  }

  // 관리자 권한이 필요한데 관리자가 아닌 경우
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this page. This page is only available to administrators.
          </p>
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

  return children
}

export default ProtectedRoute
