import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const TestAdminLogin = () => {
  const [email, setEmail] = useState('admin@cnec.test')
  const [password, setPassword] = useState('cnec2024!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signInWithEmail } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signInWithEmail(email, password)
      navigate('/dashboard')
    } catch (error) {
      console.error('로그인 오류:', error)
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">테스트 관리자 로그인</CardTitle>
          <CardDescription>
            CNEC 플랫폼 관리자 테스트 로그인
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                관리자 이메일
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cnec.test"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                관리자 비밀번호
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '관리자 로그인'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>테스트 계정:</p>
            <p>이메일: admin@cnec.test</p>
            <p>비밀번호: cnec2024!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TestAdminLogin
