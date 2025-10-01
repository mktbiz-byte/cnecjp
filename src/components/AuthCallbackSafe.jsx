import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const AuthCallbackSafe = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started')
        
        // URL 파라미터에서 인증 정보 확인
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        if (error) {
          console.error('OAuth error:', error, errorDescription)
          setStatus('error')
          setMessage('ログイン中にエラーが発生しました: ' + (errorDescription || error))
          return
        }

        // Supabase에서 세션 확인
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Session error:', sessionError)
            setStatus('error')
            setMessage('セッション取得中にエラーが発生しました')
            return
          }

          if (sessionData?.session) {
            console.log('Session found:', sessionData.session.user.email)
            setStatus('success')
            setMessage('ログインが完了しました。ホームページに移動します。')
            
            // 관리자인지 확인하고 적절한 페이지로 리다이렉트
            const userEmail = sessionData.session.user.email
            const isAdmin = userEmail?.includes('mkt_biz@cnec.co.kr') || userEmail?.includes('admin@cnec.test')
            
            setTimeout(() => {
              if (isAdmin) {
                navigate('/dashboard', { replace: true })
              } else {
                navigate('/', { replace: true })
              }
            }, 2000)
          } else {
            console.log('No session found, checking URL hash')
            
            // URL 해시에서 토큰 확인 (OAuth 리다이렉트 후)
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const hashAccessToken = hashParams.get('access_token')
            
            if (hashAccessToken) {
              console.log('Found access token in hash')
              setStatus('success')
              setMessage('ログインが完了しました。ホームページに移動します。')
              
              // 관리자 여부 확인을 위해 세션 재확인
              setTimeout(async () => {
                try {
                  const { data: newSession } = await supabase.auth.getSession()
                  const userEmail = newSession?.session?.user?.email
                  const isAdmin = userEmail?.includes('mkt_biz@cnec.co.kr') || userEmail?.includes('admin@cnec.test')
                  
                  if (isAdmin) {
                    navigate('/dashboard', { replace: true })
                  } else {
                    navigate('/', { replace: true })
                  }
                } catch (error) {
                  console.error('Session recheck error:', error)
                  navigate('/', { replace: true })
                }
              }, 2000)
            } else {
              console.log('No authentication data found')
              setStatus('error')
              setMessage('認証情報が見つかりません。再度ログインしてください。')
            }
          }
        } catch (sessionError) {
          console.error('Session check error:', sessionError)
          setStatus('error')
          setMessage('セッション確認中にエラーが発生しました')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('ログイン処理中に予期しないエラーが発生しました')
      }
    }

    // 컴포넌트 마운트 시 인증 콜백 처리
    handleAuthCallback()
  }, [navigate])

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (user && status === 'loading') {
      console.log('User already logged in, redirecting to home')
      navigate('/', { replace: true })
    }
  }, [user, status, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                ログイン処理中...
              </h2>
              <p className="text-gray-600">
                しばらくお待ちください。
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                ログイン成功！
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                ログイン失敗
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  再ログイン
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ホームに戻る
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthCallbackSafe
