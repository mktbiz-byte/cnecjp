import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react'

const SignupPage = () => {
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
      return language === 'ko' 
        ? '모든 필드를 입력해주세요.'
        : 'すべてのフィールドを入力してください。'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return language === 'ko' 
        ? '올바른 이메일 형식을 입력해주세요.'
        : '正しいメール形式を入力してください。'
    }

    if (formData.password.length < 6) {
      return language === 'ko' 
        ? '비밀번호는 6자 이상이어야 합니다.'
        : 'パスワードは6文字以上である必要があります。'
    }

    if (formData.password !== formData.confirmPassword) {
      return language === 'ko' 
        ? '비밀번호가 일치하지 않습니다.'
        : 'パスワードが一致しません。'
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      setError('')

      await signUpWithEmail(formData.email, formData.password, {
        name: formData.name
      })
      
      setSuccess(true)
    } catch (error) {
      console.error('Signup error:', error)
      
      if (error.message.includes('already registered')) {
        setError(language === 'ko' 
          ? '이미 등록된 이메일입니다.'
          : 'すでに登録されているメールアドレスです。'
        )
      } else if (error.message.includes('weak password')) {
        setError(language === 'ko' 
          ? '비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.'
          : 'パスワードが弱すぎます。より強いパスワードを使用してください。'
        )
      } else {
        setError(language === 'ko' 
          ? '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.'
          : '会員登録中にエラーが発生しました。再度お試しください。'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setLoading(true)
      setError('')
      
      await signInWithGoogle()
    } catch (error) {
      console.error('Google signup error:', error)
      setError(language === 'ko' 
        ? 'Google 회원가입 중 오류가 발생했습니다.'
        : 'Google会員登録中にエラーが発生しました。'
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto text-center shadow-xl border-0">
          <CardContent className="pt-8">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {language === 'ko' ? '이메일 확인 필요' : 'メール確認が必要です'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'ko' 
                ? '회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.'
                : '会員登録が完了しました！メールを確認してアカウントを有効化してください。'
              }
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/login')} className="w-full bg-purple-600 hover:bg-purple-700">
                {language === 'ko' ? '로그인 페이지로' : 'ログインページへ'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                {language === 'ko' ? '홈으로 돌아가기' : 'ホームに戻る'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'ko' ? '홈으로' : 'ホームへ'}
          </Button>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {language === 'ko' ? '회원가입' : '会員登録'}
            </CardTitle>
            <CardDescription>
              {language === 'ko' 
                ? 'CNEC Japan에 가입하여 캠페인에 참여하세요'
                : 'CNEC Japanに登録してキャンペーンに参加しましょう'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Google 회원가입 */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {language === 'ko' ? 'Google로 회원가입' : 'Googleで会員登録'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  {language === 'ko' ? '또는' : 'または'}
                </span>
              </div>
            </div>

            {/* 이메일 회원가입 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {language === 'ko' ? '이름' : '名前'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={language === 'ko' ? '이름을 입력하세요' : '名前を入力してください'}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {language === 'ko' ? '이메일' : 'メールアドレス'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={language === 'ko' ? '이메일을 입력하세요' : 'メールアドレスを入力してください'}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {language === 'ko' ? '비밀번호' : 'パスワード'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={language === 'ko' ? '비밀번호를 입력하세요' : 'パスワードを入力してください'}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {language === 'ko' ? '비밀번호 확인' : 'パスワード確認'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={language === 'ko' ? '비밀번호를 다시 입력하세요' : 'パスワードを再入力してください'}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {language === 'ko' ? '회원가입' : '会員登録'}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              {language === 'ko' ? '이미 계정이 있으신가요?' : 'すでにアカウントをお持ちですか？'}{' '}
              <Link to="/login" className="text-purple-600 hover:underline font-medium">
                {language === 'ko' ? '로그인' : 'ログイン'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SignupPage
