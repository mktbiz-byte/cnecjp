import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { auth } from '../lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const AuthCallback = () => {
  const { user } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL에서 인증 정보 처리
        const result = await auth.getSession()
        
        if (!result || result.error) {
          console.error('Auth callback error:', result?.error)
          setStatus('error')
          setMessage(language === 'ko' 
            ? '로그인 처리 중 오류가 발생했습니다.'
            : 'ログイン処理中にエラーが発生しました。'
          )
          return
        }

        const { data } = result

        if (data && data.session) {
          setStatus('success')
          setMessage(language === 'ko' 
            ? '로그인이 완료되었습니다. 잠시 후 홈페이지로 이동합니다.'
            : 'ログインが完了しました。しばらくしてホームページに移動します。'
          )
          
          // 2초 후 홈페이지로 리다이렉트
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 2000)
        } else {
          setStatus('error')
          setMessage(language === 'ko' 
            ? '로그인 정보를 찾을 수 없습니다.'
            : 'ログイン情報が見つかりません。'
          )
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(language === 'ko' 
          ? '로그인 처리 중 오류가 발생했습니다.'
          : 'ログイン処理中にエラーが発生しました。'
        )
      }
    }

    handleAuthCallback()
  }, [language, navigate])

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (user && status === 'loading') {
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
                {language === 'ko' ? '로그인 처리 중...' : 'ログイン処理中...'}
              </h2>
              <p className="text-gray-600">
                {language === 'ko' 
                  ? '잠시만 기다려주세요.'
                  : 'しばらくお待ちください。'
                }
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {language === 'ko' ? '로그인 성공!' : 'ログイン成功！'}
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {language === 'ko' ? '로그인 실패' : 'ログイン失敗'}
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                {language === 'ko' ? '다시 로그인' : '再ログイン'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthCallback
