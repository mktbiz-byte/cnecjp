import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react'

const SignupPage = () => {
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const { language, t } = useLanguage()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEmailSignup = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.name) {
      setError(language === 'ko'
        ? '모든 필수 항목을 입력해주세요.'
        : 'すべての必須項目を入力してください。'
      )
      return
    }

    if (formData.password.length < 6) {
      setError(language === 'ko'
        ? '비밀번호는 6자 이상이어야 합니다.'
        : 'パスワードは6文字以上である必要があります。'
      )
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'ko'
        ? '비밀번호가 일치하지 않습니다.'
        : 'パスワードが一致しません。'
      )
      return
    }

    try {
      setIsLoading(true)
      setError('')

      await signUpWithEmail(formData.email, formData.password, {
        name: formData.name,
        platform_region: 'jp',
        country_code: 'JP'
      })

      setSuccess(true)
    } catch (error) {
      console.error('Signup error:', error)

      let errorMessage = error.message
      if (error.message.includes('already registered')) {
        errorMessage = language === 'ko'
          ? '이미 등록된 이메일입니다. 로그인을 시도해주세요.'
          : 'すでに登録されているメールアドレスです。ログインしてください。'
      } else if (error.message.includes('Invalid email')) {
        errorMessage = language === 'ko'
          ? '올바른 이메일 주소를 입력해주세요.'
          : '正しいメールアドレスを入力してください。'
      } else if (error.message.includes('weak password')) {
        errorMessage = language === 'ko'
          ? '비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.'
          : 'パスワードが弱すぎます。より強いパスワードを使用してください。'
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true)
      setError('')

      await signInWithGoogle()
    } catch (error) {
      console.error('Google signup error:', error)
      setError(language === 'ko'
        ? 'Google 회원가입에 실패했습니다. 다시 시도해주세요.'
        : 'Google会員登録に失敗しました。再度お試しください。'
      )
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center bg-white/80 backdrop-blur-md rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {language === 'ko' ? '이메일을 확인해주세요!' : 'メールをご確認ください！'}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === 'ko'
              ? `${formData.email}로 인증 링크를 보냈습니다. 받은편지함을 확인하고 링크를 클릭하여 계정을 활성화해주세요.`
              : `${formData.email}に確認リンクを送信しました。受信トレイを確認し、リンクをクリックしてアカウントを有効化してください。`
            }
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {language === 'ko' ? '로그인 페이지로 이동' : 'ログインページへ'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-md transition-colors"
            >
              {language === 'ko' ? '홈으로 돌아가기' : 'ホームに戻る'}
            </button>
          </div>
        </div>
      </div>
    )
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

        {/* Signup Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center pb-6">
            <div className="text-4xl mb-4">🎬</div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {language === 'ko' ? 'CNEC Japan에 가입하기' : 'CNEC Japanに参加する'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {language === 'ko' ? '크리에이터 여정을 시작하세요' : 'クリエイターの旅を始めましょう'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Google Signup Button */}
            <Button
              onClick={handleGoogleSignup}
              disabled={isLoading}
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
                  {language === 'ko' ? '또는 이메일로 가입하기' : 'またはメールで登録'}
                </span>
              </div>
            </div>

            {/* Email Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  {language === 'ko' ? '이름 *' : '名前 *'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={language === 'ko' ? '이름을 입력하세요' : '名前を入力してください'}
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pl-10 py-6 border-gray-200 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  {language === 'ko' ? '이메일 주소 *' : 'メールアドレス *'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
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
                  {language === 'ko' ? '비밀번호 *' : 'パスワード *'}
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
                <p className="text-xs text-gray-500">
                  {language === 'ko' ? '최소 6자 이상' : '6文字以上'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  {language === 'ko' ? '비밀번호 확인 *' : 'パスワード確認 *'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pl-10 py-6 border-gray-200 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {language === 'ko' ? '계정 생성 중...' : 'アカウント作成中...'}
                  </>
                ) : (
                  language === 'ko' ? '계정 만들기' : 'アカウント作成'
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                {language === 'ko' ? '이미 계정이 있으신가요?' : 'すでにアカウントをお持ちですか？'}{' '}
                <Link
                  to="/login"
                  className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                >
                  {language === 'ko' ? '로그인' : 'ログイン'}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            {language === 'ko'
              ? '계정을 생성함으로써 이용약관 및 개인정보처리방침에 동의합니다'
              : 'アカウントを作成することで利用規約とプライバシーポリシーに同意したものとみなされます'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
