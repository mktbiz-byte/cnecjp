import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, ArrowLeft } from 'lucide-react'

const LoginPage = () => {
  const { signInWithEmail, signInWithGoogle, loading } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname || '/mypage'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      setError(language === 'ko'
        ? '이메일과 비밀번호를 입력해주세요.'
        : 'メールアドレスとパスワードを入力してください。'
      )
      return
    }

    try {
      setIsLoading(true)
      setError('')

      await signInWithEmail(formData.email, formData.password)
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login error:', error)

      let errorMessage = error.message
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = language === 'ko'
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : 'メールアドレスまたはパスワードが正しくありません。'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = language === 'ko'
          ? '이메일 인증이 필요합니다. 이메일을 확인해주세요.'
          : 'メール認証が必要です。メールを確認してください。'
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError('')

      await signInWithGoogle()
    } catch (error) {
      console.error('Google login error:', error)
      setError(language === 'ko'
        ? '구글 로그인에 실패했습니다. 다시 시도해주세요.'
        : 'Googleログインに失敗しました。再度お試しください。'
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 bg-white/80 border-gray-200 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'ko' ? '홈으로 돌아가기' : 'ホームに戻る'}
          </Button>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center pb-6">
            <div className="text-4xl mb-4">🎬</div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {language === 'ko' ? '다시 오신 것을 환영합니다' : 'おかえりなさい'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {language === 'ko' ? 'CNEC Japan 계정으로 로그인' : 'CNEC Japanアカウントでログイン'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading || loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 font-semibold py-6"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {language === 'ko' ? 'Google로 계속하기' : 'Googleで続ける'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  {language === 'ko' ? '또는 이메일로 계속하기' : 'またはメールで続ける'}
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  {language === 'ko' ? '이메일 주소' : 'メールアドレス'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={language === 'ko' ? 'your@email.com' : 'your@email.com'}
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pl-10 py-6 border-gray-200 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  {language === 'ko' ? '비밀번호' : 'パスワード'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pl-10 py-6 border-gray-200 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {language === 'ko' ? '로그인 중...' : 'ログイン中...'}
                  </>
                ) : (
                  language === 'ko' ? '로그인' : 'ログイン'
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                {language === 'ko' ? '계정이 없으신가요?' : 'アカウントをお持ちでないですか？'}{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                >
                  {language === 'ko' ? '무료 회원가입' : '無料で新規登録'}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            {language === 'ko'
              ? '로그인함으로써 이용약관 및 개인정보처리방침에 동의합니다'
              : 'ログインすることで利用規約とプライバシーポリシーに同意したものとみなされます'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
