import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, Lock, Mail, Eye, EyeOff } from 'lucide-react'

const SecretAdminLogin = () => {
  const { signInWithEmail, user, loading } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // 이미 로그인된 사용자는 관리자 페이지로 리다이렉트
  useEffect(() => {
    if (user) {
      navigate('/admin')
    }
  }, [user, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      await signInWithEmail(formData.email, formData.password)
      
      // 로그인 성공 시 관리자 페이지로 이동
      navigate('/admin')
      
    } catch (error) {
      console.error('Admin login error:', error)
      setError('로그인에 실패했습니다. 관리자 계정 정보를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-md">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Shield className="h-8 w-8 text-purple-300" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              관리자 인증
            </CardTitle>
            <CardDescription className="text-purple-200">
              CNEC 플랫폼 관리자 전용 로그인
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-200">
                  관리자 이메일
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@cnec.test"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/10 border-purple-300/30 text-white placeholder:text-purple-200/60 focus:border-purple-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-200">
                  관리자 비밀번호
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-white/10 border-purple-300/30 text-white placeholder:text-purple-200/60 focus:border-purple-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-purple-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-400/30">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                관리자 로그인
              </Button>
            </form>

            {/* 테스트 계정 정보 (개발용) */}
            <div className="mt-8 p-4 bg-purple-600/20 rounded-lg border border-purple-400/30">
              <h4 className="text-sm font-semibold text-purple-200 mb-2">테스트 계정</h4>
              <div className="text-xs text-purple-300 space-y-1">
                <div>이메일: admin@cnec.test</div>
                <div>비밀번호: cnec2024!</div>
              </div>
            </div>

            {/* 보안 경고 */}
            <div className="text-center text-xs text-purple-300/60">
              <p>이 페이지는 관리자 전용입니다.</p>
              <p>무단 접근 시 법적 책임을 질 수 있습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SecretAdminLogin
